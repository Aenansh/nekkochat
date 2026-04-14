import { getAuth } from "@clerk/express";
import type { Request, Response } from "express";
import { Chat } from "../models/chat.ts";
import { Message } from "../models/messages.ts";
import mongoose from "mongoose";
import { User } from "../models/user.ts";

export const allMessages = async (req: Request, res: Response) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { id: chatId } = req.params;
    if (!chatId || typeof chatId !== "string")
      return res
        .status(400)
        .json({ success: false, error: "No chat is open." });

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const chat = await Chat.findOne({ _id: chatId, participants: user._id });
    if (!chat) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const allMessages = await Message.aggregate([
      {
        $match: {
          chatId: new mongoose.Types.ObjectId(chatId),
        },
      },
      {
        $sort: { createdAt: 1 },
      },
      {
        $lookup: {
          from: "messages",
          localField: "parentId",
          foreignField: "_id",
          as: "quotedMessage",
        },
      },
      {
        $addFields: {
          quotedMessage: {
            $arrayElemAt: ["$quotedMessage", 0],
          },
        },
      },
      {
        $project: {
          _id: 1,
          text: 1,
          senderId: 1,
          createdAt: 1,
          isReply: 1,
          "quotedMessage.text": 1,
          "quotedMessage.senderId": 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      allMessages,
    });
  } catch (error) {
    console.error("Aggregation message Error:", error);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const { id: chatId } = req.params;
    const { text, parentId = null } = req.body;
    if (!chatId || typeof chatId !== "string")
      return res
        .status(400)
        .json({ success: false, error: "No chat is open." });

    const chat = await Chat.findOne({ _id: chatId, participants: user._id });
    if (!chat) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    if (!text || typeof text !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "No text provided." });
    }

    let validatedParentId = null;
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid parentId format." });
      }
      const parentMessage = await Message.findOne({ _id: parentId, chatId });
      if (!parentMessage) {
        return res.status(400).json({
          success: false,
          error: "Parent message missing from this scroll.",
        });
      }
      validatedParentId = parentMessage._id;
    }

    const isReply = validatedParentId !== null;
    const newMessage = await Message.create({
      text,
      chatId,
      senderId: user._id,
      isReply,
      ...(validatedParentId && { parentId: validatedParentId }),
    });

    await Chat.findByIdAndUpdate(chatId, {
      lastMessageText: text,
      lastMessageAt: new Date(),
    });
    return res.status(201).json({ success: true, newMessage });
  } catch (error) {
    console.error("Creat message Error:", error);
    return res.status(500).json({ error: "Failed to create message" });
  }
};
