// import { RateLimiterMemory } from "rate-limiter-flexible";

// export const authLimiter = new RateLimiterMemory({
//     points: 10,
//     duration: 60,
//     blockDuration: 60,
// });

// export const apiLimiter = new RateLimiterMemory({
//     points: 30,
//     duration: 60,
//     blockDuration: 30,
// });

// export const uploadLimiter = new RateLimiterMemory({
//     points: 5,
//     duration: 60,
//     blockDuration: 120,
// });

// export async function rateLimit(
//     limiter: RateLimiterMemory,
//     ip: string
// ): Promise<{ success: boolean; remainingPoints?: number; msBeforeNext?: number }> {
//     try {
//         const result = await limiter.consume(ip);
//         return {
//             success: true,
//             remainingPoints: result.remainingPoints,
//         };
//     } catch (error: any) {
//         return {
//             success: false,
//             msBeforeNext: error.msBeforeNext,
//         };
//     }
// }
