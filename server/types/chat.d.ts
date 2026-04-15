import type mongoose from "mongoose";
import type { Document } from "mongoose";

export interface IChatSchema extends Document {
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  groupAdmin?: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  lastMessageText?: string;
  lastMessageAt?: Date;
}
