import { Request, Response } from "express";
import ProductModel from "../models/Product";

// ━━━━━━━━━━━━━━━━━━━━
// Get All Products
// ━━━━━━━━━━━━━━━━━━━━

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category && category !== "all") {
      filter = { category };
    }
    const products = await ProductModel.find(filter);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Products not found" });
  }
};

// ━━━━━━━━━━━━━━━━━━━━
// Get Single Product
// ━━━━━━━━━━━━━━━━━━━━

export const getProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ━━━━━━━━━━━━━━━━━━━━
// Create Product
// ━━━━━━━━━━━━━━━━━━━━

export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, price, category, stock } = req.body;

    // Image required
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Image is required",
      });

      return;
    }

    // Upload image to ImageKit
    const { uploadImage } = await import("../services/imagekit.service");

    const imageResult = await uploadImage(req.file);

    // Create product
    const product = await ProductModel.create({
      name,
      price,
      category,
      stock,
      image: imageResult.url,
    });

    res.status(201).json({
      success: true,
      message: "Product Created",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Product not created",
    });
  }
};

// ━━━━━━━━━━━━━━━━━━━━
// Update Product
// ━━━━━━━━━━━━━━━━━━━━

export const updateProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const updateData: any = {
      ...req.body,
    };

    // New image upload
    if (req.file) {
      const { uploadImage } = await import("../services/imagekit.service");

      const imageResult = await uploadImage(req.file);

      updateData.image = imageResult.url;
    }

    // Update product
    const product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Product Updated",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Product not updated",
    });
  }
};

// ━━━━━━━━━━━━━━━━━━━━
// Delete Product
// ━━━━━━━━━━━━━━━━━━━━

export const deleteProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await ProductModel.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Product Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Product not deleted",
    });
  }
};
