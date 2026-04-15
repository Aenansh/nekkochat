import mongoose from "mongoose";
import type { IChatSchema } from "../../types/chat.js";

const ChatSchema = new mongoose.Schema<IChatSchema>(
  {
    isGroup: { type: Boolean, default: false },
    groupName: { type: String, required: false },
    groupAvatar: { type: String, required: false },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    participantsKey: { type: String, unique: true, sparse: true },
    lastMessageText: { type: String },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const Chat = mongoose.model<IChatSchema>("Chat", ChatSchema);
