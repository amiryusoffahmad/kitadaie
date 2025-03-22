"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Updates or creates family data for a user
 * @param {Object} data - The family data
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Result of the update operation
 */
export async function updateFamily(data, userId) {
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
      // 2. Prepare family data
      const familyData = {
        user_id: userId,
        relationship: data.relationship,
        full_name: data.full_name,
        phone: data.phone || null,
        occupation: data.occupation || null,
        company: data.company || null,
        supports_dakwah: data.supports_dakwah || false,
        jemaah_name: data.jemaah_name || null,
      };

      let result;

      if (data.id) {
        // Update existing record
        await trx("family")
          .where({
            id: data.id,
            user_id: userId, // Ensure the family entry belongs to the user
          })
          .update({
            ...familyData,
            updated_at: trx.fn.now(),
          });

        result = { id: data.id, ...familyData };
      } else {
        // Insert new record
        const [id] = await trx("family").insert(familyData);
        result = { id, ...familyData };
      }

      // Commit the transaction
      await trx.commit();

      // Revalidate the family path to update the UI
      revalidatePath("/profile/family");

      return { success: true, data: result };
    } catch (error) {
      // Rollback the transaction on error
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error updating family data:", error);
    throw error;
  }
}

/**
 * Deletes a family entry
 * @param {string} familyId - The family entry ID
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Result of the delete operation
 */
export async function deleteFamily(familyId, userId) {
  try {
    if (!familyId || !userId) {
      throw new Error("Family ID and User ID are required");
    }

    // Check if the family entry exists and belongs to the user
    const familyExists = await db("family")
      .where({
        id: familyId,
        user_id: userId,
      })
      .first();

    if (!familyExists) {
      throw new Error("Family entry not found or does not belong to user");
    }

    // Delete the family entry
    await db("family").where({ id: familyId }).del();

    // Revalidate the family path to update the UI
    revalidatePath("/profile/family");

    return { success: true };
  } catch (error) {
    console.error("Error deleting family entry:", error);
    throw error;
  }
}
