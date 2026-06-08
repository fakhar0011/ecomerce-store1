import { Request, Response } from "express";
import OrderModel from "../models/Order";
import ProductModel from "../models/Product";
import { getIO } from "../socket";
import AdminNotification from "../models/AdminNotification";

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Get My Orders (User)
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const getMyOrders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const orders = await OrderModel.find({ userId: req.user?.id });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Orders not found" });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Get Single Order
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await OrderModel.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ success: false, message: "my order" });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Create Order with admin notification
// ━━━━━━━━━━━━━━━━━━━━━━━━━
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

    // Update stock
    for (const item of items) {
      await ProductModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // 1. Real‑time notification to online admins (WebSocket)
    const io = getIO();
    io.to("admin").emit("order-status", {
      title: "🆕 New Order!",
      message: `Order #${order._id.toString().slice(-6)} has been placed by user ${req.user?.id.slice(-6)}.`,
      type: "info",
      orderId: order._id,
    });
    // console.log(
    //   `📢 Real‑time notification sent to online admins for order ${order._id}`,
    // );

    //  2. Save notification to database for offline admins
    await AdminNotification.create({
      orderId: order._id,
      message: `New order #${order._id.toString().slice(-6)} placed by user ${req.user?.id.slice(-6)}.`,
    });
    // console.log(
    //   `💾 Admin notification saved to database for order ${order._id}`,
    // );

    res
      .status(201)
      .json({ success: true, message: "Order Created", data: order });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ success: false, message: "Order not created" });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Get All Orders (Admin)
// ━━━━━━━━━━━━━━━━━━━━━━━━━

export const getAllOrders = async (req: Request, res: Response) => {
  console.log("🔵 [REAL getAllOrders] START");
  try {
    const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
    console.log(`✅ Found ${orders.length} orders`);
    res.json({ success: true, data: orders });
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Update Order Status (Admin) with User Notification
// ━━━━━━━━━━━━━━━━━━━━━━━━━
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
    ] as const;
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

    // ✅ Send real-time notification to the user
    const io = getIO();
    const statusInfo = {
      pending: {
        title: "Order Pending",
        message: "Your order has been received and is pending.",
        type: "info",
      },
      processing: {
        title: "Order Processing",
        message: "Your order is now being processed.",
        type: "info",
      },
      shipped: {
        title: "Order Shipped",
        message: "Your order has been shipped! 🚚",
        type: "info",
      },
      delivered: {
        title: "Order Delivered",
        message: "Your order has been delivered. Enjoy! ✅",
        type: "success",
      },
      cancelled: {
        title: "Order Cancelled",
        message: "Your order has been cancelled. ❌",
        type: "error",
      },
    };
    const notif = statusInfo[status as keyof typeof statusInfo];
    if (notif) {
      io.to(order.userId).emit("order-status", {
        title: notif.title,
        message: notif.message,
        type: notif.type,
        orderId: order._id,
      });
      // console.log(
      //   `📢 Status notification sent to user ${order.userId}: ${status}`,
      // );
    }

    res
      .status(200)
      .json({ success: true, message: "Status updated", data: order });
  } catch (error) {
    // console.error("Update order status error:", error);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};
