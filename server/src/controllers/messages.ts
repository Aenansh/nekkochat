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

    if (!text || typeof text !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "No text provided." });
    }
    const isReply = parentId ? true : false;
    const newMessage = await Message.create({
      text,
      chatId,
      senderId: user._id,
      isReply,
      parentId,
    });

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: text,
      updatedAt: new Date(),
    });
    return res.status(201).json({ success: true, newMessage });
  } catch (error) {
    console.error("Creat message Error:", error);
    return res.status(500).json({ error: "Failed to create message" });
  }
};
