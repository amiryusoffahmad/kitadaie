import { assignUserRole } from "@/features/auth/auth-actions";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { createPool } from "mysql2/promise";

export const auth = betterAuth({
  appName: "Kita Daie",
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
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
  // COMMENT THE BELOW LINES DURING DEVELOPMENT
  trustedOrigins: ["https://dev.kitadaie.com/"],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await assignUserRole(user.id);
        },
      },
    },
  },
  // COMMENT THE BELOW LINES DURING DEVELOPMENT
  advanced: {
    cookiePrefix: "kitadaie",
    useSecureCookies: true,
  },
});
