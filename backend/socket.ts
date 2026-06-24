// backend/socket.ts
import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import UserModel from "./models/User";
let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: { origin: "http://localhost:3000", credentials: true },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
      };
      const user = await UserModel.findById(decoded.id);
      if (!user) return next(new Error("User not found"));
      socket.data.userId = decoded.id;
      socket.data.userRole = user.role;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `🔌 User connected: ${socket.data.userId} (${socket.data.userRole})`,
    );
    // Join user's personal room
    socket.join(socket.data.userId);
    // Admin users join the 'admin' room
    if (socket.data.userRole === "admin") {
      socket.join("admin");
    }

    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${socket.data.userId}`);
    });
  });

  console.log("Socket.IO server ready");
  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};
