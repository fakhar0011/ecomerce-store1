import { Request, Response, NextFunction } from "express";
import { uploadImage } from "../services/imagekit.service.js";
import { AppError } from "../middlewares/errorHandler.js";

export const uploadProductImage = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // ← File check
        if (!req.file) {
            return next(new AppError("File are not found", 400));
        }

        // ← ImageKit pe upload
        const result = await uploadImage(req.file);

        if (!result.success) {
            return next(
                new AppError(result.error || "Image has not upload", 400)
            );
        }

        res.status(200).json({
            success: true,
            message: "Image are successfully upload",
            url: result.url,
            fileId: result.fileId,
        });

    } catch (error) {
        next(error);
    }
};