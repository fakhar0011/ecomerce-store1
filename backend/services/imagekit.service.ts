import ImageKit from "imagekit";

// Define a union type for input files
type UploadFileInput =
  | Express.Multer.File
  | { buffer: Buffer; originalname: string; mimetype?: string };

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string,
});

export const uploadImage = async (file: UploadFileInput) => {
  let buffer: Buffer;
  let fileName: string;
  let mimetype: string | undefined;

  // Single check: both types have buffer and originalname
  if (
    file &&
    typeof file === "object" &&
    "buffer" in file &&
    "originalname" in file
  ) {
    buffer = file.buffer;
    fileName = file.originalname;
    mimetype = file.mimetype || "image/jpeg";
  } else {
    throw new Error("Invalid file object");
  }

  try {
    const response = await imagekit.upload({
      file: buffer,
      fileName: `${Date.now()}-${fileName}`,
      folder: "/products",
    });

    return {
      success: true,
      url: response.url,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};
