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
import { requireGroupAdmin, requireGroupMember } from "../middleware/chatAuth.ts";

const router = Router();

router.route("/").get(allChats).post(createChat);
router.route("/group").post(createGroupChat);

router.route("/group/name/:id").put(requireGroupAdmin, renameGroupChat);
router.route("/group/avatar/:id").put(requireGroupAdmin, updateGroupAvatar);
router
  .route("/group/participants/:id")
  .put(requireGroupAdmin, addToGroupChat)
  .patch(requireGroupAdmin, removeFromGroupChat);

router.route("/group/:id").put(requireGroupMember, leaveGroupChat);
router.route("/:id").get(fetchChat).delete(removeChat);

export default router;
