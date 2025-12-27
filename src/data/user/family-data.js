// User family data fetching functions
import "server-only";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Fetches the family data for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} - The user's family data
 */
export async function fetchFamilyData(userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Fetch family data from family table
    const familyData = await db("family")
      .select(
        "id",
        "relationship",
        "full_name",
        "phone",
        "occupation",
        "company",
        "supports_dakwah",
        "jemaah_name",
        "linked_user_id"
      )
      .where({ user_id: userId })
      .orderBy("relationship");

    return familyData || [];
  } catch (error) {
    console.error("Error fetching family data:", error);
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
