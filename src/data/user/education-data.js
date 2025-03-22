// User education data fetching functions
import "server-only";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Fetches the education data for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - The user's education data
 */
export async function fetchEducationData(userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Fetch education data from education table
    const educationData = await db("education")
      .select(
        "id",
        "university",
        "field_of_study",
        "degree",
        "start_year",
        "end_year",
        "is_current"
      )
      .where({ user_id: userId });

    if (!educationData) {
      return [];
    }

    return educationData;
  } catch (error) {
    console.error("Error fetching education data:", error);
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
