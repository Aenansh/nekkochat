import { Router } from "express";
import {
  addToGroupChat,
  allChats,
  createChat,
  createGroupChat,
  fetchChat,
  leaveGroupChat,
  removeChat,
  removeFromGroupChat,
  renameGroupChat,
  updateGroupAvatar,
} from "../controllers/chat.ts";

const router = Router();

router.route("/").get(allChats).post(createChat);
router.route("/group").post(createGroupChat);
router.route("/group/name/:id").put(renameGroupChat);
router.route("/group/avatar/:id").put(updateGroupAvatar);
router.route("/group/participants/:id").put(addToGroupChat).patch(removeFromGroupChat);
router.route("/group/:id").put(leaveGroupChat);
router.route("/:id").get(fetchChat).delete(removeChat);

export default router;
