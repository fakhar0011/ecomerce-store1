import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: "admin" | "user";
    createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name are required"],
        },
        email: {
            type: String,
            required: [true, "Email are required"],
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "Password are required"],
            minlength: 6,
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
        },
    },
    { timestamps: true }
);


delete (mongoose.models as any).User;


const UserModel: Model<IUser> =
    mongoose.model<IUser>("User", UserSchema);

export default UserModel;