"use server";

import { db } from "@/lib/db";

/**
 * Assign a user to a role and/or department
 * @param {Object} params - Assignment parameters
 * @param {string} params.userId - User ID
 * @param {number} [params.roleId] - Role ID (optional)
 * @param {number} [params.departmentId] - Department ID (optional)
 * @returns {Promise<Object>} - Created assignment
 */
export async function assignUserToRoleDepartment({
  userId,
  roleId = null,
  departmentId = null,
}) {
  try {
    // Validate required fields
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!roleId && !departmentId) {
      throw new Error("At least one of role ID or department ID must be provided");
    }

    // Check if user exists
    const userExists = await db("user").where({ id: userId }).first();
    if (!userExists) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Check if role exists (if provided)
    if (roleId) {
      const roleExists = await db("org_roles").where({ id: roleId }).first();
      if (!roleExists) {
        throw new Error(`Role with ID ${roleId} not found`);
      }
    }

    // Check if department exists (if provided)
    if (departmentId) {
      const departmentExists = await db("departments")
        .where({ id: departmentId })
        .first();
      if (!departmentExists) {
        throw new Error(`Department with ID ${departmentId} not found`);
      }
    }

    // Check if assignment already exists
    const existingAssignment = await db("user_role_department_assignments")
      .where({
        user_id: userId,
        role_id: roleId,
        department_id: departmentId,
      })
      .first();

    if (existingAssignment) {
      // If exists but inactive, reactivate it
      if (!existingAssignment.is_active) {
        await db("user_role_department_assignments")
          .where({ id: existingAssignment.id })
          .update({
            is_active: true,
            updated_at: db.fn.now(),
          });
        return await getAssignmentById(existingAssignment.id);
      }
      throw new Error("Assignment already exists and is active");
    }

    // Create the assignment
    const [assignmentId] = await db("user_role_department_assignments").insert({
      user_id: userId,
      role_id: roleId,
      department_id: departmentId,
      is_active: true,
    });

    // Return the created assignment with related data
    return await getAssignmentById(assignmentId);
  } catch (error) {
    console.error("Error assigning user to role/department:", error);
    throw new Error(`Failed to create assignment: ${error.message}`);
  }
}

/**
 * Get an assignment by ID with related user, role, and department data
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<Object|null>} - Assignment with related data
 */
export async function getAssignmentById(assignmentId) {
  try {
    if (!assignmentId) {
      throw new Error("Assignment ID is required");
    }

    const assignment = await db("user_role_department_assignments as urda")
      .leftJoin("user as u", "urda.user_id", "u.id")
      .leftJoin("org_roles as r", "urda.role_id", "r.id")
      .leftJoin("departments as d", "urda.department_id", "d.id")
      .where("urda.id", assignmentId)
      .select(
        "urda.*",
        "u.name as user_name",
        "u.email as user_email",
        "r.name as role_name",
        "r.code as role_code",
        "d.name as department_name",
        "d.code as department_code"
      )
      .first();

    return assignment || null;
  } catch (error) {
    console.error("Error getting assignment by ID:", error);
    throw new Error(`Failed to get assignment: ${error.message}`);
  }
}

/**
 * Remove a user assignment (soft delete by setting is_active to false)
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<boolean>} - True if removed successfully
 */
export async function removeUserAssignment(assignmentId) {
  try {
    if (!assignmentId) {
      throw new Error("Assignment ID is required");
    }

    // Check if assignment exists
    const existing = await db("user_role_department_assignments")
      .where({ id: assignmentId })
      .first();

    if (!existing) {
      throw new Error(`Assignment with ID ${assignmentId} not found`);
    }

    // Soft delete by setting is_active to false
    await db("user_role_department_assignments")
      .where({ id: assignmentId })
      .update({
        is_active: false,
        updated_at: db.fn.now(),
      });

    return true;
  } catch (error) {
    console.error("Error removing user assignment:", error);
    throw new Error(`Failed to remove assignment: ${error.message}`);
  }
}

/**
 * Get all assignments for a specific user
 * @param {string} userId - User ID
 * @param {boolean} [activeOnly=true] - Only return active assignments
 * @returns {Promise<Array>} - List of assignments
 */
export async function getUserAssignments(userId, activeOnly = true) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    let query = db("user_role_department_assignments as urda")
      .leftJoin("org_roles as r", "urda.role_id", "r.id")
      .leftJoin("departments as d", "urda.department_id", "d.id")
      .where("urda.user_id", userId)
      .select(
        "urda.*",
        "r.id as role_id",
        "r.name as role_name",
        "r.code as role_code",
        "d.id as department_id",
        "d.name as department_name",
        "d.code as department_code"
      );

    if (activeOnly) {
      query = query.where("urda.is_active", true);
    }

    const assignments = await query.orderBy("urda.assigned_at", "desc");

    return assignments;
  } catch (error) {
    console.error("Error getting user assignments:", error);
    throw new Error(`Failed to get user assignments: ${error.message}`);
  }
}

/**
 * Get all users assigned to a specific role and/or department
 * @param {Object} params - Query parameters
 * @param {number} [params.roleId] - Role ID
 * @param {number} [params.departmentId] - Department ID
 * @param {boolean} [params.activeOnly=true] - Only return active assignments
 * @returns {Promise<Array>} - List of users with their assignment details
 */
export async function getUsersByRoleAndDepartment({
  roleId = null,
  departmentId = null,
  activeOnly = true,
}) {
  try {
    if (!roleId && !departmentId) {
      throw new Error("At least one of role ID or department ID must be provided");
    }

    let query = db("user_role_department_assignments as urda")
      .join("user as u", "urda.user_id", "u.id")
      .leftJoin("org_roles as r", "urda.role_id", "r.id")
      .leftJoin("departments as d", "urda.department_id", "d.id")
      .select(
        "u.id as user_id",
        "u.name as user_name",
        "u.email as user_email",
        "u.username as username",
        "urda.id as assignment_id",
        "r.id as role_id",
        "r.name as role_name",
        "r.code as role_code",
        "d.id as department_id",
        "d.name as department_name",
        "d.code as department_code",
        "urda.assigned_at"
      );

    if (roleId) {
      query = query.where("urda.role_id", roleId);
    }

    if (departmentId) {
      query = query.where("urda.department_id", departmentId);
    }

    if (activeOnly) {
      query = query.where("urda.is_active", true);
    }

    const users = await query.orderBy("u.name", "asc");

    return users;
  } catch (error) {
    console.error("Error getting users by role/department:", error);
    throw new Error(`Failed to get users: ${error.message}`);
  }
}

/**
 * Get all active assignments with user, role, and department details
 * @param {Object} [filters] - Optional filters
 * @param {number} [filters.roleId] - Filter by role ID
 * @param {number} [filters.departmentId] - Filter by department ID
 * @param {boolean} [filters.activeOnly=true] - Only active assignments
 * @returns {Promise<Array>} - List of all assignments
 */
export async function getAllAssignments(filters = {}) {
  try {
    const { roleId, departmentId, activeOnly = true } = filters;

    let query = db("user_role_department_assignments as urda")
      .join("user as u", "urda.user_id", "u.id")
      .leftJoin("org_roles as r", "urda.role_id", "r.id")
      .leftJoin("departments as d", "urda.department_id", "d.id")
      .select(
        "urda.*",
        "u.name as user_name",
        "u.email as user_email",
        "u.username as username",
        "r.name as role_name",
        "r.code as role_code",
        "d.name as department_name",
        "d.code as department_code"
      );

    if (roleId) {
      query = query.where("urda.role_id", roleId);
    }

    if (departmentId) {
      query = query.where("urda.department_id", departmentId);
    }

    if (activeOnly) {
      query = query.where("urda.is_active", true);
    }

    const assignments = await query.orderBy([
      { column: "u.name", order: "asc" },
      { column: "urda.assigned_at", order: "desc" },
    ]);

    return assignments;
  } catch (error) {
    console.error("Error getting all assignments:", error);
    throw new Error(`Failed to get assignments: ${error.message}`);
  }
}

/**
 * Check if a user has a specific role-department assignment
 * @param {Object} params - Query parameters
 * @param {string} params.userId - User ID
 * @param {number} [params.roleId] - Role ID
 * @param {number} [params.departmentId] - Department ID
 * @returns {Promise<boolean>} - True if user has the assignment
 */
export async function userHasAssignment({ userId, roleId = null, departmentId = null }) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    let query = db("user_role_department_assignments")
      .where({
        user_id: userId,
        is_active: true,
      });

    if (roleId) {
      query = query.where("role_id", roleId);
    }

    if (departmentId) {
      query = query.where("department_id", departmentId);
    }

    const assignment = await query.first();

    return !!assignment;
  } catch (error) {
    console.error("Error checking user assignment:", error);
    throw new Error(`Failed to check assignment: ${error.message}`);
  }
}
