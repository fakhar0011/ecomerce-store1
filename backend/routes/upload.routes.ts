import { Router } from "express";
import multer from "multer";
import { uploadProductImage } from "../controllers/upload.controller.js";
// import { protect } from "../middlewares/auth.js";
import { adminOnly } from "../middlewares/admin.js";
// import { uploadLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// ← Multer config — memory storage
const storage = multer.memoryStorage();

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type "${file.mimetype}" are not allowed . JPG, PNG, WEBP, AVIF format can use .`,
      ),
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // ← 10MB max
  },
});

// ← Upload route — Admin only
router.post(
  "/",
  // uploadLimiter,
  // protect,
  adminOnly,
  upload.single("image"),
  uploadProductImage,
);

export default router;
