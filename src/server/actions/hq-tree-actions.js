"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Gets the headquarters tree structure for the current user
 * Including their downlines (users who have set their murobbi_id to this user's username)
 */
export async function getHQTree() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    console.log(
      "[HQ TREE] Session user:",
      JSON.stringify(session?.user || {}, null, 2)
    );

    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Get the current user's username or id as fallback
    let username = session.user.username;
    const userId = session.user.id;

    console.log("[HQ TREE] Current user username:", username);
    console.log("[HQ TREE] Current user ID:", userId);

    // If username is not available, try to get it from the database using user ID
    if (!username && userId) {
      console.log(
        "[HQ TREE] Username not found in session, trying to fetch from database using ID"
      );

      const userRecord = await db("user")
        .where("id", userId)
        .select("username")
        .first();

      if (userRecord && userRecord.username) {
        username = userRecord.username;
        console.log("[HQ TREE] Found username in database:", username);
      } else {
        // If still no username, use user ID as identifier
        console.log(
          "[HQ TREE] Username not found in database, using user ID as identifier"
        );
        username = userId;
      }
    }

    if (!username) {
      throw new Error("No identifier found for the user");
    }

    // First, check if the user exists in the database
    const userCheck = await db("user").where("id", userId).first();

    console.log(
      "[HQ TREE] User check result:",
      JSON.stringify(userCheck || {}, null, 2)
    );

    // Log what we're searching for - we'll search for both username and ID
    console.log(
      "[HQ TREE] Searching for downlines with murobbi_id =",
      username
    );

    // Check all murobbi_id values in users_profile to debug
    const allMurobbiIds = await db("users_profile")
      .select("id", "murobbi_id")
      .whereNotNull("murobbi_id");

    console.log(
      "[HQ TREE] All murobbi_id values in database:",
      JSON.stringify(allMurobbiIds, null, 2)
    );

    // Get all users that have their murobbi_id set to either the current user's username OR ID
    // This allows flexibility in how murobbi_id is set
    const downlines = await db("users_profile")
      .where(function () {
        this.where("murobbi_id", username).orWhere("murobbi_id", userId);
      })
      .join("user", "users_profile.id", "=", "user.id")
      .select(
        "user.id",
        "user.name",
        "user.username",
        "user.email",
        "user.image"
      );

    console.log(
      "[HQ TREE] Found downlines:",
      JSON.stringify(downlines, null, 2)
    );
    console.log("[HQ TREE] Number of downlines found:", downlines.length);

    return {
      success: true,
      data: {
        username,
        downlines,
      },
    };
  } catch (error) {
    console.error("[SERVER ACTION] Error in getHQTree:", error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Gets profile data for a specific user
 * @param {string} userId - The user's ID to fetch profile data for
 */
export async function getUserProfile(userId) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Fetch basic user data
    const userData = await db("user")
      .where("id", userId)
      .select("id", "name", "email", "image", "username")
      .first();

    if (!userData) {
      throw new Error("User not found");
    }

    // Fetch profile data
    const profileData = await db("users_profile")
      .where("id", userId)
      .select(
        "first_name",
        "gender",
        "phone",
        "address",
        "branch",
        "income_classification",
        "marital_status",
        "family_status",
        "murobbi_id"
      )
      .first();

    // Fetch IC number from personal_information
    const personalInfo = await db("personal_information")
      .where("user_id", userId)
      .select("ic_no")
      .first();

    return {
      success: true,
      data: {
        id: userData.id,
        email: userData.email || "",
        name: userData.name || "",
        image: userData.image || "",
        username: userData.username || "",
        first_name: profileData?.first_name || "",
        gender: profileData?.gender || "",
        phone: profileData?.phone || "",
        address: profileData?.address || "",
        branch: profileData?.branch || "",
        income_classification: profileData?.income_classification || "",
        marital_status: profileData?.marital_status || "",
        family_status: profileData?.family_status || "",
        murobbi_id: profileData?.murobbi_id || "",
        ic_no: personalInfo?.ic_no || "",
      },
    };
  } catch (error) {
    console.error("[SERVER ACTION] Error in getUserProfile:", error.message);
    return { success: false, message: error.message };
  }
}
