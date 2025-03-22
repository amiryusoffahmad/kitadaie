// User high school data fetching functions
import "server-only";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Fetches the high school data for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - The user's high school data
 */
export async function fetchHighSchoolData(userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Fetch high school data from high_school table
    const highSchoolData = await db("high_school")
      .select(
        "id",
        "state",
        "type",
        "school_name",
        "position",
        "spm_result",
        "highest_achievement",
        "spm_year"
      )
      .where({ user_id: userId })
      .first();

    return highSchoolData || null;
  } catch (error) {
    console.error("Error fetching high school data:", error);
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
