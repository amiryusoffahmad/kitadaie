"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getRole } from "@/server/user/user.server";
import * as departmentService from "../organizational/department-service";
import * as roleService from "../organizational/role-service";
import * as assignmentService from "../organizational/user-assignment-service";

/**
 * Check if current user is admin
 * @returns {Promise<boolean>}
 */
async function checkAdminPermission() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    throw new Error("Authentication required");
  }

  const roleData = await getRole(session.user.id);
  if (!roleData || roleData.role !== "admin") {
    throw new Error("Admin permission required");
  }

  return true;
}

// ============================================
// DEPARTMENT ACTIONS
// ============================================

/**
 * Get all departments
 * @returns {Promise<Object>}
 */
export async function fetchDepartments() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    const departments = await departmentService.getDepartments();

    return { success: true, data: departments };
  } catch (error) {
    console.error("Error fetching departments:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Create a new department (admin only)
 * @param {Object} data - Department data
 * @returns {Promise<Object>}
 */
export async function createDepartmentAction(data) {
  try {
    await checkAdminPermission();

    const department = await departmentService.createDepartment(data);

    revalidatePath("/admin-organizational");
    return { success: true, data: department, message: "Department created successfully" };
  } catch (error) {
    console.error("Error creating department:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Update a department (admin only)
 * @param {number} id - Department ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>}
 */
export async function updateDepartmentAction(id, updates) {
  try {
    await checkAdminPermission();

    const department = await departmentService.updateDepartment(id, updates);

    revalidatePath("/admin-organizational");
    return { success: true, data: department, message: "Department updated successfully" };
  } catch (error) {
    console.error("Error updating department:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Delete a department (admin only)
 * @param {number} id - Department ID
 * @returns {Promise<Object>}
 */
export async function deleteDepartmentAction(id) {
  try {
    await checkAdminPermission();

    await departmentService.deleteDepartment(id);

    revalidatePath("/admin-organizational");
    return { success: true, message: "Department deleted successfully" };
  } catch (error) {
    console.error("Error deleting department:", error);
    return { success: false, message: error.message };
  }
}

// ============================================
// ROLE ACTIONS
// ============================================

/**
 * Get all organizational roles
 * @returns {Promise<Object>}
 */
export async function fetchRoles() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    const roles = await roleService.getRoles();

    return { success: true, data: roles };
  } catch (error) {
    console.error("Error fetching roles:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Create a new role (admin only)
 * @param {Object} data - Role data
 * @returns {Promise<Object>}
 */
export async function createRoleAction(data) {
  try {
    await checkAdminPermission();

    const role = await roleService.createRole(data);

    revalidatePath("/admin-organizational");
    return { success: true, data: role, message: "Role created successfully" };
  } catch (error) {
    console.error("Error creating role:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Update a role (admin only)
 * @param {number} id - Role ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>}
 */
export async function updateRoleAction(id, updates) {
  try {
    await checkAdminPermission();

    const role = await roleService.updateRole(id, updates);

    revalidatePath("/admin-organizational");
    return { success: true, data: role, message: "Role updated successfully" };
  } catch (error) {
    console.error("Error updating role:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Delete a role (admin only)
 * @param {number} id - Role ID
 * @returns {Promise<Object>}
 */
export async function deleteRoleAction(id) {
  try {
    await checkAdminPermission();

    await roleService.deleteRole(id);

    revalidatePath("/admin-organizational");
    return { success: true, message: "Role deleted successfully" };
  } catch (error) {
    console.error("Error deleting role:", error);
    return { success: false, message: error.message };
  }
}

// ============================================
// USER ASSIGNMENT ACTIONS
// ============================================

/**
 * Assign a user to role and/or department (admin only)
 * @param {Object} data - Assignment data
 * @returns {Promise<Object>}
 */
export async function assignUserAction(data) {
  try {
    await checkAdminPermission();

    const assignment = await assignmentService.assignUserToRoleDepartment(data);

    revalidatePath("/admin-organizational");
    return { success: true, data: assignment, message: "User assigned successfully" };
  } catch (error) {
    console.error("Error assigning user:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Remove a user assignment (admin only)
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<Object>}
 */
export async function removeUserAssignmentAction(assignmentId) {
  try {
    await checkAdminPermission();

    await assignmentService.removeUserAssignment(assignmentId);

    revalidatePath("/admin-organizational");
    return { success: true, message: "Assignment removed successfully" };
  } catch (error) {
    console.error("Error removing assignment:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Get all assignments with filters (admin only)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>}
 */
export async function fetchAllAssignments(filters = {}) {
  try {
    await checkAdminPermission();

    const assignments = await assignmentService.getAllAssignments(filters);

    return { success: true, data: assignments };
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Get user assignments for current user
 * @returns {Promise<Object>}
 */
export async function fetchMyAssignments() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    const assignments = await assignmentService.getUserAssignments(session.user.id);

    return { success: true, data: assignments };
  } catch (error) {
    console.error("Error fetching user assignments:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Get assignments for a specific user (admin only)
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export async function fetchUserAssignments(userId) {
  try {
    await checkAdminPermission();

    const assignments = await assignmentService.getUserAssignments(userId);

    return { success: true, data: assignments };
  } catch (error) {
    console.error("Error fetching user assignments:", error);
    return { success: false, message: error.message };
  }
}
