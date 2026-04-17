import "dotenv/config";
import express from "express";
import cors from "cors";
import { env } from "./utils/env.ts";
import { clerkMiddleware } from "@clerk/express";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./db/db.ts";
import authRouter from "./routes/auth.ts";
import webhookRouter from "./routes/webhooks.ts";
import chatRouter from "./routes/chat.ts";
import messagesRouter from "./routes/messages.ts";
import userRouter from "./routes/user.ts";
import uploadRouter from "./routes/uploads.ts"

const ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:3000"];

const PORT = env.PORT;

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
  }),
);

app.use("/api/webhooks", webhookRouter);
app.use(express.json({ limit: "10kb" }));
app.use(clerkMiddleware());

app.use(authRouter);
app.use("/api/chats", chatRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/users", userRouter);
app.use("/api/upload", uploadRouter);

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("Hello");
});

async function startServer() {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start the server.", error);
  process.exit(1);
});
