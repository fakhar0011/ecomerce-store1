import { Request, Response } from "express";
import UserModel from "../models/User";
import jwt from "jsonwebtoken";
import { getIO } from "../socket";

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: "User already exists" });
      return;
    }

    const user = await UserModel.create({
      name,
      email,
      password,
      role: role || "user",
    });

    const token = generateToken(user._id.toString(), user.role);

    // Socket.IO welcome notification
    const io = getIO();
    io.to(user._id.toString()).emit("order-status", {
      title: "Welcome! 🎉",
      message: `Welcome ${user.name}! Thanks for joining MyStore. Start shopping now!`,
      type: "success",
    });
    console.log(`📢 Welcome notification sent to user ${user._id}`);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Signup failed" });
  }
};

// ✅ Complete login function
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    // Find user with password field
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.role);

    // Send response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get current user (protected)
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ success: true, message: "Logged out successfully" });
};
