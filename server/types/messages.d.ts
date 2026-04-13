import type mongoose from "mongoose";
import type { Document } from "mongoose";

export interface IMessageSchema extends Document {
  chatId: mongoose.Types.ObjectId;
  senderId: string;
  text: string;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}
