import type { Request, Response } from "express";
import { Webhook } from "svix";
import { User } from "../models/user.ts";
import { env } from "../utils/env.ts";

export const clerkWebhook = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const SIGNING_SECRET = env.CLERK_WEBHOOK_SECRET;

  const svix_id = req.headers["svix-id"] as string;
  const svix_timestamp = req.headers["svix-timestamp"] as string;
  const svix_signature = req.headers["svix-signature"] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: "Missing Svix headers" });
  }

  const payload = req.body.toString("utf8");

  const wh = new Webhook(SIGNING_SECRET);
  let evt: any;

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return res.status(400).json({ error: "Verification failed" });
  }

  const { type, data } = evt;

  if (type === "user.updated") {
    const clerkId = data.id;
    const firstName = data.first_name || "";
    const lastName = data.last_name || "";
    const name = data.username?.toLowerCase();
    const profileUrl = data.image_url;

    try {
      await User.findOneAndUpdate(
        { clerkId },
        { $set: { name, firstName, lastName, profileUrl } },
        { upsert: true },
      );
      console.log(`Webhook: Successfully updated profile for ${name}`);
    } catch (dbError) {
      console.error("Database error during webhook:", dbError);
      return res.status(500).json({ error: "Database error" });
    }
  }
  return res.status(200).json({ success: true });
};
