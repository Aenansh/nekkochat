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

        const deletedUser = await User.findOne({ clerkId }).select("_id");

        if (deletedUser) {
          const userId = deletedUser._id;

          // 1. CLAN SUCCESSION: Pass the torch before the user vanishes
          const adminChats = await Chat.find({ groupAdmin: userId });

          const successionPromises = adminChats.map((chat) => {
            // Find the first participant who IS NOT the deleted user
            const nextAdmin = chat.participants.find(
              (p: any) => p.toString() !== userId.toString(),
            );

            // Assign the new admin (or null if they were the only one left)
            return Chat.updateOne(
              { _id: chat._id },
              { $set: { groupAdmin: nextAdmin || null } },
            );
          });

          await Promise.all(successionPromises);

          // 2. STANDARD CLEANUP: Remove their traces
          await Promise.all([
            Chat.updateMany(
              { participants: userId },
              { $pull: { participants: userId } },
            ),
            Message.deleteMany({ senderId: userId }),
          ]);

          // 3. PURGE DEAD SCROLLS: Delete empty clans and broken 1-on-1s
          const chatsToDelete = await Chat.find({
            $or: [
              { isGroup: false, participants: { $size: 1 } },
              { participants: { $size: 0 } },
            ],
          }).select("_id");

          const chatIds = chatsToDelete.map((chat) => chat._id);

          await Promise.all([
            chatIds.length
              ? Message.deleteMany({ chatId: { $in: chatIds } })
              : Promise.resolve(),
            chatIds.length
              ? Chat.deleteMany({ _id: { $in: chatIds } })
              : Promise.resolve(),
          ]);

          // 4. Burn the ninja's profile
          await User.deleteOne({ _id: userId });
        }

        await redis.del(`user:profile:${clerkId}`);
        console.log(
          `Webhook: Deleted user ${clerkId} and handled succession cleanup`,
        );
        break;
      }
      case "session.ended":
      case "session.revoked": {
        const clerkId = data.user_id;
        const sessionId = data.id;

        if (sessionId) {
          const io = req.app.get("io");

          if (io) {
            io.to(clerkId).emit("force_logout", {
              message:
                "Session terminated in the Dojo. Re-authentication required.",
            });
            console.log(
              `Webhook: Session ended for ${clerkId}. Kill switch activated.`,
            );
          } else {
            console.error(
              "Webhook: Could not find Socket.io instance to execute kill switch.",
            );
          }
        }
        break;
      }
    }
  } catch (dbError) {
    console.error("Webhook processing error:", dbError);
    return res.status(500).json({ error: "Internal processing error" });
  }

  return res.status(200).json({ success: true });
};
