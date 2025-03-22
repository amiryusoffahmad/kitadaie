"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Updates the user's personal data
 * @param {Object} data - The updated personal data
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Result of the update operation
 */
export async function updatePersonalData(data, userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // 1. Check if user exists
    const userExists = await db("user").where({ id: userId }).first();
    if (!userExists) {
      throw new Error("User not found");
    }

    // 2. Check if profile exists
    const profileExists = await db("users_profile")
      .where({ id: userId })
      .first();

    // Start a transaction
    const trx = await db.transaction();

    try {
      // 3. Update or insert profile data
      const profileData = {
        first_name: data.first_name,
        gender: data.gender,
        phone: data.phone,
        address: data.address,
        branch: data.branch,
        income_classification: data.income_classification,
        marital_status: data.marital_status,
        family_status: data.family_status,
        murobbi_id: data.murobbi_id,
        // Don't update email here - it's in the main user table
      };

      if (profileExists) {
        // Update existing profile
        await trx("users_profile")
          .where({ id: userId })
          .update({
            ...profileData,
            updated_at: trx.fn.now(),
          });
      } else {
        // Insert new profile
        await trx("users_profile").insert({
          id: userId,
          ...profileData,
        });
      }

      // 4. Update email in user table if it has changed
      if (data.email) {
        const user = await trx("user")
          .where({ id: userId })
          .select("email")
          .first();
        if (user && user.email !== data.email) {
          await trx("user").where({ id: userId }).update({
            email: data.email,
            updated_at: trx.fn.now(),
          });
        }
      }

      // 5. Update or insert IC number in personal_information table
      if (data.ic_no) {
        const personalInfoExists = await trx("personal_information")
          .where({ user_id: userId })
          .first();

        if (personalInfoExists) {
          // Update existing record
          await trx("personal_information").where({ user_id: userId }).update({
            ic_no: data.ic_no,
            updated_at: trx.fn.now(),
          });
        } else {
          // Insert new record
          await trx("personal_information").insert({
            user_id: userId,
            ic_no: data.ic_no,
          });
        }
      }

      // Commit the transaction
      await trx.commit();

      // Revalidate the profile path to update the UI
      revalidatePath("/profile/personal");

      return { success: true };
    } catch (error) {
      // Rollback the transaction on error
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error updating personal data:", error);
    throw error;
  }
}
