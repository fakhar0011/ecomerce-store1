import { Router } from "express";
import multer from "multer";

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";

import authMiddleware from "../middlewares/auth";

const router = Router();

// ━━━━━━━━━━━━━━━━━━━━
// Multer Config
// ━━━━━━━━━━━━━━━━━━━━

const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

// ━━━━━━━━━━━━━━━━━━━━
// Public Routes
// ━━━━━━━━━━━━━━━━━━━━

router.get("/", getProducts);

router.get("/:id", getProduct);

// ━━━━━━━━━━━━━━━━━━━━
// Protected Routes
// ━━━━━━━━━━━━━━━━━━━━

router.post("/", authMiddleware, upload.single("image"), createProduct);

router.put("/:id", authMiddleware, upload.single("image"), updateProduct);

router.delete("/:id", authMiddleware, deleteProduct);

export default router;
