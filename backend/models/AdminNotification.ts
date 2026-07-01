import mongoose, { Schema, Document } from "mongoose";

export interface IAdminNotification extends Document {
  orderId: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const AdminNotificationSchema = new Schema({
  orderId: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default (mongoose.models
  .AdminNotification as mongoose.Model<IAdminNotification>) ||
  mongoose.model<IAdminNotification>(
    "AdminNotification",
    AdminNotificationSchema,
  );
