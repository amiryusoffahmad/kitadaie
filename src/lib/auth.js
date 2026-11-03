import { assignUserRole, assignUsername } from "@/features/auth/auth-actions";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { createPool } from "mysql2/promise";

const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL;

export const auth = betterAuth({
  appName: "Kita Daie",
  baseURL,
  database: createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  }),
  socialProviders: {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [nextCookies()],
  trustedOrigins: baseURL ? [new URL(baseURL).origin] : undefined,
  onAPIError: { errorURL: "/sign-in" },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await assignUserRole(user.id);
          await assignUsername(user.id);
        },
      },
    },
  },
  advanced: {
    cookiePrefix: "kitadaie",
  },
});
