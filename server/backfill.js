// One-off backfill script to populate participantsKey on existing direct chats
// Run this once after deploying the updated code, then remove it.

import mongoose from 'mongoose';
import { Chat } from './src/models/chat.js';
import dotenv from 'dotenv';

dotenv.config();

async function backfillParticipantsKey() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to database');

    const directChats = await Chat.find({ isGroup: false, participantsKey: { $exists: false } });
    console.log(`Found ${directChats.length} direct chats without participantsKey`);

    for (const chat of directChats) {
      if (chat.participants.length === 2) {
        const participantsKey = chat.participants.map(id => id.toString()).sort().join('-');
        await Chat.updateOne({ _id: chat._id }, { $set: { participantsKey } });
        console.log(`Updated chat ${chat._id} with participantsKey ${participantsKey}`);
      } else {
        console.warn(`Chat ${chat._id} has ${chat.participants.length} participants, skipping`);
      }
    }

    console.log('Backfill completed');
  } catch (error) {
    console.error('Backfill error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

backfillParticipantsKey();