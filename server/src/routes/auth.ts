import { Router } from "express";
import { syncUser } from "../controllers/auth.ts";

const router = Router();

router.route("/api/sync-user").post(syncUser);

export default router;