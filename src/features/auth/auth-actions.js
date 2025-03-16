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
