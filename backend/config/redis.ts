import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
  },
});

redisClient.on("error", (err) => console.error(" Redis Error:", err));
redisClient.on("connect", () => console.log(" Redis connected"));

export default redisClient;
