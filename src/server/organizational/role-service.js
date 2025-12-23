"use server";

import { db } from "@/lib/db";

/**
 * Get all organizational roles
 * @returns {Promise<Array>} - List of all roles
 */
export async function getRoles() {
  try {
    const roles = await db("org_roles")
      .select("*")
      .orderBy("name", "asc");

    return roles;
  } catch (error) {
    console.error("Error getting roles:", error);
    throw new Error(`Failed to get roles: ${error.message}`);
  }
}

/**
 * Get a single role by ID
 * @param {number} id - Role ID
 * @returns {Promise<Object|null>} - Role object or null if not found
 */
export async function getRoleById(id) {
  try {
    if (!id) {
      throw new Error("Role ID is required");
    }

    const role = await db("org_roles").where({ id }).first();

    return role || null;
  } catch (error) {
    console.error("Error getting role by ID:", error);
    throw new Error(`Failed to get role: ${error.message}`);
  }
}

/**
 * Get a role by code
 * @param {string} code - Role code
 * @returns {Promise<Object|null>} - Role object or null if not found
 */
export async function getRoleByCode(code) {
  try {
    if (!code) {
      throw new Error("Role code is required");
    }

    const role = await db("org_roles").where({ code }).first();

    return role || null;
  } catch (error) {
    console.error("Error getting role by code:", error);
    throw new Error(`Failed to get role: ${error.message}`);
  }
}

/**
 * Create a new organizational role
 * @param {Object} roleData - Role data
 * @param {string} roleData.name - Role name
 * @param {string} roleData.code - Role code (unique)
 * @param {string} [roleData.telegramGroupId] - Telegram group ID for notifications
 * @returns {Promise<Object>} - Created role
 */
export async function createRole({ name, code, telegramGroupId = null }) {
  try {
    // Validate required fields
    if (!name || !code) {
      throw new Error("Role name and code are required");
    }

    // Check if code already exists
    const existing = await getRoleByCode(code);
    if (existing) {
      throw new Error(`Role with code '${code}' already exists`);
    }

    const [roleId] = await db("org_roles").insert({
      name,
      code,
      telegram_group_id: telegramGroupId,
    });

    // Return the created role
    const role = await getRoleById(roleId);
    return role;
  } catch (error) {
    console.error("Error creating role:", error);
    throw new Error(`Failed to create role: ${error.message}`);
  }
}

/**
 * Update a role
 * @param {number} id - Role ID
 * @param {Object} updates - Fields to update
 * @param {string} [updates.name] - Role name
 * @param {string} [updates.code] - Role code
 * @param {string} [updates.telegramGroupId] - Telegram group ID
 * @returns {Promise<Object>} - Updated role
 */
export async function updateRole(id, updates) {
  try {
    if (!id) {
      throw new Error("Role ID is required");
    }

    // Check if role exists
    const existing = await getRoleById(id);
    if (!existing) {
      throw new Error(`Role with ID ${id} not found`);
    }

    // Prepare update object
    const updateData = {};

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }

    if (updates.code !== undefined) {
      // Check if new code conflicts with another role
      if (updates.code !== existing.code) {
        const conflicting = await getRoleByCode(updates.code);
        if (conflicting) {
          throw new Error(`Role with code '${updates.code}' already exists`);
        }
      }
      updateData.code = updates.code;
    }

    if (updates.telegramGroupId !== undefined) {
      updateData.telegram_group_id = updates.telegramGroupId;
    }

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return existing;
    }

    updateData.updated_at = db.fn.now();

    await db("org_roles").where({ id }).update(updateData);

    // Return updated role
    return await getRoleById(id);
  } catch (error) {
    console.error("Error updating role:", error);
    throw new Error(`Failed to update role: ${error.message}`);
  }
}

/**
 * Delete a role
 * @param {number} id - Role ID
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export async function deleteRole(id) {
  try {
    if (!id) {
      throw new Error("Role ID is required");
    }

    // Check if role exists
    const existing = await getRoleById(id);
    if (!existing) {
      throw new Error(`Role with ID ${id} not found`);
    }

    // Check if role has any assignments
    const assignmentCount = await db("user_role_department_assignments")
      .where({ role_id: id })
      .count("id as count")
      .first();

    if (assignmentCount && assignmentCount.count > 0) {
      throw new Error(
        "Cannot delete role with existing user assignments. Please remove all assignments first."
      );
    }

    // Delete the role
    await db("org_roles").where({ id }).delete();

    return true;
  } catch (error) {
    console.error("Error deleting role:", error);
    throw new Error(`Failed to delete role: ${error.message}`);
  }
}

/**
 * Get user count for a role
 * @param {number} roleId - Role ID
 * @returns {Promise<number>} - Number of users assigned to this role
 */
export async function getRoleUserCount(roleId) {
  try {
    if (!roleId) {
      throw new Error("Role ID is required");
    }

    const [result] = await db("user_role_department_assignments")
      .where({
        role_id: roleId,
        is_active: true,
      })
      .countDistinct("user_id as count");

    return result.count || 0;
  } catch (error) {
    console.error("Error getting role user count:", error);
    throw new Error(`Failed to get role user count: ${error.message}`);
  }
}
