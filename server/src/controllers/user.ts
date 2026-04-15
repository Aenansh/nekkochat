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

    const limit = 10;
    const skip = (Number(page) - 1) * limit;

    if (!name || typeof name !== "string" || !name.trim())
      return res.status(400).json({ success: false, error: "Wrong username." });

    const users = await User.find({
      $or: [
        { name: { $regex: name, $options: "i" } },
        { firstName: { $regex: name, $options: "i" } },
        { lastName: { $regex: name, $options: "i" } },
      ],
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
      nextPage: hasMore ? Number(page) + 1 : null,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch user to chat with." });
  }
};
