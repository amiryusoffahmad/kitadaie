"use server";

import { db } from "@/lib/db";

/**
 * Get user details by identifier (username, email, or user ID)
 * This function does not require authentication to allow users to look up their own details
 * @param {string} identifier - The user identifier (username, email, or ID)
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function getUserDetails(identifier) {
    try {
        if (!identifier || typeof identifier !== "string") {
            return {
                success: false,
                message: "ID pengguna diperlukan",
            };
        }

        const trimmedIdentifier = identifier.trim();

        // Try to find user by username, email, or ID
        const user = await db("user")
            .where("username", trimmedIdentifier)
            .orWhere("email", trimmedIdentifier)
            .orWhere("id", trimmedIdentifier)
            .first();

        if (!user) {
            return {
                success: false,
                message: "Pengguna tidak dijumpai",
            };
        }

        // Fetch user profile for branch information
        const profile = await db("users_profile")
            .where("id", user.id)
            .first();

        return {
            success: true,
            message: "Pengguna dijumpai",
            data: {
                email: user.email || "",
                name: user.name || "",
                branch: profile?.branch || "",
            },
        };
    } catch (error) {
        console.error("Error fetching user details:", error);
        return {
            success: false,
            message: "Ralat semasa mendapatkan maklumat pengguna",
        };
    }
}
