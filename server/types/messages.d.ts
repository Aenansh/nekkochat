import type { Document } from "mongoose";

declare interface IMessageSchema extends Document {
  chatId: mongoose.Types.ObjectId;
  senderId: string;
  text: string;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}
