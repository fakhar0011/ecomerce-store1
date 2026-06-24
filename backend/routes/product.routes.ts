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

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", authMiddleware, upload.single("image"), createProduct);
router.put("/:id", authMiddleware, upload.single("image"), updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

export default router;
