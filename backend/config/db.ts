import mongoose from "mongoose";
import dns from "dns";
import { env } from "./env";

dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) {
    console.log(" MongoDB already connected");
    return;
  }

  try {
    console.log(" Connecting to MongoDB Atlas...");

    const conn = await mongoose.connect(env.MONGODB_URI, {
      bufferCommands: false,
    });

    isConnected = true;

    console.log(` MongoDB Connected: successfully`);

    // Connection events
    mongoose.connection.on("disconnected", () => {
      console.log(" MongoDB disconnected");
      isConnected = false;
    });

    mongoose.connection.on("error", (err) => {
      console.error(" MongoDB error:", err);
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log(" MongoDB reconnected");
      isConnected = true;
    });
  } catch (error: any) {
    console.error(" MongoDB connection failed:", error.message);
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log(" MongoDB disconnected");
};
