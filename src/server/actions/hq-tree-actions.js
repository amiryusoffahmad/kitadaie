"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Helper function to get the current user's username
 * @param {Object} session - The user session object
 * @returns {Promise<string>} - The username
 */
async function getUserUsername(session) {
  if (!session?.user?.id) {
    throw new Error("User ID not found in session");
  }

  const userId = session.user.id;

  // Fetch username from database using user ID
  const userRecord = await db("user")
    .where("id", userId)
    .select("username")
    .first();

  if (!userRecord || !userRecord.username) {
    throw new Error("Username not found for the current user");
  }

  return userRecord.username;
}

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

    // Get the current user's username using helper function
    const username = await getUserUsername(session);
    const userId = session.user.id;

    console.log("[HQ TREE] Current user username:", username);
    console.log("[HQ TREE] Current user ID:", userId);

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

/**
 * Creates a new HQ
 * @param {string} name - The name of the HQ
 */
export async function createHQ(name) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Get the current user's username using helper function
    const username = await getUserUsername(session);

    // Check if user has downlines
    const downlines = await db("users_profile")
      .where("murobbi_id", username)
      .orWhere("murobbi_id", session.user.id)
      .count("id as count")
      .first();

    if (!downlines || downlines.count === 0) {
      throw new Error("You must have downlines to create an HQ");
    }

    // Create new HQ
    const [hqId] = await db("hq_tree").insert({
      name,
      created_by: username,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      success: true,
      data: { id: hqId, name },
    };
  } catch (error) {
    console.error("[SERVER ACTION] Error in createHQ:", error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Gets all HQs created by the current user
 */
export async function getUserHQs() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Get the current user's username using helper function
    const username = await getUserUsername(session);

    const hqs = await db("hq_tree")
      .where("created_by", username)
      .select("id", "name", "created_at", "updated_at");

    return {
      success: true,
      data: hqs,
    };
  } catch (error) {
    console.error("[SERVER ACTION] Error in getUserHQs:", error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Updates an existing HQ
 * @param {number} id - The ID of the HQ to update
 * @param {string} name - The new name for the HQ
 */
export async function updateHQ(id, name) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Get the current user's username using helper function
    const username = await getUserUsername(session);

    // Check if the HQ exists and belongs to the current user
    const hq = await db("hq_tree")
      .where({
        id,
        created_by: username,
      })
      .first();

    if (!hq) {
      throw new Error("HQ not found or you don't have permission to update it");
    }

    await db("hq_tree").where("id", id).update({
      name,
      updated_at: new Date(),
    });

    return {
      success: true,
      data: { id, name },
    };
  } catch (error) {
    console.error("[SERVER ACTION] Error in updateHQ:", error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Deletes an HQ
 * @param {number} id - The ID of the HQ to delete
 */
export async function deleteHQ(id) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Get the current user's username using helper function
    const username = await getUserUsername(session);

    // Check if the HQ exists and belongs to the current user
    const hq = await db("hq_tree")
      .where({
        id,
        created_by: username,
      })
      .first();

    if (!hq) {
      throw new Error("HQ not found or you don't have permission to delete it");
    }

    // First, delete all assignments associated with this HQ
    await db("hq_assignment").where("hq_id", id).delete();

    // Then delete the HQ itself
    await db("hq_tree").where("id", id).delete();

    return {
      success: true,
      message: "HQ deleted successfully",
    };
  } catch (error) {
    console.error("[SERVER ACTION] Error in deleteHQ:", error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Assigns a user to an HQ
 * @param {number} hqId - The ID of the HQ
 * @param {string} userUsername - The username of the user to assign
 */
export async function assignUserToHQ(hqId, userUsername) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Get the current user's username using helper function
    const username = await getUserUsername(session);

    // Check if the HQ exists and belongs to the current user
    const hq = await db("hq_tree")
      .where({
        id: hqId,
        created_by: username,
      })
      .first();

    if (!hq) {
      throw new Error(
        "HQ not found or you don't have permission to assign users to it"
      );
    }

    // Check if the user is in the downlines
    const userIsDownline = await db("users_profile")
      .where(function () {
        this.where("murobbi_id", username).orWhere(
          "murobbi_id",
          session.user.id
        );
      })
      .join("user", "users_profile.id", "=", "user.id")
      .where("user.username", userUsername)
      .first();

    if (!userIsDownline) {
      throw new Error("User is not in your downlines");
    }

    // Check if assignment already exists
    const existingAssignment = await db("hq_assignment")
      .where({
        hq_id: hqId,
        user_username: userUsername,
      })
      .first();

    if (existingAssignment) {
      throw new Error("User is already assigned to this HQ");
    }

    // Create the assignment
    await db("hq_assignment").insert({
      hq_id: hqId,
      user_username: userUsername,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      success: true,
      message: "User assigned to HQ successfully",
    };
  } catch (error) {
    console.error("[SERVER ACTION] Error in assignUserToHQ:", error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Removes a user from an HQ
 * @param {number} hqId - The ID of the HQ
 * @param {string} userUsername - The username of the user to remove
 */
export async function removeUserFromHQ(hqId, userUsername) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Get the current user's username using helper function
    const username = await getUserUsername(session);

    // Check if the HQ exists and belongs to the current user
    const hq = await db("hq_tree")
      .where({
        id: hqId,
        created_by: username,
      })
      .first();

    if (!hq) {
      throw new Error("HQ not found or you don't have permission to manage it");
    }

    // Delete the assignment
    await db("hq_assignment")
      .where({
        hq_id: hqId,
        user_username: userUsername,
      })
      .delete();

    return {
      success: true,
      message: "User removed from HQ successfully",
    };
  } catch (error) {
    console.error("[SERVER ACTION] Error in removeUserFromHQ:", error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Gets all users assigned to a specific HQ
 * @param {number} hqId - The ID of the HQ
 */
export async function getHQAssignments(hqId) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Get the current user's username using helper function
    const username = await getUserUsername(session);

    // Check if the HQ exists and belongs to the current user
    const hq = await db("hq_tree")
      .where({
        id: hqId,
        created_by: username,
      })
      .first();

    if (!hq) {
      throw new Error("HQ not found or you don't have permission to view it");
    }

    // Get all users assigned to this HQ
    const assignments = await db("hq_assignment")
      .where("hq_id", hqId)
      .join("user", "hq_assignment.user_username", "=", "user.username")
      .select(
        "user.id",
        "user.name",
        "user.username",
        "user.email",
        "user.image",
        "hq_assignment.created_at as assigned_at"
      );

    return {
      success: true,
      data: assignments,
    };
  } catch (error) {
    console.error("[SERVER ACTION] Error in getHQAssignments:", error.message);
    return { success: false, message: error.message };
  }
}
