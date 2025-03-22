"use server";

import {
  fetchEducationData,
  getCurrentUserId,
} from "@/data/user/education-data";
import {
  updateEducationData,
  deleteEducation,
} from "@/server/user/education-server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Server action to fetch education data for a user
 * @param {string} userId - The user's ID
 */
export async function fetchEducationDataAction(userId) {
  return fetchEducationData(userId);
}

/**
 * Server action to add/update education data
 * @param {Object} data - The education data
 * @param {string} userId - The user's ID
 */
export async function updateEducationDataAction(data, userId) {
  return updateEducationData(data, userId);
}

/**
 * Server action to delete education entry
 * @param {string} educationId - The education entry ID
 * @param {string} userId - The user's ID
 */
export async function deleteEducationAction(educationId, userId) {
  return deleteEducation(educationId, userId);
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
