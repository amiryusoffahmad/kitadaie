"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Updates or creates a new education entry for a user
 * @param {Object} data - The education data
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Result of the update operation
 */
export async function updateEducationData(data, userId) {
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
      // 2. Prepare education data
      const educationData = {
        user_id: userId,
        university: data.university,
        field_of_study: data.field_of_study,
        course: data.course,
        degree: data.degree,
        start_year: data.start_year,
        end_year: data.end_year,
        is_current: data.is_current || false,
        scholarship: data.scholarship,
      };

      let result;

      if (data.id) {
        // Update existing education entry
        // First verify the entry belongs to this user
        const educationExists = await trx("education")
          .where({
            id: data.id,
            user_id: userId,
          })
          .first();

        if (!educationExists) {
          throw new Error(
            "Education entry not found or does not belong to user"
          );
        }

        // Update the entry
        await trx("education")
          .where({ id: data.id })
          .update({
            ...educationData,
            updated_at: trx.fn.now(),
          });

        result = { id: data.id, ...educationData };
      } else {
        // Insert new education entry
        const [id] = await trx("education").insert(educationData);
        result = { id, ...educationData };
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
    console.error("Error updating education data:", error);
    throw error;
  }
}

/**
 * Deletes an education entry
 * @param {string} educationId - The education entry ID
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Result of the delete operation
 */
export async function deleteEducation(educationId, userId) {
  try {
    if (!educationId || !userId) {
      throw new Error("Education ID and User ID are required");
    }

    // Check if the education entry exists and belongs to the user
    const educationExists = await db("education")
      .where({
        id: educationId,
        user_id: userId,
      })
      .first();

    if (!educationExists) {
      throw new Error("Education entry not found or does not belong to user");
    }

    // Delete the education entry
    await db("education").where({ id: educationId }).del();

    // Revalidate the education path to update the UI
    revalidatePath("/profile/education");

    return { success: true };
  } catch (error) {
    console.error("Error deleting education entry:", error);
    throw error;
  }
}
