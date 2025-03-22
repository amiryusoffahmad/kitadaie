"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Updates or creates high school data for a user
 * @param {Object} data - The high school data
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Result of the update operation
 */
export async function updateHighSchoolData(data, userId) {
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
      // 2. Prepare high school data
      const highSchoolData = {
        user_id: userId,
        state: data.state,
        type: data.type,
        school_name: data.school_name,
        position: data.position,
        spm_result: data.spm_result,
        highest_achievement: data.highest_achievement,
        spm_year: data.spm_year,
      };

      let result;

      // Check if high school record already exists for the user
      const existingRecord = await trx("high_school")
        .where({ user_id: userId })
        .first();

      if (existingRecord) {
        // Update existing record
        await trx("high_school")
          .where({ id: existingRecord.id })
          .update({
            ...highSchoolData,
            updated_at: trx.fn.now(),
          });

        result = { id: existingRecord.id, ...highSchoolData };
      } else {
        // Insert new record
        const [id] = await trx("high_school").insert(highSchoolData);
        result = { id, ...highSchoolData };
      }

      // Commit the transaction
      await trx.commit();

      // Revalidate the education path to update the UI
      revalidatePath("/profile/education");

      return { success: true, data: result };
    } catch (error) {
      // Rollback the transaction on error
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error updating high school data:", error);
    throw error;
  }
}

/**
 * Deletes a high school entry
 * @param {string} highSchoolId - The high school entry ID
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Result of the delete operation
 */
export async function deleteHighSchool(highSchoolId, userId) {
  try {
    if (!highSchoolId || !userId) {
      throw new Error("High School ID and User ID are required");
    }

    // Check if the high school entry exists and belongs to the user
    const highSchoolExists = await db("high_school")
      .where({
        id: highSchoolId,
        user_id: userId,
      })
      .first();

    if (!highSchoolExists) {
      throw new Error("High school entry not found or does not belong to user");
    }

    // Delete the high school entry
    await db("high_school").where({ id: highSchoolId }).del();

    // Revalidate the education path to update the UI
    revalidatePath("/profile/education");

    return { success: true };
  } catch (error) {
    console.error("Error deleting high school entry:", error);
    throw error;
  }
}
