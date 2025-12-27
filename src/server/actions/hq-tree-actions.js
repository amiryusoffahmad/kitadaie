"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Get mentees for a mentor (users where murobbi_id = current user's username)
 * @returns {Promise<Array>} List of mentees
 */
export async function getMentees() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Get current user's username
    const currentUser = await db("user")
      .where({ id: session.user.id })
      .select("username")
      .first();

    if (!currentUser?.username) {
      return [];
    }

    // Find all users where murobbi_id matches current user's username
    const mentees = await db("users_profile")
      .join("user", "users_profile.id", "=", "user.id")
      .where("users_profile.murobbi_id", currentUser.username)
      .select(
        "user.id",
        "user.name",
        "user.username",
        "user.email",
        "user.image",
        "users_profile.first_name",
        "users_profile.branch"
      )
      .orderBy("users_profile.first_name");

    return mentees;
  } catch (error) {
    console.error("Error fetching mentees:", error);
    throw error;
  }
}

/**
 * Get mentor for current user (user whose username = murobbi_id)
 * @returns {Promise<Object|null>} Mentor info or null
 */
export async function getMentor() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Get current user's profile
    const profile = await db("users_profile")
      .where({ id: session.user.id })
      .select("murobbi_id")
      .first();

    if (!profile?.murobbi_id) {
      return null;
    }

    // Find mentor by username
    const mentor = await db("user")
      .join("users_profile", "user.id", "=", "users_profile.id")
      .where("user.username", profile.murobbi_id)
      .select(
        "user.id",
        "user.name",
        "user.username",
        "user.email",
        "user.image",
        "users_profile.first_name",
        "users_profile.branch"
      )
      .first();

    return mentor;
  } catch (error) {
    console.error("Error fetching mentor:", error);
    throw error;
  }
}

/**
 * Get full profile data for a user (read-only view)
 * @param {string} userId - User ID to fetch
 * @returns {Promise<Object>} Complete profile data
 */
export async function getUserFullProfile(userId) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Verify user is either viewing their mentor or their mentee
    const currentUser = await db("user")
      .where({ id: session.user.id })
      .select("username")
      .first();

    const currentProfile = await db("users_profile")
      .where({ id: session.user.id })
      .select("murobbi_id")
      .first();

    const targetUser = await db("user")
      .where({ id: userId })
      .select("username")
      .first();

    const targetProfile = await db("users_profile")
      .where({ id: userId })
      .select("murobbi_id")
      .first();

    // Check if current user is mentor of target OR target is mentor of current user
    const isMentor = targetProfile?.murobbi_id === currentUser?.username;
    const isMentee = currentProfile?.murobbi_id === targetUser?.username;

    if (!isMentor && !isMentee) {
      throw new Error("Unauthorized: Can only view mentor or mentee profiles");
    }

    // Fetch all profile data
    const [user, profile, personalInfo, highSchool, education, family, certifications] = await Promise.all([
      db("user")
        .where({ id: userId })
        .select("id", "name", "username", "email", "image")
        .first(),

      db("users_profile")
        .where({ id: userId })
        .first(),

      db("personal_information")
        .where({ user_id: userId })
        .first(),

      db("high_school")
        .where({ user_id: userId })
        .first(),

      db("education")
        .where({ user_id: userId })
        .orderBy("created_at", "desc"),

      db("family")
        .where({ user_id: userId })
        .orderBy("relationship"),

      db("certification")
        .where({ USER_ID: userId })
        .orderBy("YEAR_OBTAINED", "desc")
    ]);

    return {
      user,
      profile,
      personalInfo,
      highSchool,
      education,
      family,
      certifications
    };
  } catch (error) {
    console.error("Error fetching user full profile:", error);
    throw error;
  }
}
