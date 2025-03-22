// User certification data fetching functions
import "server-only";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Fetches the certification data for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} - The user's certification data
 */
export async function fetchCertificationData(userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Fetch certification data from certification table
    const certificationData = await db("certification")
      .select("id", "type", "name", "issuing_institution", "year_obtained")
      .where({ user_id: userId })
      .orderBy("year_obtained", "desc");

    return certificationData || [];
  } catch (error) {
    console.error("Error fetching certification data:", error);
    throw error;
  }
}

/**
 * Get the current user ID from the session
 * @returns {Promise<string|null>} - The current user ID or null if not authenticated
 */
export async function getCurrentUserId() {
  try {
    // According to Better Auth docs, we need to pass headers to getSession
    const session = await auth.api.getSession({
      headers: headers(), // Pass Next.js headers object
    });

    return session?.user?.id || null;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
}
