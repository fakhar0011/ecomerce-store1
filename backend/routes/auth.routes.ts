import { Router } from "express";

import { signup, login, logout, getMe } from "../controllers/auth.controller";

import authMiddleware from "../middlewares/auth";

const router = Router();

// Public Routes
router.post("/signup", signup);
router.post("/login", login);

// Protected Route
router.get("/me", authMiddleware, getMe);

router.post("/logout", logout);

export default router;
