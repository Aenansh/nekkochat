import { Router } from "express";
import {
  allChats,
  createChat,
  createGroupChat,
  fetchChat,
  removeChat,
  renameGroupChat,
} from "../controllers/chat.ts";

const router = Router();

router.route("/").get(allChats).post(createChat);
router.route("/:id").get(fetchChat).delete(removeChat);

router.route("/group").post(createGroupChat);
router.route("/group/:id").put(renameGroupChat);

export default router;
