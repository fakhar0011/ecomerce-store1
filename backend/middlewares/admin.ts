import UserModel from "../models/User";
import { Request, Response, NextFunction } from "express";

export const adminOnly = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - no user" });
    }
    if (!req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - no user id" });
    }

    const user = await UserModel.findById(req.user.id).select("role").lean();
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "User not found" });
    }

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }

    next();
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, message: "Server error in admin check" });
  }
};
