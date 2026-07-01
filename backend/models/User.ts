import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user", // ← default role
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password
UserSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

const UserModel =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default UserModel;
