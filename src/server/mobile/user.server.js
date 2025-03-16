"use server";

import { db } from "@/lib/db";

export const getRole = async (userId) => {
  const data = await db("user_roles")
    .select("role")
    .where("user_id", userId)
    .first();

  return data;
};
