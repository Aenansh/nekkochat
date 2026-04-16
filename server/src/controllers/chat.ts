import { getAuth } from "@clerk/express";
import type { Request, Response } from "express";
import { User } from "../models/user.ts";
import { Chat } from "../models/chat.ts";
import { Message } from "../models/messages.ts";
import mongoose from "mongoose";

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
      { $match: { participants: userExists._id } },
      { $sort: { lastMessageAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "recipientDetails",
        },
      },
      {
        $project: {
          _id: 1,
          lastMessageText: 1,
          lastMessageAt: 1,
          groupName: 1,
          groupAvatar: 1,
          groupAdmin: 1,
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
          allParticipantNames: {
            $map: {
              input: {
                $filter: {
                  input: "$recipientDetails",
                  as: "user",
                  cond: { $ne: ["$$user.clerkId", clerkId] },
                },
              },
              as: "user",
              in: "$$user.name",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          lastMessageText: 1,
          lastMessageAt: 1,
          isGroup: 1,
          groupAdmin: 1,
          allParticipantNames: 1,
          displayName: { $ifNull: ["$groupName", "$recipient.name"] },
          displayIcon: { $ifNull: ["$groupAvatar", "$recipient.profileUrl"] },
          recipientClerkId: "$recipient.clerkId",
          recipientId: "$recipient._id",
          lastSeen: "$recipient.lastSeen",
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
    const { recipientId } = req.body;
    if (!clerkId) {
      return res
        .status(403)
        .json({ success: false, error: "Forbidden access." });
    }
    if (typeof recipientId !== "string" || recipientId === clerkId) {
      return res.status(400).json({
        success: false,
        error: "Cannot create a direct chat with yourself.",
      });
    }
    const [user, recipient] = await Promise.all([
      User.findOne({ clerkId }),
      User.findOne({ _id: recipientId }),
    ]);

    if (!user || !recipient) {
      return res
        .status(404)
        .json({ success: false, error: "Users not found." });
    }
    const participantsKey = [user._id.toString(), recipient._id.toString()]
      .sort()
      .join("-");

    const chat = await Chat.findOneAndUpdate(
      {
        $or: [
          { participantsKey },
          {
            isGroup: false,
            participants: { $all: [user._id, recipient._id], $size: 2 },
          },
        ],
      },
      {
        $setOnInsert: {
          participants: [user._id, recipient._id],
          isGroup: false,
          participantsKey,
        },
      },
      { upsert: true, new: true },
    );

    return res.status(201).json({ success: true, newChat: chat });
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
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const { id: chatId } = req.params;

    if (
      !chatId ||
      typeof chatId !== "string" ||
      !mongoose.Types.ObjectId.isValid(chatId)
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid Chat ID provided." });
    }
    const chatToDelete = await Chat.findById(chatId);

    if (!chatToDelete) {
      return res
        .status(404)
        .json({ success: false, error: "Scroll not found." });
    }

    if (!chatToDelete.participants.some((p) => p.equals(userExists._id))) {
      return res.status(403).json({ success: false, error: "Access denied." });
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

export const fetchChat = async (req: Request, res: Response) => {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      return res
        .status(403)
        .json({ success: false, error: "Forbidden access." });
    }

    const { id: chatId } = req.params;

    if (
      !chatId ||
      typeof chatId !== "string" ||
      !mongoose.Types.ObjectId.isValid(chatId)
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid Chat ID provided." });
    }
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    const chat = await Chat.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(chatId),
          participants: user._id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participantDetails",
        },
      },
      {
        $project: {
          _id: 1,
          updatedAt: 1,
          isGroup: 1,
          groupName: {
            $cond: { if: "$isGroup", then: "$groupName", else: null },
          },
          groupAvatar: {
            $cond: { if: "$isGroup", then: "$groupAvatar", else: null },
          },
          groupAdmin: {
            $cond: { if: "$isGroup", then: "$groupAdmin", else: null },
          },
          participants: {
            $cond: { if: "$isGroup", then: "$participantDetails", else: null },
          },
          recipient: {
            $cond: {
              if: "$isGroup",
              then: null,
              else: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$participantDetails",
                      as: "u",
                      cond: {
                        $ne: ["$$u.clerkId", clerkId],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    ]);

    if (!chat || chat.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Scroll not found." });
    }

    return res.status(200).json({ success: true, chat: chat[0] });
  } catch (error) {
    console.error("Chat fetch Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch the chat" });
  }
};

//Group chats
export const createGroupChat = async (req: Request, res: Response) => {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      return res
        .status(403)
        .json({ success: false, error: "Forbidden access." });
    }

    const { participantIds, groupName, groupAvatar } = req.body;
    if (typeof groupName !== "string" || groupName.trim() === "") {
      return res
        .status(400)
        .json({ success: false, error: "A group needs a title." });
    }
    if (!Array.isArray(participantIds)) {
      return res.status(400).json({
        success: false,
        error: "Participants must be provided as an array.",
      });
    }

    if (participantIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: "A group requires at least 3 disciples (including you).",
      });
    }

    for (const id of participantIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ success: false, error: `Invalid ID detected: ${id}` });
      }
    }
    const creator = await User.findOne({ clerkId });
    if (!creator) {
      return res
        .status(404)
        .json({ success: false, error: "Creator not found in sanctuary." });
    }
    const finalParticipants = Array.from(
      new Set([...participantIds, creator._id.toString()]),
    );
    if (finalParticipants.length < 3) {
      return res.status(400).json({
        success: false,
        error: "A group requires at least 3 disciples (including you).",
      });
    }
    const users = await User.find({ _id: { $in: finalParticipants } });
    if (users.length !== finalParticipants.length) {
      return res.status(400).json({
        success: false,
        error: "Some participant IDs are invalid.",
      });
    }
    const newGroup = await Chat.create({
      isGroup: true,
      groupName,
      groupAvatar: groupAvatar || "",
      groupAdmin: creator._id,
      participants: users.map((u) => u._id.toString()),
    });
    return res.status(201).json({
      success: true,
      newGroup,
    });
  } catch (error) {
    console.error("Group Creation Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to forge the group scroll." });
  }
};

export const renameGroupChat = async (req: Request, res: Response) => {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      return res
        .status(403)
        .json({ success: false, error: "Forbidden access." });
    }

    const { newGroupName } = req.body;
    const { id: groupId } = req.params;

    if (
      !groupId ||
      typeof groupId !== "string" ||
      !mongoose.Types.ObjectId.isValid(groupId)
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid group id." });
    }
    if (typeof newGroupName !== "string" || newGroupName.trim() === "") {
      return res
        .status(400)
        .json({ success: false, error: "A group needs a title." });
    }

    const thisUser = await User.findOne({ clerkId });
    if (!thisUser) {
      return res
        .status(404)
        .json({ success: false, error: "Creator not found in sanctuary." });
    }

    const groupToUpdate = await Chat.findById(groupId);

    if (!groupToUpdate) {
      return res
        .status(404)
        .json({ success: false, error: "No such group found!" });
    }

    if (
      !groupToUpdate.groupAdmin ||
      !thisUser._id.equals(groupToUpdate.groupAdmin)
    )
      return res
        .status(400)
        .json({ success: false, error: "You are not the admin!" });

    await Chat.findByIdAndUpdate(groupId, {
      groupName: newGroupName,
    });
    return res.status(201).json({
      success: true,
      message: "Name updated!",
    });
  } catch (error) {
    console.error("Group rename Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to rename the group scroll." });
  }
};

export const updateGroupAvatar = async (req: Request, res: Response) => {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      return res
        .status(403)
        .json({ success: false, error: "Forbidden access." });
    }

    const { newGroupAvatar } = req.body;
    const { id: groupId } = req.params;

    if (
      !groupId ||
      typeof groupId !== "string" ||
      !mongoose.Types.ObjectId.isValid(groupId)
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid group id." });
    }
    if (typeof newGroupAvatar !== "string" || newGroupAvatar.trim() === "") {
      return res
        .status(400)
        .json({ success: false, error: "A group needs an avatar." });
    }

    const thisUser = await User.findOne({ clerkId });
    if (!thisUser) {
      return res
        .status(404)
        .json({ success: false, error: "Creator not found in sanctuary." });
    }

    const groupToUpdate = await Chat.findById(groupId);

    if (!groupToUpdate) {
      return res
        .status(404)
        .json({ success: false, error: "No such group found!" });
    }

    if (
      !groupToUpdate.groupAdmin ||
      !thisUser._id.equals(groupToUpdate.groupAdmin)
    )
      return res
        .status(400)
        .json({ success: false, error: "You are not the admin!" });

    await Chat.findByIdAndUpdate(groupId, {
      groupAvatar: newGroupAvatar,
    });
    return res.status(201).json({
      success: true,
      message: "Avatar updated!",
    });
  } catch (error) {
    console.error("Group avatar Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to avatar the group scroll." });
  }
};
