import type mongoose from "mongoose";
import type { Document } from "mongoose";

export interface IMessageSchema extends Document {
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  text: string;
  isReply: boolean;
  parentId?: mongoose.Types.ObjectId;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}
