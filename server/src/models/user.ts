import mongoose from "mongoose";
import type { IUserSchema } from "../../types/user.js";

const UserSchema = new mongoose.Schema<IUserSchema>(
  {
    clerkId: { type: String, required: true, index: true, unique: true },
    name: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    profileUrl: { type: String, required: true },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUserSchema>("User", UserSchema);
