import mongoose from "mongoose";
import type { IChatSchema } from "../../types/chat.js";
import { required } from "zod/mini";

const ChatSchema = new mongoose.Schema<IChatSchema>(
  {
    isGroup: { type: Boolean, default: false },
    groupName: { type: String, required: false },
    groupAvatar: { type: String, required: false },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    lastMessageText: { type: String },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const Chat = mongoose.model<IChatSchema>("Chat", ChatSchema);
