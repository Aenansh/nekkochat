import { Router } from "express";
import { allChats, createChat, removeChat } from "../controllers/chat.ts";

const router = Router();

router.route("/").get(allChats).post(createChat);
router.route("/:id").delete(removeChat);

export default router;
