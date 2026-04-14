import { Router } from "express";
import { allMessages, createMessage } from "../controllers/messages.ts";

const router = Router();

router.route("/:id").get(allMessages).post(createMessage);

export default router;
