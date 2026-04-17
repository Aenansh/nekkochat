import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PORT: z.coerce.number().default(8000),
    DATABASE_URL: z.string().url(),
    CLERK_PUBLISHABLE_KEY: z.string(),
    CLERK_SECRET_KEY: z.string(),
    MONGO_PASSWORD: z.string(),
    MONGO_URI: z.string(),
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
    CLERK_WEBHOOK_SECRET: z.string().min(1),
    CLERK_WEBHOOK_SECRET_DELETE: z.string().min(1),
    IMAGEKIT_URL_ENDPOINT: z.string().url(),
    IMAGEKIT_PUBLIC_KEY: z.string().min(1),
    IMAGEKIT_PRIVATE_KEY: z.string().min(1),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
