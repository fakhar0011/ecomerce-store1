import { Request, Response } from "express";
import UserModel from "../models/User";
import jwt from "jsonwebtoken";
import { getIO } from "../socket"; // Socket.IO instance

// ━━━━━━━━━━━━━━━━━━━━
// Generate Token
// ━━━━━━━━━━━━━━━━━━━━

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

// ━━━━━━━━━━━━━━━━━━━━
// Signup
// ━━━━━━━━━━━━━━━━━━━━
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      res.status(400).json({
        success: false,
        message: "User already exists",
      });
      return;
    }

    // Create user (role included)
    const user = await UserModel.create({
      name,
      email,
      password,
      role: role || "user", // Default role "user"
    });

    // Generate token
    const token = generateToken(user._id.toString());

    //  Send welcome notification via Socket.IO
    const io = getIO();
    io.to(user._id.toString()).emit("order-status", {
      title: "Welcome! 🎉",
      message: `Welcome ${user.name}! Thanks for joining MyStore. Start shopping now!`,
      type: "success",
    });
    console.log(`📢 Welcome notification sent to user ${user._id}`);

    // Send response without password
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
    res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
};

// ━━━━━━━━━━━━━━━━━━━━
// Login
// ━━━━━━━━━━━━━━━━━━━━
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🔍 Login request received");
    console.log("Request body:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("❌ Email or password missing");
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    console.log(`Looking for user with email: ${email}`);

    // Find user with password field
    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      console.log("❌ User not found in database");
      res.status(400).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    console.log("✅ User found, comparing password...");

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log("❌ Password mismatch");
      res.status(400).json({
        success: false,
        message: "Wrong password",
      });
      return;
    }

    console.log("✅ Password matched, generating token...");

    // Generate token
    const token = generateToken(user._id.toString());

    console.log("✅ Login successful, sending response");

    // Send response without password
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
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// ━━━━━━━━━━━━━━━━━━━━
// Get Current User (Protected)
// ━━━━━━━━━━━━━━━━━━━━
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById(req.user?.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
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
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ━━━━━━━━━━━━━━━━━━━━
// Logout
// ━━━━━━━━━━━━━━━━━━━━
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
