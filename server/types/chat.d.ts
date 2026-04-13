import type { Document } from "mongoose";

declare interface IChatSchema extends Document {
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  participants: {
    clerkId: string;
    name: string;
    profileUrl: string;
  }[];
  lastMessageText?: string;
  lastMessageAt?: Date;
}
