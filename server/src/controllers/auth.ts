import type { Request, Response } from "express";
import { User } from "../models/user.ts";
import { prisma } from "../utils/prisma.ts";
import { getAuth } from "@clerk/express";

export const syncUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const prismaUser = await prisma.user.findUnique({
      where: {
        id: clerkId,
      },
      select: {
        name: true,
        lastName: true,
        firstName: true,
        profileUrl: true,
      },
    });

    if (!prismaUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found with this ID" });
    }

    if (!prismaUser.name || !prismaUser.profileUrl) {
      return res.status(400).json({
        success: false,
        message: "User profile incomplete: missing name or profile URL",
      });
    }

    const chatUser = await User.findOneAndUpdate(
      { clerkId },
      {
        $set: {
          name: prismaUser.name,
          firstName: prismaUser.firstName || "",
          lastName: prismaUser.lastName || "",
          profileUrl: prismaUser.profileUrl,
          lastSeen: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    res.status(200).json({ success: true, user: chatUser });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ error: "Failed to sync user to chat world" });
  }
};
