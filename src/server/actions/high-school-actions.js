"use server";

import {
  fetchHighSchoolData,
  getCurrentUserId,
} from "@/data/user/high-school-data";
import {
  updateHighSchoolData,
  deleteHighSchool,
} from "@/server/user/high-school-server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Server action to fetch high school data for a user
 * @param {string} userId - The user's ID
 */
export async function fetchHighSchoolDataAction(userId) {
  return fetchHighSchoolData(userId);
}

/**
 * Server action to update high school data
 * @param {Object} data - The high school data
 * @param {string} userId - The user's ID
 */
export async function updateHighSchoolDataAction(data, userId) {
  return updateHighSchoolData(data, userId);
}

/**
 * Server action to delete high school entry
 * @param {string} highSchoolId - The high school entry ID
 * @param {string} userId - The user's ID
 */
export async function deleteHighSchoolAction(highSchoolId, userId) {
  return deleteHighSchool(highSchoolId, userId);
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
