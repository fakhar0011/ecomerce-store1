// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { connectDB } from "@/lib/mongodb";
// import ProductModel from "@/models/Product";
// import { apiLimiter, rateLimit } from "@/lib/rateLimiter";
// import { getIP } from "@/lib/getIP";

// // Cart MongoDB mein nahi — Session mein store hogi
// // Lekin products validate karne ke liye DB use karenge

// // GET — Cart products validate karo
// export async function GET(req: NextRequest): Promise<NextResponse> {
//   try {
//     // ✅ Rate Limiting
//     const ip = getIP(req);
//     const rateLimitResult = await rateLimit(apiLimiter, ip);
//     if (!rateLimitResult.success) {
//       const waitSeconds = Math.ceil(
//         (rateLimitResult.msBeforeNext || 60000) / 1000,
//       );
//       return NextResponse.json(
//         {
//           error: `Too many requests! Please try again in ${waitSeconds} seconds.`,
//         },
//         { status: 429 },
//       );
//     }

//     // ✅ Auth Check — login zaroori
//     const session = await getServerSession(authOptions);
//     if (!session?.user) {
//       return NextResponse.json(
//         { error: "Please login first" },
//         { status: 401 },
//       );
//     }

//     // ✅ URL se product IDs nikalo
//     const { searchParams } = new URL(req.url);
//     const ids = searchParams.get("ids");

//     if (!ids) {
//       return NextResponse.json({ products: [] });
//     }

//     await connectDB();

//     const idArray = ids.split(",");
//     const products = await ProductModel.find({
//       _id: { $in: idArray },
//     });

//     return NextResponse.json({ products });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// // POST — Cart item validate karo
// export async function POST(req: NextRequest): Promise<NextResponse> {
//   try {
//     // ✅ Rate Limiting
//     const ip = getIP(req);
//     const rateLimitResult = await rateLimit(apiLimiter, ip);
//     if (!rateLimitResult.success) {
//       const waitSeconds = Math.ceil(
//         (rateLimitResult.msBeforeNext || 60000) / 1000,
//       );
//       return NextResponse.json(
//         {
//           error: `Too many requests! Please try again in ${waitSeconds} seconds.`,
//         },
//         { status: 429 },
//       );
//     }

//     // ✅ Auth Check
//     const session = await getServerSession(authOptions);
//     if (!session?.user) {
//       return NextResponse.json(
//         { error: "Please login first" },
//         { status: 401 },
//       );
//     }

//     await connectDB();

//     const { productId, quantity } = await req.json();

//     // ✅ Validation
//     if (!productId) {
//       return NextResponse.json(
//         { error: "Product ID is required" },
//         { status: 400 },
//       );
//     }

//     if (!quantity || quantity < 1) {
//       return NextResponse.json(
//         { error: "Quantity must be at least 1" },
//         { status: 400 },
//       );
//     }

//     // ✅ Product exist karta hai?
//     const product = await ProductModel.findById(productId);
//     if (!product) {
//       return NextResponse.json({ error: "Product not found" }, { status: 404 });
//     }

//     // ✅ Stock check
//     if (product.stock < quantity) {
//       return NextResponse.json(
//         {
//           error: `Only ${product.stock} units of "${product.name}" are available`,
//         },
//         { status: 400 },
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       product: {
//         _id: product._id,
//         name: product.name,
//         price: product.price,
//         image: product.image,
//         stock: product.stock,
//       },
//     });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
