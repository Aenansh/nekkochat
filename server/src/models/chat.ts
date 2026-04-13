import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({}, { timestamps: true });

export const Chat = mongoose.model("Chat", ChatSchema);
