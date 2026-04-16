import { getAuth } from "@clerk/express";
import type { Request, Response } from "express";
import { User } from "../models/user.ts";

export const fetchUser = async (req: Request, res: Response) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const { name, page = 1 } = req.query;
    if (!name || typeof name !== "string" || !name.trim())
      return res.status(400).json({ success: false, error: "Wrong username." });

    const pageNum = Number.parseInt(String(page), 10);
    if (!Number.isFinite(pageNum) || pageNum < 1) {
      return res.status(400).json({ success: false, error: "Invalid page." });
    }

    const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedName, "i");
    const limit = 10;
    const skip = (pageNum - 1) * limit;

    const users = await User.find({
      $or: [{ name: regex }, { firstName: regex }, { lastName: regex }],
      clerkId: { $ne: clerkId },
    })
      .skip(skip)
      .limit(limit + 1)
      .lean();

    const hasMore = users.length > limit;
    const results = hasMore ? users.slice(0, -1) : users;

    return res.status(200).json({
      success: true,
      users: results,
      hasMore,
      nextPage: hasMore ? pageNum + 1 : null,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch user to chat with." });
  }
};
