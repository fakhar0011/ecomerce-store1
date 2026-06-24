import mongoose, { Schema, Document } from "mongoose";

export interface IUserNotification extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}

const UserNotificationSchema = new Schema<IUserNotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model<IUserNotification>(
  "UserNotification",
  UserNotificationSchema,
);
