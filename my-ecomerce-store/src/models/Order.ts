import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface IOrder extends Document {
    userId: string;
    items: IOrderItem[];
    totalAmount: number;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
        city: string;
        postalCode: string;
    };
    createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String },
});

const OrderSchema = new Schema<IOrder>(
    {
        userId: {
            type: String,
            required: [true, "User ID is required"],
        },
        items: {
            type: [OrderItemSchema],
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            default: "pending",
        },
        shippingAddress: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
        },
    },
    { timestamps: true }
);

const OrderModel: Model<IOrder> =
    mongoose.models.Order ||
    mongoose.model<IOrder>("Order", OrderSchema);

export default OrderModel;