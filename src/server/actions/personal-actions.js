"use server";

import { fetchPersonalData, getCurrentUserId } from "@/data/user/personal-data";
import { updatePersonalData } from "@/server/user/profile-server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Server action to fetch personal data for a user
 * @param {string} userId - The user's ID
 */
export async function fetchPersonalDataAction(userId) {
  return fetchPersonalData(userId);
}

/**
 * Server action to update personal data
 * @param {Object} data - The updated personal data
 * @param {string} userId - The user's ID
 */
export async function updatePersonalDataAction(data, userId) {
  return updatePersonalData(data, userId);
}

/**
 * Server action to get the current user ID
 */
export async function getCurrentUserIdAction() {
  // Use the fixed implementation directly here too for redundancy
  try {
    const session = await auth.api.getSession({
      headers: headers(),
    });

    return session?.user?.id || null;
  } catch (error) {
    console.error("Error getting current user ID in action:", error);
    return null;
  }
}
