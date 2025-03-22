"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Updates or creates certification data for a user
 * @param {Object} data - The certification data
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Result of the update operation
 */
export async function updateCertification(data, userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // 1. Check if user exists
    const userExists = await db("user").where({ id: userId }).first();
    if (!userExists) {
      throw new Error("User not found");
    }

    // Start a transaction
    const trx = await db.transaction();

    try {
      // 2. Prepare certification data
      const certificationData = {
        user_id: userId,
        type: data.type,
        name: data.name,
        issuing_institution: data.issuing_institution,
        year_obtained: data.year_obtained,
      };

      let result;

      if (data.id) {
        // Update existing record
        await trx("certification")
          .where({
            id: data.id,
            user_id: userId, // Ensure the certification belongs to the user
          })
          .update({
            ...certificationData,
            updated_at: trx.fn.now(),
          });

        result = { id: data.id, ...certificationData };
      } else {
        // Insert new record
        const [id] = await trx("certification").insert(certificationData);
        result = { id, ...certificationData };
      }

      // Commit the transaction
      await trx.commit();

      // Revalidate the certification path to update the UI
      revalidatePath("/profile/certification");

      return { success: true, data: result };
    } catch (error) {
      // Rollback the transaction on error
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error updating certification data:", error);
    throw error;
  }
}

/**
 * Deletes a certification entry
 * @param {string} certificationId - The certification entry ID
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Result of the delete operation
 */
export async function deleteCertification(certificationId, userId) {
  try {
    if (!certificationId || !userId) {
      throw new Error("Certification ID and User ID are required");
    }

    // Check if the certification entry exists and belongs to the user
    const certificationExists = await db("certification")
      .where({
        id: certificationId,
        user_id: userId,
      })
      .first();

    if (!certificationExists) {
      throw new Error(
        "Certification entry not found or does not belong to user"
      );
    }

    // Delete the certification entry
    await db("certification").where({ id: certificationId }).del();

    // Revalidate the certification path to update the UI
    revalidatePath("/profile/certification");

    return { success: true };
  } catch (error) {
    console.error("Error deleting certification entry:", error);
    throw error;
  }
}
