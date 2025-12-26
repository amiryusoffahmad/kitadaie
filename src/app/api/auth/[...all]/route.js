import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);

// Disable static generation for auth routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
