import mongoose from "mongoose";
import type { IMessageSchema } from "../../types/messages.js";

const MessageSchema = new mongoose.Schema<IMessageSchema>(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    readBy: [{ type: String }],
  },
  { timestamps: true },
);

export const Message = mongoose.model<IMessageSchema>("Message", MessageSchema);
