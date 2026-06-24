// import { createClient } from "redis";
// import dotenv from "dotenv";
// dotenv.config({ path: "../.env" });

// const redisClient = createClient({
//   url: process.env.REDIS_URL,
//   socket: { tls: true },
// });

// redisClient.on("error", (err) => console.error(" Redis Error:", err));
// redisClient.on("connect", () => console.log(" Redis connected"));

// async function simpleTest() {
//   try {
//     await redisClient.connect();

//     const key = "test-key";
//     const value = { message: "Hello Redis!" };

//     // Set data
//     await redisClient.set(key, JSON.stringify(value));
//     console.log(" Data set in Redis");

//     // Get data
//     const result = await redisClient.get(key);
//     if (result) {
//       const parsed = JSON.parse(result);
//       console.log(" Data retrieved from Redis:", parsed);
//     }

//     // Delete
//     await redisClient.del(key);
//     // console.log(" Data deleted from Redis");
//   } catch (err) {
//     console.error(" Error:", err);
//   } finally {
//     await redisClient.quit();
//     console.log("🔌 Disconnected");
//   }
// }

// simpleTest();
