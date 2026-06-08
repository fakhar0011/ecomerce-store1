// import { NextRequest } from "next/server";

// export function getIP(req: NextRequest): string {
//     const forwarded = req.headers.get("x-forwarded-for");
//     if (forwarded) {
//         return forwarded.split(",")[0].trim();
//     }

//     const realIP = req.headers.get("x-real-ip");
//     if (realIP) return realIP;

//     return "127.0.0.1";
// }
