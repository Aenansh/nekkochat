import dotenv from "dotenv";
import express from "express";
dotenv.config({ path: "../.env" });

const app = express();

app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
  res.send("Hello");
});

