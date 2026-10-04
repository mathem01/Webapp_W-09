import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";

import { db } from "@/db";
import * as authSchema from "@/db/schema/auth-schema"

if (!env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET er ikke satt.");
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: authSchema,
  }),

  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
  },
});