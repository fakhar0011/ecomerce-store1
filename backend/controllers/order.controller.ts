import { Request, Response } from "express";
import OrderModel from "../models/Order";
import ProductModel from "../models/Product";
import { getIO } from "../socket";
import AdminNotification from "../models/AdminNotification";
import { pubsub } from "../graphql/pubsub";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Get My Orders (Logged‑in User)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getMyOrders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const orders = await OrderModel.find({ userId: req.user?.id })
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Get Single Order
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await OrderModel.findById(req.params.id).lean();
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Get All Orders (Admin only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Create Order (Authenticated User)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const createOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { items, shippingAddress } = req.body;
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );
    const order = await OrderModel.create({
      userId: req.user?.id,
      items,
      shippingAddress,
      totalAmount,
      status: "pending",
    });

    // Update product stock
    for (const item of items) {
      await ProductModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // ========== Real‑time notifications ==========
    // 1. Socket.io (if you still use it)
    const io = getIO();
    io.to("admin").emit("order-status", {
      title: "🆕 New Order!",
      message: `Order #${order._id.toString().slice(-6)} placed by user ${req.user?.id.slice(-6)}.`,
      type: "info",
      orderId: order._id,
    });

    // 2. GraphQL Subscription (publish to admin room)
    await pubsub.publish("ORDER_NOTIFICATION", {
      orderNotification: {
        title: "🆕 New Order!",
        message: `Order #${order._id.toString().slice(-6)} placed by user ${req.user?.id.slice(-6)}`,
        type: "info",
        orderId: order._id,
      },
      userId: null, // admin subscriptions will receive this
    });

    // Persistent admin notification (for offline admins)
    await AdminNotification.create({
      orderId: order._id,
      message: `New order #${order._id.toString().slice(-6)} placed by user ${req.user?.id.slice(-6)}.`,
    });

    res
      .status(201)
      .json({ success: true, message: "Order Created", data: order });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: "Order not created" });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Update Order Status (Admin only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const updateOrderStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status" });
      return;
    }

    const order = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    const statusMessages: Record<string, string> = {
      processing: "Your order is now being processed.",
      shipped: "Your order has been shipped! 🚚",
      delivered: "Your order has been delivered. Enjoy! ✅",
      cancelled: "Your order has been cancelled. ❌",
    };
    if (statusMessages[status]) {
      // ========== Real‑time notifications ==========
      // 1. Socket.io
      const io = getIO();
      io.to(order.userId).emit("order-status", {
        title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: statusMessages[status],
        type: status === "delivered" ? "success" : "info",
        orderId: order._id,
      });

      // 2. GraphQL Subscription (publish to the specific user)
      await pubsub.publish("ORDER_NOTIFICATION", {
        orderNotification: {
          title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: statusMessages[status],
          type: status === "delivered" ? "success" : "info",
          orderId: order._id,
        },
        userId: order.userId,
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Status updated", data: order });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};
