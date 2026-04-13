import type { Document } from "mongoose";

export interface IUserSchema extends Document {
  clerkId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  profileUrl: string;
  lastSeen: Date;
}
