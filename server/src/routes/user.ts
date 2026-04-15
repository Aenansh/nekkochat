import { Router } from "express";
import { fetchUser } from "../controllers/user.ts";
const router = Router();


router.route("/:id").get(fetchUser);

export default router;