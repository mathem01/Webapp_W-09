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
  basePath: "api/v1/auth",

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    // Lengde slår kompleksitet (NIST 2017). Må matche PASSWORD_MIN i
    // src/auth/schemas.ts og minLength på passordfeltet i skjemaene.
    minPasswordLength: 12,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dager
    updateAge: 60 * 60 * 24, // forleng cookie dagvis ved aktivitet
  },

  advanced: {
    cookies: {
      sessionToken: {
        attributes: { httpOnly: true, secure: true, sameSite: "lax" },
      },
    },
    generateId: () => crypto.randomUUID(),
  },
});

export type AuthSession = typeof auth.$Infer.Session;