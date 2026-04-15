import { getAuth } from "@clerk/express";
import type { Request, Response } from "express";
import { User } from "../models/user.ts";

export const fetchUser = async (req: Request, res: Response) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const { id: recipientId } = req.params;

    if (!recipientId || typeof recipientId !== "string")
      return res
        .status(400)
        .json({ success: false, error: "Wrong user clerk id." });
    const user = await User.findOne({ clerkId: recipientId });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch user to chat with." });
  }
};
