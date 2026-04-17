import type { Request, Response } from "express";
import { Webhook } from "svix";
import { User } from "../models/user.ts";
import { Chat } from "../models/chat.ts";
import { Message } from "../models/messages.ts";
import { env } from "../utils/env.ts";
import { redis } from "../utils/redis.ts";

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

  try {
    switch (type) {
      case "user.created":
      case "user.updated": {
        const clerkId = data.id;
        const firstName = data.first_name || "";
        const lastName = data.last_name || "";
        const name =
          data.username?.trim().toLowerCase() ||
          [firstName, lastName].filter(Boolean).join(" ").trim() ||
          `user_${clerkId.slice(-8)}`;

        await User.findOneAndUpdate(
          { clerkId },
          { $set: { name, firstName, lastName, profileUrl: data.image_url } },
          { upsert: true },
        );
        await redis.del(`user:profile:${clerkId}`);
        console.log(`Webhook: Updated ${name}`);
        break;
      }

      case "user.deleted": {
        const clerkId = data.id;

        const deletedUser = await User.findOneAndDelete({ clerkId });

        if (deletedUser) {
          const userId = deletedUser._id;

          await Promise.all([
            Chat.updateMany(
              { participants: userId },
              { $pull: { participants: userId } },
            ),
            Chat.updateMany(
              { groupAdmin: userId },
              { $set: { groupAdmin: null } },
            ),
            Message.deleteMany({ senderId: userId }),
          ]);

          await Chat.deleteMany({ participants: { $size: 0 } });
        }

        (await redis.del(`user:profile:${clerkId}`),
          console.log(
            `Webhook: Deleted user ${clerkId} and performed cascade cleanup`,
          ));
        break;
      }
    }
  } catch (dbError) {
    console.error("Webhook processing error:", dbError);
    return res.status(500).json({ error: "Internal processing error" });
  }

  return res.status(200).json({ success: true });
};
