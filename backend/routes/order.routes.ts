import { Router } from "express";
import {
  getMyOrders,
  getOrder,
  createOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller";
import {
  getAdminNotifications,
  markAdminNotificationRead,
} from "../controllers/adminNotification.controller";
import authMiddleware from "../middlewares/auth";
import { adminOnly } from "../middlewares/admin";

const router = Router();

// User Routes
router.get("/my-orders", authMiddleware, getMyOrders);
router.post("/", authMiddleware, createOrder);

// Admin Routes
router.get("/admin", authMiddleware, adminOnly, getAllOrders);
router.put("/:id/status", authMiddleware, adminOnly, updateOrderStatus);
router.get("/:id", authMiddleware, getOrder);

// Admin Notification Routes
router.get(
  "/admin/notifications",
  authMiddleware,
  adminOnly,
  getAdminNotifications,
);
router.put(
  "/admin/notifications/:id/read",
  authMiddleware,
  adminOnly,
  markAdminNotificationRead,
);

export default router;
