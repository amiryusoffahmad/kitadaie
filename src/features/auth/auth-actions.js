"use server";

import { db } from "@/lib/db";

export const assignUserRole = async (userId, role = "member") => {
  try {
    await db.transaction(async (trx) => {
      // Cek apakah user sudah memiliki role
      const existingRole = await trx("user_roles")
        .where({ user_id: userId })
        .first();

      if (!existingRole) {
        await trx("user_roles").insert({ user_id: userId, role });
        console.log(`✅ Role "${role}" assigned to user ${userId}`);
      } else {
        console.log(`ℹ️ User ${userId} already has a role.`);
      }
    });
  } catch (error) {
    console.error("❌ Error assigning role:", error);
    throw new Error("Failed to assign user role");
  }
};

// Function to assign a sequential username starting from 1000
export const assignUsername = async (userId) => {
  try {
    await db.transaction(async (trx) => {
      // Find the highest username number currently in use
      const highestUsername = await trx("user")
        .whereRaw("username REGEXP '^[0-9]+$'")
        .orderByRaw("CAST(username AS UNSIGNED) DESC")
        .first()
        .select("username");

      // Start from 1000 or increment the highest existing username by 1
      let nextUsername = 1000;
      if (highestUsername && highestUsername.username) {
        nextUsername = parseInt(highestUsername.username) + 1;
      }

      // Update the user with the new username
      await trx("user").where({ id: userId }).update({
        username: nextUsername.toString(),
        updatedAt: new Date(),
      });

      console.log(`✅ Assigned username ${nextUsername} to user ${userId}`);
      return nextUsername.toString();
    });
  } catch (error) {
    console.error("❌ Error assigning username:", error);
    throw new Error("Failed to assign username");
  }
};
