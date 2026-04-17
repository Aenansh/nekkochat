import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import mongoose from "mongoose";
import { User } from "../models/user.ts";
import { Chat } from "../models/chat.ts";

// Helper function to validate ID and fetch user/chat context
const getChatContext = async (req: Request, res: Response) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return { error: "Forbidden access.", status: 403 };

  const { id: chatId } = req.params;
  if (!chatId || typeof chatId !== "string" || !mongoose.Types.ObjectId.isValid(chatId)) {
    return { error: "Invalid scroll ID.", status: 400 };
  }

  const currUser = await User.findOne({ clerkId });
  if (!currUser) return { error: "Ninja not found in sanctuary.", status: 404 };

  const groupChat = await Chat.findOne({ _id: chatId, isGroup: true });
  if (!groupChat) return { error: "No such group chat found.", status: 404 };

  return { currUser, groupChat };
};

// Gatekeeper: Only Dojo Masters (Admins) can pass
export const requireGroupAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const context = await getChatContext(req, res);
    if (context.error) {
      return res
        .status(context.status!)
        .json({ success: false, error: context.error });
    }

    const { currUser, groupChat } = context;

    if (groupChat!.groupAdmin?.toString() !== currUser!._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Forbidden: Only the Dojo Master can perform this action.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin Auth Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error." });
  }
};

// Gatekeeper: Any member of the group can pass
export const requireGroupMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const context = await getChatContext(req, res);
    if (context.error) {
      return res
        .status(context.status!)
        .json({ success: false, error: context.error });
    }

    const { currUser, groupChat } = context;

    const isMember = groupChat!.participants.some(
      (p) => p.toString() === currUser!._id.toString(),
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: "Forbidden: You are not a member of this clan.",
      });
    }

    next();
  } catch (error) {
    console.error("Member Auth Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error." });
  }
};
