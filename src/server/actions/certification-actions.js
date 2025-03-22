"use server";

import {
  fetchCertificationData,
  getCurrentUserId,
} from "@/data/user/certification-data";
import {
  updateCertification,
  deleteCertification,
} from "@/server/user/certification-server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Server action to fetch certification data for a user
 * @param {string} userId - The user's ID
 */
export async function fetchCertificationDataAction(userId) {
  return fetchCertificationData(userId);
}

/**
 * Server action to update certification data
 * @param {Object} data - The certification data
 * @param {string} userId - The user's ID
 */
export async function updateCertificationAction(data, userId) {
  return updateCertification(data, userId);
}

/**
 * Server action to delete certification entry
 * @param {string} certificationId - The certification entry ID
 * @param {string} userId - The user's ID
 */
export async function deleteCertificationAction(certificationId, userId) {
  return deleteCertification(certificationId, userId);
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
