"use server";

import { db } from "@/lib/db";

/**
 * Create a new organizational task
 * @param {Object} taskData - Task data
 * @param {string} taskData.title - Task title
 * @param {string} [taskData.description] - Task description
 * @param {string} [taskData.trainingType] - Type of training needed
 * @param {number} taskData.targetMonth - Target month (1-12)
 * @param {number} taskData.targetYear - Target year
 * @param {string} taskData.createdBy - User ID of creator
 * @returns {Promise<Object>} - Created task
 */
export async function createTask({
  title,
  description = null,
  trainingType = null,
  targetMonth,
  targetYear,
  createdBy,
}) {
  try {
    // Validate required fields
    if (!title || !targetMonth || !targetYear || !createdBy) {
      throw new Error("Title, target month, target year, and creator are required");
    }

    // Validate month (1-12)
    if (targetMonth < 1 || targetMonth > 12) {
      throw new Error("Target month must be between 1 and 12");
    }

    // Validate year
    const currentYear = new Date().getFullYear();
    if (targetYear < currentYear) {
      throw new Error("Target year cannot be in the past");
    }

    const [taskId] = await db("organizational_tasks").insert({
      title,
      description,
      training_type: trainingType,
      target_month: targetMonth,
      target_year: targetYear,
      status: "pending",
      created_by: createdBy,
    });

    // Return the created task
    const task = await getTaskById(taskId);
    return task;
  } catch (error) {
    console.error("Error creating task:", error);
    throw new Error(`Failed to create task: ${error.message}`);
  }
}

/**
 * Get a task by ID
 * @param {number} taskId - Task ID
 * @returns {Promise<Object|null>} - Task object or null if not found
 */
export async function getTaskById(taskId) {
  try {
    if (!taskId) {
      throw new Error("Task ID is required");
    }

    const task = await db("organizational_tasks as ot")
      .leftJoin("user as u", "ot.created_by", "u.id")
      .where("ot.id", taskId)
      .select(
        "ot.*",
        "u.name as creator_name",
        "u.email as creator_email"
      )
      .first();

    if (!task) {
      return null;
    }

    // Get task assignments
    const assignments = await getTaskAssignments(taskId);
    task.assignments = assignments;

    return task;
  } catch (error) {
    console.error("Error getting task by ID:", error);
    throw new Error(`Failed to get task: ${error.message}`);
  }
}

/**
 * Update a task
 * @param {number} taskId - Task ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated task
 */
export async function updateTask(taskId, updates) {
  try {
    if (!taskId) {
      throw new Error("Task ID is required");
    }

    // Check if task exists
    const existing = await db("organizational_tasks").where({ id: taskId }).first();
    if (!existing) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    // Prepare update object
    const updateData = {};

    if (updates.title !== undefined) {
      updateData.title = updates.title;
    }

    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }

    if (updates.trainingType !== undefined) {
      updateData.training_type = updates.trainingType;
    }

    if (updates.targetMonth !== undefined) {
      if (updates.targetMonth < 1 || updates.targetMonth > 12) {
        throw new Error("Target month must be between 1 and 12");
      }
      updateData.target_month = updates.targetMonth;
    }

    if (updates.targetYear !== undefined) {
      updateData.target_year = updates.targetYear;
    }

    if (updates.status !== undefined) {
      const validStatuses = ["pending", "in_progress", "completed"];
      if (!validStatuses.includes(updates.status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
      }
      updateData.status = updates.status;
    }

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return await getTaskById(taskId);
    }

    updateData.updated_at = db.fn.now();

    await db("organizational_tasks").where({ id: taskId }).update(updateData);

    // Return updated task
    return await getTaskById(taskId);
  } catch (error) {
    console.error("Error updating task:", error);
    throw new Error(`Failed to update task: ${error.message}`);
  }
}

/**
 * Delete a task
 * @param {number} taskId - Task ID
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export async function deleteTask(taskId) {
  try {
    if (!taskId) {
      throw new Error("Task ID is required");
    }

    // Check if task exists
    const existing = await db("organizational_tasks").where({ id: taskId }).first();
    if (!existing) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    // Delete the task (cascade will handle assignments, reminders, and completions)
    await db("organizational_tasks").where({ id: taskId }).delete();

    return true;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw new Error(`Failed to delete task: ${error.message}`);
  }
}

/**
 * Get tasks with optional filters
 * @param {Object} [filters] - Filter options
 * @param {string} [filters.status] - Filter by status
 * @param {number} [filters.month] - Filter by target month
 * @param {number} [filters.year] - Filter by target year
 * @param {number} [filters.limit] - Limit number of results
 * @param {number} [filters.offset] - Offset for pagination
 * @returns {Promise<Array>} - List of tasks
 */
export async function getTasks(filters = {}) {
  try {
    const { status, month, year, limit, offset } = filters;

    let query = db("organizational_tasks as ot")
      .leftJoin("user as u", "ot.created_by", "u.id")
      .select(
        "ot.*",
        "u.name as creator_name",
        "u.email as creator_email"
      );

    if (status) {
      query = query.where("ot.status", status);
    }

    if (month) {
      query = query.where("ot.target_month", month);
    }

    if (year) {
      query = query.where("ot.target_year", year);
    }

    // Order by target year and month descending
    query = query.orderBy([
      { column: "ot.target_year", order: "desc" },
      { column: "ot.target_month", order: "desc" },
      { column: "ot.created_at", order: "desc" },
    ]);

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.offset(offset);
    }

    const tasks = await query;

    return tasks;
  } catch (error) {
    console.error("Error getting tasks:", error);
    throw new Error(`Failed to get tasks: ${error.message}`);
  }
}

/**
 * Update task status
 * @param {number} taskId - Task ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - Updated task
 */
export async function updateTaskStatus(taskId, status) {
  try {
    return await updateTask(taskId, { status });
  } catch (error) {
    console.error("Error updating task status:", error);
    throw new Error(`Failed to update task status: ${error.message}`);
  }
}

/**
 * Assign a task to role and/or department
 * @param {number} taskId - Task ID
 * @param {Object} assignment - Assignment data
 * @param {number} [assignment.roleId] - Role ID
 * @param {number} [assignment.departmentId] - Department ID
 * @returns {Promise<Object>} - Created assignment
 */
export async function assignTaskToRoleDepartment(taskId, { roleId = null, departmentId = null }) {
  try {
    if (!taskId) {
      throw new Error("Task ID is required");
    }

    if (!roleId && !departmentId) {
      throw new Error("At least one of role ID or department ID must be provided");
    }

    // Check if task exists
    const taskExists = await db("organizational_tasks").where({ id: taskId }).first();
    if (!taskExists) {
      throw new Error(`Task with ID ${taskId} not found`);
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
      const departmentExists = await db("departments").where({ id: departmentId }).first();
      if (!departmentExists) {
        throw new Error(`Department with ID ${departmentId} not found`);
      }
    }

    // Check if this exact assignment already exists
    const existingAssignment = await db("task_assignments")
      .where({
        task_id: taskId,
        role_id: roleId,
        department_id: departmentId,
      })
      .first();

    if (existingAssignment) {
      return existingAssignment;
    }

    // Create the assignment
    const [assignmentId] = await db("task_assignments").insert({
      task_id: taskId,
      role_id: roleId,
      department_id: departmentId,
    });

    // Return the created assignment
    const assignment = await db("task_assignments")
      .where({ id: assignmentId })
      .first();

    return assignment;
  } catch (error) {
    console.error("Error assigning task:", error);
    throw new Error(`Failed to assign task: ${error.message}`);
  }
}

/**
 * Get task assignments with role and department details
 * @param {number} taskId - Task ID
 * @returns {Promise<Array>} - List of assignments
 */
export async function getTaskAssignments(taskId) {
  try {
    if (!taskId) {
      throw new Error("Task ID is required");
    }

    const assignments = await db("task_assignments as ta")
      .leftJoin("org_roles as r", "ta.role_id", "r.id")
      .leftJoin("departments as d", "ta.department_id", "d.id")
      .where("ta.task_id", taskId)
      .select(
        "ta.*",
        "r.name as role_name",
        "r.code as role_code",
        "r.telegram_group_id as role_telegram_group_id",
        "d.name as department_name",
        "d.code as department_code",
        "d.telegram_group_id as department_telegram_group_id"
      );

    return assignments;
  } catch (error) {
    console.error("Error getting task assignments:", error);
    throw new Error(`Failed to get task assignments: ${error.message}`);
  }
}

/**
 * Remove a task assignment
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<boolean>} - True if removed successfully
 */
export async function removeTaskAssignment(assignmentId) {
  try {
    if (!assignmentId) {
      throw new Error("Assignment ID is required");
    }

    await db("task_assignments").where({ id: assignmentId }).delete();

    return true;
  } catch (error) {
    console.error("Error removing task assignment:", error);
    throw new Error(`Failed to remove task assignment: ${error.message}`);
  }
}

/**
 * Get all users assigned to a task (via role-department matching)
 * @param {number} taskId - Task ID
 * @returns {Promise<Array>} - List of users
 */
export async function getUsersForTask(taskId) {
  try {
    if (!taskId) {
      throw new Error("Task ID is required");
    }

    // Get task assignments
    const taskAssignments = await getTaskAssignments(taskId);

    if (taskAssignments.length === 0) {
      return [];
    }

    // Build query to find users matching any of the task assignments
    const users = await db("user_role_department_assignments as urda")
      .join("user as u", "urda.user_id", "u.id")
      .leftJoin("org_roles as r", "urda.role_id", "r.id")
      .leftJoin("departments as d", "urda.department_id", "d.id")
      .where((builder) => {
        taskAssignments.forEach((assignment, index) => {
          const condition = {};
          if (assignment.role_id) {
            condition["urda.role_id"] = assignment.role_id;
          }
          if (assignment.department_id) {
            condition["urda.department_id"] = assignment.department_id;
          }

          if (index === 0) {
            builder.where(condition);
          } else {
            builder.orWhere(condition);
          }
        });
      })
      .where("urda.is_active", true)
      .select(
        "u.id as user_id",
        "u.name as user_name",
        "u.email as user_email",
        "u.username as username",
        "r.id as role_id",
        "r.name as role_name",
        "d.id as department_id",
        "d.name as department_name"
      )
      .groupBy("u.id");

    return users;
  } catch (error) {
    console.error("Error getting users for task:", error);
    throw new Error(`Failed to get users for task: ${error.message}`);
  }
}

/**
 * Get tasks assigned to a user based on their role-department assignments
 * @param {string} userId - User ID
 * @param {Object} [filters] - Optional filters
 * @param {string} [filters.status] - Filter by status
 * @param {number} [filters.month] - Filter by target month
 * @param {number} [filters.year] - Filter by target year
 * @returns {Promise<Array>} - List of tasks
 */
export async function getUserTasks(userId, filters = {}) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const { status, month, year } = filters;

    // Get user's active role-department assignments
    const userAssignments = await db("user_role_department_assignments")
      .where({
        user_id: userId,
        is_active: true,
      })
      .select("role_id", "department_id");

    if (userAssignments.length === 0) {
      return [];
    }

    // Build query to find tasks matching user's assignments
    let query = db("organizational_tasks as ot")
      .join("task_assignments as ta", "ot.id", "ta.task_id")
      .leftJoin("user as u", "ot.created_by", "u.id")
      .where((builder) => {
        userAssignments.forEach((assignment, index) => {
          const condition = {};
          if (assignment.role_id) {
            condition["ta.role_id"] = assignment.role_id;
          }
          if (assignment.department_id) {
            condition["ta.department_id"] = assignment.department_id;
          }

          if (index === 0) {
            builder.where(condition);
          } else {
            builder.orWhere(condition);
          }
        });
      })
      .select(
        "ot.*",
        "u.name as creator_name",
        "u.email as creator_email"
      )
      .groupBy("ot.id");

    if (status) {
      query = query.where("ot.status", status);
    }

    if (month) {
      query = query.where("ot.target_month", month);
    }

    if (year) {
      query = query.where("ot.target_year", year);
    }

    // Order by target year and month descending
    query = query.orderBy([
      { column: "ot.target_year", order: "desc" },
      { column: "ot.target_month", order: "desc" },
      { column: "ot.created_at", order: "desc" },
    ]);

    const tasks = await query;

    return tasks;
  } catch (error) {
    console.error("Error getting user tasks:", error);
    throw new Error(`Failed to get user tasks: ${error.message}`);
  }
}
