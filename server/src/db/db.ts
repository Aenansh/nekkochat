import mongoose from "mongoose";
import { env } from "../utils/env.ts";

export default async function connectDB() {
  const uri = env.MONGO_URI;
  if (!uri) throw new Error("Mongodb URI is missing.");

  try {
    const response = await mongoose.connect(uri);
    if (!response) throw new Error("Failed to connect to database.");
    console.log("Database connected!");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Something happened while connecting to database.", message);
    process.exit(1);
  }
}
