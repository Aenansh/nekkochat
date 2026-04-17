import { Router } from "express";
import ImageKit from "imagekit";
import { env } from "../utils/env.ts";

const router = Router();

const imagekit = new ImageKit({
  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
  publicKey: env.IMAGEKIT_PUBLIC_KEY,
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
});

router.get("/imagekit-auth", (req, res) => {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    res.json(authenticationParameters);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate upload signature" });
  }
});

export default router;
