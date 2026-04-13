import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { env } from "./utils/env.ts";
import { clerkMiddleware } from "@clerk/express";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./db/db.ts";
dotenv.config({ path: "../.env" });

const PORT = env.PORT;

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: ["http  ://localhost:5173"],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(clerkMiddleware());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("Hello");
});

server.listen(PORT, () => {
  connectDB();
  console.log(`Listening on http://localhost:${PORT}`);
});
