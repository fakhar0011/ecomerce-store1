import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  userId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema(
  {
    userId: { type: String, required: true },
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const OrderModel =
  (mongoose.models.Order as mongoose.Model<IOrder>) ||
  mongoose.model<IOrder>("Order", OrderSchema);
export default OrderModel;
