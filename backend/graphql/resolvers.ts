import UserModel from "../models/User";
import ProductModel from "../models/Product";
import OrderModel from "../models/Order";
import AdminNotificationModel from "../models/AdminNotification";
import UserNotificationModel from "../models/UserNotification";
import { pubsub } from "./pubsub";
import { withFilter } from "graphql-subscriptions";
import jwt from "jsonwebtoken";
import { uploadImage } from "../services/imagekit.service";
import { GraphQLUpload } from "graphql-upload-ts";
import redisClient from "../config/redis";
type Upload = Promise<{
  filename: string;
  mimetype: string;
  createReadStream: () => AsyncIterable<Buffer>;
}>;

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, { expiresIn: "24h" });
};

const handleFileUpload = async (file: Upload): Promise<string> => {
  const { createReadStream, filename, mimetype } = await file;
  const stream = createReadStream();

  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const buffer = Buffer.concat(chunks);

  const result = await uploadImage({
    buffer,
    originalname: filename || "upload.jpg",
    mimetype: mimetype || "image/jpeg",
  });

  if (!result.success || !result.url) {
    throw new Error(result.error || "Image upload failed");
  }
  return result.url;
};

const formatDate = (timestamp: any): string => {
  if (!timestamp) return new Date().toISOString();
  const ts = typeof timestamp === "string" ? parseInt(timestamp) : timestamp;
  if (isNaN(ts)) return new Date().toISOString();
  return new Date(ts).toISOString();
};

export const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    // hello: () => "GraphQL server is running!",

    me: async (_: any, __: any, { user }: any) => {
      if (!user) throw new Error("Not authenticated");
      return await UserModel.findById(user.id).lean();
    },

    products: async () => {
      try {
        const cached = await redisClient.get("products");
        if (cached) {
          console.log("Serving products from Redis cache");
          return JSON.parse(cached);
        }
      } catch (err) {
        console.log("Redis cache miss, fetching from DB");
      }

      const products = await ProductModel.find().sort({ createdAt: -1 }).lean();

      try {
        await redisClient.setEx("products", 60, JSON.stringify(products));
        console.log(` ${products.length} products cached in Redis (TTL: 60s)`);
      } catch (err) {
        console.log("⚠️ Failed to cache products");
      }

      return products;
    },

    product: async (_: any, { id }: { id: string }) =>
      await ProductModel.findById(id).lean(),

    orders: async (_: any, __: any, { user }: any) => {
      if (!user) throw new Error("Not authenticated");

      const filter = user.role === "admin" ? {} : { userId: user.id };

      const orders = await OrderModel.find(filter)
        .sort({ createdAt: -1 })
        .lean();

      // ✅ Log each order's userId to see what's in DB

      return orders.map((order) => ({
        ...order,
        createdAt: formatDate(order.createdAt),
        items: order.items.map((item: any) => ({
          ...item,
          productId: item.productId || "",
        })),
      }));
    },
    order: async (_: any, { id }: { id: string }, { user }: any) => {
      if (!user) throw new Error("Not authenticated");
      const order = await OrderModel.findById(id).lean();
      if (!order) throw new Error("Order not found");
      if (user.role === "admin" || order.userId === user.id) {
        return {
          ...order,
          createdAt: formatDate(order.createdAt),
        };
      }
      throw new Error("Forbidden");
    },

    users: async (_: any, __: any, { user }: any) => {
      if (!user || user.role !== "admin") throw new Error("Unauthorized");
      return await UserModel.find().lean();
    },

    user: async (_: any, { id }: { id: string }, { user }: any) => {
      if (!user || user.role !== "admin") throw new Error("Unauthorized");
      return await UserModel.findById(id).lean();
    },

    adminNotifications: async (_: any, __: any, { user }: any) => {
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      return await AdminNotificationModel.find().sort({ createdAt: -1 }).lean();
    },

    // ✅ Combined notifications for user and admin
    getUserNotifications: async (_: any, __: any, { user }: any) => {
      if (!user) throw new Error("Not authenticated");

      const userNotifs = await UserNotificationModel.find({
        userId: user.id,
      })
        .sort({ createdAt: -1 })
        .lean();

      let adminNotifs: any[] = [];
      if (user.role === "admin") {
        const rawAdminNotifs = await AdminNotificationModel.find()
          .sort({ createdAt: -1 })
          .lean();
        adminNotifs = rawAdminNotifs.map((n) => ({
          _id: n._id,
          userId: user.id,
          orderId: n.orderId,
          title: "New Order",
          message: n.message,
          type: "info",
          read: n.read || false,
          createdAt: n.createdAt,
        }));
      }

      const allNotifs = [...userNotifs, ...adminNotifs];
      allNotifs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return allNotifs.map((notif) => ({
        ...notif,
        createdAt: notif.createdAt
          ? new Date(notif.createdAt).toISOString()
          : new Date().toISOString(),
      }));
    },
  },

  Mutation: {
    signup: async (_: any, { name, email, password, role }: any) => {
      const existing = await UserModel.findOne({ email });
      if (existing) throw new Error("User already exists");
      const user = await UserModel.create({
        name,
        email,
        password,
        role: role || "user",
      });
      const token = generateToken(user._id.toString(), user.role);

      await pubsub.publish("ORDER_NOTIFICATION", {
        orderNotification: {
          title: "Welcome! 🎉",
          message: `Welcome ${user.name}! Thanks for joining MyStore.`,
          type: "success",
        },
        userId: user._id,
      });

      return { token, user };
    },

    login: async (_: any, { email, password }: any) => {
      const user = await UserModel.findOne({ email }).select("+password");
      if (!user) throw new Error("Invalid credentials");
      const isMatch = await user.comparePassword(password);
      if (!isMatch) throw new Error("Invalid credentials");
      const token = generateToken(user._id.toString(), user.role);
      return { token, user };
    },

    // ✅ createOrder with stock validation + admin notification
    createOrder: async (
      _: any,
      { items, shippingAddress }: any,
      { user }: any,
    ) => {
      if (!user) throw new Error("Not authenticated");

      for (const item of items) {
        const product = await ProductModel.findById(item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        if (product.stock < item.quantity) {
          console.error(
            `❌ Insufficient stock for product ${item.productId}. Available: ${product.stock}, Requested: ${item.quantity}`,
          );
          throw new Error(
            `Insufficient stock for product: ${product.name}. Available: ${product.stock}`,
          );
        }
      }

      const totalAmount = items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0,
      );

      const order = await OrderModel.create({
        userId: user.id,
        items,
        shippingAddress,
        totalAmount,
        status: "pending",
      });

      for (const item of items) {
        const updated = await ProductModel.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } },
          { returnDocument: "after" },
        );
      }

      // ✅ Save admin notification
      await AdminNotificationModel.create({
        orderId: order._id,
        message: `New order #${order._id.toString().slice(-6)} placed by ${user.id.slice(-6)}`,
        read: false,
      });

      // ✅ Publish real-time
      const payload = {
        orderNotification: {
          title: "🆕 New Order!",
          message: `Order #${order._id.toString().slice(-6)} placed by user ${user.id.slice(-6)}`,
          type: "info",
          orderId: order._id,
        },
        userId: null,
      };

      await pubsub.publish("ORDER_NOTIFICATION", payload);

      return order;
    },

    updateOrderStatus: async (
      _: any,
      { id, status }: { id: string; status: string },
      { user }: any,
    ) => {
      if (!user || user.role !== "admin")
        throw new Error("Admin access required");

      const order = await OrderModel.findById(id);
      if (!order) throw new Error("Order not found");

      const updatedOrder = await OrderModel.findByIdAndUpdate(
        id,
        { status },
        { new: true },
      ).lean();

      const statusMessages: Record<string, string> = {
        processing: "Your order is now being processed.",
        shipped: "Your order has been shipped! 🚚",
        delivered: "Your order has been delivered. Enjoy! ✅",
        cancelled: "Your order has been cancelled. ❌",
      };

      const message =
        statusMessages[status] || `Order status updated to ${status}`;
      const title = `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`;

      await UserNotificationModel.create({
        userId: order.userId,
        orderId: id,
        title,
        message,
        type: status,
        read: false,
      });

      if (statusMessages[status]) {
        const payload = {
          orderNotification: {
            title: title,
            message: message,
            type: status === "delivered" ? "success" : "info",
            orderId: updatedOrder._id,
          },
          userId: order.userId,
        };

        await pubsub.publish("ORDER_NOTIFICATION", payload);
      }

      return updatedOrder;
    },

    createProduct: async (
      _: any,
      { input, file }: { input: any; file?: Upload },
      { user }: any,
    ) => {
      if (!user || user.role !== "admin") throw new Error("Unauthorized");

      let imageUrl = input.image;
      if (file) {
        imageUrl = await handleFileUpload(file);
      }

      const productInput = { ...input, image: imageUrl };
      const product = await ProductModel.create(productInput);

      await redisClient.del("products");
      console.log("products cache are after cleared");
      return product;
    },

    updateProduct: async (
      _: any,
      { id, input, file }: { id: string; input: any; file?: Upload },
      { user }: any,
    ) => {
      if (!user || user.role !== "admin") throw new Error("Unauthorized");

      let updateData = { ...input };
      if (file) {
        const imageUrl = await handleFileUpload(file);
        updateData.image = imageUrl;
      }

      const updated = await ProductModel.findByIdAndUpdate(id, updateData, {
        new: true,
      }).lean();

      if (!updated) throw new Error("Product not found");

      await redisClient.del("products");
      console.log("Products cache clear after update");
      return updated;
    },

    deleteProduct: async (_: any, { id }: { id: string }, { user }: any) => {
      if (!user || user.role !== "admin") throw new Error("Unauthorized");
      const result = await ProductModel.findByIdAndDelete(id);

      await redisClient.del("products");
      console.log("Products cache clear after delete");
      return !!result;
    },

    markAdminNotificationRead: async (
      _: any,
      { id }: { id: string },
      { user }: any,
    ) => {
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      const notif = await AdminNotificationModel.findByIdAndUpdate(
        id,
        { read: true },
        { new: true },
      ).lean();
      if (!notif) throw new Error("Notification not found");
      return notif;
    },

    markUserNotificationRead: async (
      _: any,
      { id }: { id: string },
      { user }: any,
    ) => {
      if (!user) throw new Error("Not authenticated");

      let notif = null;

      notif = await UserNotificationModel.findOneAndUpdate(
        { _id: id, userId: user.id },
        { read: true },
        { new: true },
      ).lean();

      if (!notif && user.role === "admin") {
        notif = await AdminNotificationModel.findByIdAndUpdate(
          id,
          { read: true },
          { new: true },
        ).lean();

        if (notif) {
          return {
            _id: notif._id,
            userId: user.id,
            orderId: notif.orderId,
            title: "New Order",
            message: notif.message,
            type: "info",
            read: notif.read || false,
            createdAt: notif.createdAt
              ? new Date(notif.createdAt).toISOString()
              : new Date().toISOString(),
          };
        }
      }

      if (!notif) throw new Error("Notification not found");

      return {
        ...notif,
        createdAt: notif.createdAt
          ? new Date(notif.createdAt).toISOString()
          : new Date().toISOString(),
      };
    },
  },

  Subscription: {
    orderNotification: {
      subscribe: withFilter(
        () => {
          return (pubsub as any).asyncIterator("ORDER_NOTIFICATION");
        },
        (payload, variables, context) => {
          const user = context.user;
          if (!user) {
            return false;
          }

          if (user.role === "admin") {
            return true;
          }

          if (payload.userId === null) {
            return true;
          }

          const result = payload.userId === user.id;

          return result;
        },
      ),
    },
  },
};
