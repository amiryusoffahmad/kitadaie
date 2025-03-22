"use server";

import { fetchFamilyData, getCurrentUserId } from "@/data/user/family-data";
import { updateFamily, deleteFamily } from "@/server/user/family-server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Server action to fetch family data for a user
 * @param {string} userId - The user's ID
 */
export async function fetchFamilyDataAction(userId) {
  return fetchFamilyData(userId);
}

/**
 * Server action to update family data
 * @param {Object} data - The family data
 * @param {string} userId - The user's ID
 */
export async function updateFamilyAction(data, userId) {
  return updateFamily(data, userId);
}

/**
 * Server action to delete family entry
 * @param {string} familyId - The family entry ID
 * @param {string} userId - The user's ID
 */
export async function deleteFamilyAction(familyId, userId) {
  return deleteFamily(familyId, userId);
}

/**
 * Server action to get the current user ID
 */
export async function getCurrentUserIdAction() {
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
