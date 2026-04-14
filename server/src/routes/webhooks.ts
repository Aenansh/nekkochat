import bodyParser from "body-parser";
import { Router } from "express";
import { clerkWebhook } from "../controllers/webhook.ts";

const router = Router();

router
  .route("/clerk")
  .post(bodyParser.raw({ type: "application/json" }), clerkWebhook);

export default router;
