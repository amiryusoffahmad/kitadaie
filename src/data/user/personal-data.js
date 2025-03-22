// User personal data fetching functions
import "server-only";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Fetches the personal data for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - The user's personal data
 */
export async function fetchPersonalData(userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Fetch basic user data from user table
    const userData = await db("user")
      .select("id", "name", "email", "image")
      .where({ id: userId })
      .first();

    if (!userData) {
      throw new Error("User not found");
    }

    // Fetch profile data
    const profileData = await db("users_profile")
      .select(
        "first_name",
        "gender",
        "phone",
        "address",
        "profile_picture",
        "branch",
        "income_classification",
        "marital_status",
        "family_status",
        "murobbi_id"
      )
      .where({ id: userId })
      .first();

    // Fetch IC number from personal_information
    const personalInfo = await db("personal_information")
      .select("ic_no")
      .where({ user_id: userId })
      .first();

    // Combine the data with fallbacks for empty values
    return {
      id: userData.id,
      email: userData.email || "",
      name: userData.name || "",
      image: userData.image || "",
      first_name: profileData?.first_name || "",
      gender: profileData?.gender || "",
      phone: profileData?.phone || "",
      address: profileData?.address || "",
      branch: profileData?.branch || "",
      income_classification: profileData?.income_classification || "",
      marital_status: profileData?.marital_status || "",
      family_status: profileData?.family_status || "",
      profile_picture: profileData?.profile_picture || "",
      murobbi_id: profileData?.murobbi_id || "",
      ic_no: personalInfo?.ic_no || "",
    };
  } catch (error) {
    console.error("Error fetching personal data:", error);
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
