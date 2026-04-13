import mongoose from "mongoose";
import type { IChatSchema } from "../../types/chat.js";

const ChatSchema = new mongoose.Schema<IChatSchema>(
  {
    isGroup: { type: Boolean, default: false },
    groupName: { type: String, required: false },
    groupAvatar: { type: String, required: false },
    participants: [
      {
        clerkId: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true },
        profileUrl: { type: String, required: true },
      },
    ],
    lastMessageText: { type: String },
    lastMessageAt: { type: Date, default: Date.now() },
  },
  { timestamps: true },
);

export const Chat = mongoose.model<IChatSchema>("Chat", ChatSchema);
