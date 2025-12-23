"use server";

import { db } from "@/lib/db";

/**
 * Get all departments
 * @returns {Promise<Array>} - List of all departments
 */
export async function getDepartments() {
  try {
    const departments = await db("departments")
      .select("*")
      .orderBy("name", "asc");

    return departments;
  } catch (error) {
    console.error("Error getting departments:", error);
    throw new Error(`Failed to get departments: ${error.message}`);
  }
}

/**
 * Get a single department by ID
 * @param {number} id - Department ID
 * @returns {Promise<Object|null>} - Department object or null if not found
 */
export async function getDepartmentById(id) {
  try {
    if (!id) {
      throw new Error("Department ID is required");
    }

    const department = await db("departments").where({ id }).first();

    return department || null;
  } catch (error) {
    console.error("Error getting department by ID:", error);
    throw new Error(`Failed to get department: ${error.message}`);
  }
}

/**
 * Get a department by code
 * @param {string} code - Department code
 * @returns {Promise<Object|null>} - Department object or null if not found
 */
export async function getDepartmentByCode(code) {
  try {
    if (!code) {
      throw new Error("Department code is required");
    }

    const department = await db("departments").where({ code }).first();

    return department || null;
  } catch (error) {
    console.error("Error getting department by code:", error);
    throw new Error(`Failed to get department: ${error.message}`);
  }
}

/**
 * Create a new department
 * @param {Object} departmentData - Department data
 * @param {string} departmentData.name - Department name
 * @param {string} departmentData.code - Department code (unique)
 * @param {string} [departmentData.telegramGroupId] - Telegram group ID for notifications
 * @returns {Promise<Object>} - Created department
 */
export async function createDepartment({ name, code, telegramGroupId = null }) {
  try {
    // Validate required fields
    if (!name || !code) {
      throw new Error("Department name and code are required");
    }

    // Check if code already exists
    const existing = await getDepartmentByCode(code);
    if (existing) {
      throw new Error(`Department with code '${code}' already exists`);
    }

    const [departmentId] = await db("departments").insert({
      name,
      code,
      telegram_group_id: telegramGroupId,
    });

    // Return the created department
    const department = await getDepartmentById(departmentId);
    return department;
  } catch (error) {
    console.error("Error creating department:", error);
    throw new Error(`Failed to create department: ${error.message}`);
  }
}

/**
 * Update a department
 * @param {number} id - Department ID
 * @param {Object} updates - Fields to update
 * @param {string} [updates.name] - Department name
 * @param {string} [updates.code] - Department code
 * @param {string} [updates.telegramGroupId] - Telegram group ID
 * @returns {Promise<Object>} - Updated department
 */
export async function updateDepartment(id, updates) {
  try {
    if (!id) {
      throw new Error("Department ID is required");
    }

    // Check if department exists
    const existing = await getDepartmentById(id);
    if (!existing) {
      throw new Error(`Department with ID ${id} not found`);
    }

    // Prepare update object
    const updateData = {};

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }

    if (updates.code !== undefined) {
      // Check if new code conflicts with another department
      if (updates.code !== existing.code) {
        const conflicting = await getDepartmentByCode(updates.code);
        if (conflicting) {
          throw new Error(`Department with code '${updates.code}' already exists`);
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

    await db("departments").where({ id }).update(updateData);

    // Return updated department
    return await getDepartmentById(id);
  } catch (error) {
    console.error("Error updating department:", error);
    throw new Error(`Failed to update department: ${error.message}`);
  }
}

/**
 * Delete a department
 * @param {number} id - Department ID
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export async function deleteDepartment(id) {
  try {
    if (!id) {
      throw new Error("Department ID is required");
    }

    // Check if department exists
    const existing = await getDepartmentById(id);
    if (!existing) {
      throw new Error(`Department with ID ${id} not found`);
    }

    // Check if department has any assignments
    const assignmentCount = await db("user_role_department_assignments")
      .where({ department_id: id })
      .count("id as count")
      .first();

    if (assignmentCount && assignmentCount.count > 0) {
      throw new Error(
        "Cannot delete department with existing user assignments. Please remove all assignments first."
      );
    }

    // Delete the department
    await db("departments").where({ id }).delete();

    return true;
  } catch (error) {
    console.error("Error deleting department:", error);
    throw new Error(`Failed to delete department: ${error.message}`);
  }
}

/**
 * Get user count for a department
 * @param {number} departmentId - Department ID
 * @returns {Promise<number>} - Number of users assigned to this department
 */
export async function getDepartmentUserCount(departmentId) {
  try {
    if (!departmentId) {
      throw new Error("Department ID is required");
    }

    const [result] = await db("user_role_department_assignments")
      .where({
        department_id: departmentId,
        is_active: true,
      })
      .countDistinct("user_id as count");

    return result.count || 0;
  } catch (error) {
    console.error("Error getting department user count:", error);
    throw new Error(`Failed to get department user count: ${error.message}`);
  }
}
