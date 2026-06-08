import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import { uploadLimiter, rateLimit } from "@/lib/rateLimiter";
import { getIP } from "@/lib/getIP";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // ✅ Rate Limiting — sabse pehle
    const ip = getIP(req);
    const rateLimitResult = await rateLimit(uploadLimiter, ip);

    if (!rateLimitResult.success) {
      const waitSeconds = Math.ceil(
        (rateLimitResult.msBeforeNext || 60000) / 1000
      );
      return NextResponse.json(
        { error: `Too much uploads! ${waitSeconds} seconds remaining.` },
        { status: 429 }
      );
    }

    // ✅ ImageKit Keys Check
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
      return NextResponse.json(
        { error: "ImageKit keys are missing in the environment variables." },
        { status: 400 }
      );
    }

    const imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });

    // ✅ File Nikalo
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // ✅ File Type Check
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type "${file.type}" is not allowed. Please use JPG, PNG, WEBP, or AVIF.` },
        { status: 400 }
      );
    }

    // ✅ File Size Check — max 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size cannot be more than 10MB" },
        { status: 400 }
      );
    }

    // ✅ Base64 Convert
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    // ✅ ImageKit Pe Upload
    const uploadResponse = await imagekit.upload({
      file: base64,
      fileName: `${Date.now()}-${file.name.replace(/\s/g, "-")}`,
      folder: "/ecommerce/products",
    });

    console.log("Upload success:", uploadResponse.url);

    return NextResponse.json(
      {
        url: uploadResponse.url,
        fileId: uploadResponse.fileId,
        message: "Image upload successful!",
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Remaining": String(
            rateLimitResult.remainingPoints || 0
          ),
        },
      }
    );

  } catch (error: any) {
    console.error("Upload Error:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}