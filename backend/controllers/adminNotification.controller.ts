import { Request, Response } from "express";
import AdminNotification from "../models/AdminNotification";

export const getAdminNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await AdminNotification.find({ read: false }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications" });
  }
};

export const markAdminNotificationRead = async (
  req: Request,
  res: Response,
) => {
  try {
    await AdminNotification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to mark as read" });
  }
};
