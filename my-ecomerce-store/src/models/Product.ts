import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
    name: string;
    price: number;
    category: string;
    image?: string;
    stock: number;
    badge?: string;
    rating?: number;
    reviews?: number;
    createdAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
    {
        name: {
            type: String,
            required: [true, "Product name must"],
        },
        price: {
            type: Number,
            required: [true, "Price must"],
        },
        category: {
            type: String,
            required: [true, "Category must"],
            enum: ["electronics", "fashion", "clothing", "accessories"],
        },
        image: {
            type: String,
            required: [true, "Image URL must"],
        },
        stock: {
            type: Number,
            default: 0,
        },
        badge: {
            type: String,
        },
        rating: {
            type: Number,
            default: 0,
        },
        reviews: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const ProductModel: Model<IProduct> =
    mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default ProductModel;