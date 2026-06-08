import UserModel from "../models/User";
import { Request, Response, NextFunction } from "express";

export const adminOnly = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("🔵 [adminOnly] ENTERED");
  try {
    console.log("🔵 [adminOnly] req.user:", req.user);
    if (!req.user) {
      console.error("❌ req.user missing");
      res
        .status(401)
        .json({ success: false, message: "Unauthorized - no user" });
      return;
    }
    if (!req.user.id) {
      console.error("❌ req.user.id missing, keys:", Object.keys(req.user));
      res
        .status(401)
        .json({ success: false, message: "Unauthorized - no user id" });
      return;
    }
    console.log("🔵 [adminOnly] fetching user from DB, id:", req.user.id);
    const user = await UserModel.findById(req.user.id).select("role").lean();
    if (!user) {
      console.error("❌ User not found in DB");
      res.status(403).json({ success: false, message: "User not found" });
      return;
    }
    console.log("🔵 [adminOnly] user role:", user.role);
    if (user.role !== "admin") {
      console.error("❌ Not admin");
      res
        .status(403)
        .json({ success: false, message: "Admin access required" });
      return;
    }
    console.log("✅ [adminOnly] PASSED");
    next();
  } catch (error: any) {
    console.error("❌ [adminOnly] CATCH ERROR:", error.message);
    console.error(error.stack);
    res
      .status(500)
      .json({ success: false, message: "Server error in admin check" });
  }
};
