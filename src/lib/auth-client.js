import { createAuthClient } from "better-auth/react";

// The sign-in page redirects to the configured auth origin before OAuth starts.
export const authClient = createAuthClient();

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
