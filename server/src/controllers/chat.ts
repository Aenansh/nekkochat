import { getAuth } from "@clerk/express";
import type { Request, Response } from "express";
import { User } from "../models/user.ts";
import { Chat } from "../models/chat.ts";
import { Message } from "../models/messages.ts";

export const allChats = async (req: Request, res: Response) => {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      return res
        .status(403)
        .json({ success: false, error: "Forbidden access." });
    }
    const userExists = await User.findOne({ clerkId });
    if (!userExists) {
      return res
        .status(404)
        .json({ success: false, error: "No such user found." });
    }

    const userChats = await Chat.aggregate([
      {
        $match: {
          participants: clerkId,
        },
      },
      {
        $sort: {
          updatedAt: -1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "clerkId",
          as: "recipientDetails",
        },
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          updatedAt: 1,
          recipient: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$recipientDetails",
                  as: "user",
                  cond: { $ne: ["$$user.clerkId", clerkId] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          updatedAt: 1,
          lastMessage: 1,
          "recipient.name": 1,
          "recipient.profileUrl": 1,
          "recipient.clerkId": 1,
          "recipient.lastSeen": 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      userChats,
    });
  } catch (error) {
    console.error("Aggregation Error:", error);
    return res.status(500).json({ error: "Failed to fetch scrolls" });
  }
};

export const createChat = async (req: Request, res: Response) => {
  try {
    const { userId: clerkId } = getAuth(req);
    const body = req.body;
    if (!clerkId) {
      return res
        .status(403)
        .json({ success: false, error: "Forbidden access." });
    }
    const userExists = await User.findOne({ clerkId });
    if (!userExists) {
      return res
        .status(404)
        .json({ success: false, error: "No such user found." });
    }
    const { recipientId } = body;

    const recipientExists = await User.findOne({ clerkId: recipientId });
    if (!recipientExists) {
      return res
        .status(404)
        .json({ success: false, error: "No such recipient user found." });
    }

    const newChat = await Chat.create({
      participants: [clerkId, recipientId],
    });

    return res.status(201).json({ success: true, newChat });
  } catch (error) {
    console.error("Creation Error:", error);
    return res.status(500).json({ error: "Failed to create the chat" });
  }
};

export const removeChat = async (req: Request, res: Response) => {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      return res
        .status(403)
        .json({ success: false, error: "Forbidden access." });
    }
    const userExists = await User.findOne({ clerkId });
    if (!userExists) {
      return res
        .status(404)
        .json({ success: false, error: "No such user found." });
    }

    const { id: recipientId } = req.params;
    if (!recipientId)
      return res
        .status(400)
        .json({ success: false, error: "No recipient id provided." });

    const recipientExists = await User.findOne({ clerkId: recipientId });
    if (!recipientExists) {
      return res
        .status(404)
        .json({ success: false, error: "No such recipient user found." });
    }

    const chatToDelete = await Chat.findOne({
      participants: { $all: [clerkId, recipientId] },
    });
    if (!chatToDelete) {
      return res
        .status(404)
        .json({ success: false, error: "Scroll not found." });
    }
    
    await Message.deleteMany({ chatId: chatToDelete._id });
    await Chat.findByIdAndDelete(chatToDelete._id);

    return res.status(200).json({
      success: true,
      message: "Chat history purified and removed.",
    });
  } catch (error) {
    console.error("Deletion Error:", error);
    return res.status(500).json({ error: "Failed to delete the chat" });
  }
};
