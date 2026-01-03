"use server";

import { db } from "@/lib/db";
import { getUsersByRoleAndDepartment } from "../organizational/user-assignment-service";

/**
 * Get admin notifications with filters
 * @param {Object} filters
 * @param {string} [filters.status] - Filter by status
 * @param {string} [filters.targetType] - Filter by target type
 * @param {string} [filters.createdBy] - Filter by creator
 * @param {number} [filters.limit=50] - Limit results
 * @param {number} [filters.offset=0] - Offset for pagination
 * @returns {Promise<Object>} - Notifications with pagination info
 */
export async function getAdminNotifications(filters = {}) {
  const { status, targetType, createdBy, limit = 50, offset = 0 } = filters;

  let query = db("admin_notifications as an")
    .leftJoin("user as u", "an.created_by", "u.id")
    .leftJoin("departments as d", "an.target_department_id", "d.id")
    .leftJoin("org_roles as r", "an.target_role_id", "r.id")
    .leftJoin(
      "admin_notification_templates as ant",
      "an.template_id",
      "ant.id"
    )
    .select(
      "an.*",
      "u.name as creator_name",
      "u.email as creator_email",
      "d.name as department_name",
      "r.name as role_name",
      "ant.name as template_name"
    );

  // Apply filters
  if (status) {
    query = query.where("an.status", status);
  }

  if (targetType) {
    query = query.where("an.target_type", targetType);
  }

  if (createdBy) {
    query = query.where("an.created_by", createdBy);
  }

  // Get total count
  const countQuery = query.clone().clearSelect().clearOrder().count("an.id as total");
  const [{ total }] = await countQuery;

  // Get paginated results
  const notifications = await query
    .orderBy("an.created_at", "desc")
    .limit(limit)
    .offset(offset);

  return {
    notifications,
    total: parseInt(total),
    limit,
    offset,
    hasMore: offset + limit < total,
  };
}

/**
 * Get a single admin notification by ID
 * @param {number} id - Admin notification ID
 * @returns {Promise<Object|null>} - Admin notification with details
 */
export async function getAdminNotificationById(id) {
  if (!id) {
    throw new Error("Notification ID is required");
  }

  const notification = await db("admin_notifications as an")
    .leftJoin("user as u", "an.created_by", "u.id")
    .leftJoin("departments as d", "an.target_department_id", "d.id")
    .leftJoin("org_roles as r", "an.target_role_id", "r.id")
    .leftJoin(
      "admin_notification_templates as ant",
      "an.template_id",
      "ant.id"
    )
    .where("an.id", id)
    .select(
      "an.*",
      "u.name as creator_name",
      "u.email as creator_email",
      "d.name as department_name",
      "d.code as department_code",
      "r.name as role_name",
      "r.code as role_code",
      "ant.name as template_name"
    )
    .first();

  return notification || null;
}

/**
 * Create a new admin notification
 * @param {Object} notificationData
 * @param {string} notificationData.title
 * @param {string} notificationData.message
 * @param {string} [notificationData.actionUrl] - Custom URL to navigate when clicked
 * @param {string} notificationData.targetType - 'everyone', 'department', 'role', 'specific_users'
 * @param {number} [notificationData.targetDepartmentId]
 * @param {number} [notificationData.targetRoleId]
 * @param {Array} [notificationData.targetUserIds] - Array of user objects {id, name, email}
 * @param {string} notificationData.scheduleType - 'immediate', 'scheduled', 'recurring'
 * @param {Date|string} [notificationData.scheduledAt]
 * @param {string} [notificationData.recurrencePattern] - 'daily', 'weekly', 'monthly'
 * @param {Object} [notificationData.recurrenceConfig]
 * @param {number} [notificationData.templateId]
 * @param {string} notificationData.createdBy - Admin user ID
 * @returns {Promise<Object>} - Created admin notification
 */
export async function createAdminNotification(notificationData) {
  const {
    title,
    message,
    actionUrl = null,
    targetType,
    targetDepartmentId = null,
    targetRoleId = null,
    targetUserIds = [],
    scheduleType = "immediate",
    scheduledAt = null,
    recurrencePattern = null,
    recurrenceConfig = null,
    templateId = null,
    createdBy,
  } = notificationData;

  // Validation
  if (!title || !message || !targetType || !createdBy) {
    throw new Error("Title, message, target type, and creator are required");
  }

  if (!["everyone", "department", "role", "specific_users"].includes(targetType)) {
    throw new Error("Invalid target type");
  }

  if (targetType === "department" && !targetDepartmentId) {
    throw new Error("Department ID is required for department target");
  }

  if (targetType === "role" && !targetRoleId) {
    throw new Error("Role ID is required for role target");
  }

  if (targetType === "specific_users" && (!targetUserIds || targetUserIds.length === 0)) {
    throw new Error("At least one user ID is required for specific users target");
  }

  if (!["immediate", "scheduled", "recurring"].includes(scheduleType)) {
    throw new Error("Invalid schedule type");
  }

  if (scheduleType === "scheduled" && !scheduledAt) {
    throw new Error("Scheduled date/time is required for scheduled notifications");
  }

  if (scheduleType === "recurring" && (!recurrencePattern || !recurrenceConfig)) {
    throw new Error(
      "Recurrence pattern and config are required for recurring notifications"
    );
  }

  // Determine initial status
  let status = "draft";
  if (scheduleType === "scheduled") {
    status = "scheduled";
  } else if (scheduleType === "recurring") {
    status = "recurring_active";
  }

  // Prepare data for insertion
  const insertData = {
    title: title.trim(),
    message: message.trim(),
    action_url: actionUrl ? actionUrl.trim() : null,
    target_type: targetType,
    target_department_id: targetDepartmentId,
    target_role_id: targetRoleId,
    target_user_ids: targetType === "specific_users" && targetUserIds.length > 0
      ? JSON.stringify(targetUserIds.map(u => u.id || u))
      : null,
    schedule_type: scheduleType,
    scheduled_at: scheduledAt,
    recurrence_pattern: recurrencePattern,
    recurrence_config: recurrenceConfig
      ? JSON.stringify(recurrenceConfig)
      : null,
    status,
    template_id: templateId,
    created_by: createdBy,
  };

  // Insert notification
  const [id] = await db("admin_notifications").insert(insertData);

  // Return created notification
  return getAdminNotificationById(id);
}

/**
 * Update an admin notification (only if not sent)
 * @param {number} id - Admin notification ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated admin notification
 */
export async function updateAdminNotification(id, updates) {
  if (!id) {
    throw new Error("Notification ID is required");
  }

  // Check if notification exists and can be updated
  const existing = await getAdminNotificationById(id);
  if (!existing) {
    throw new Error("Notification not found");
  }

  if (existing.status === "sent") {
    throw new Error("Cannot update a notification that has already been sent");
  }

  // Prepare update data
  const updateData = {};

  if (updates.title) updateData.title = updates.title.trim();
  if (updates.message) updateData.message = updates.message.trim();
  if (updates.targetType) {
    updateData.target_type = updates.targetType;

    // Reset target IDs if target type changes
    if (updates.targetType !== existing.target_type) {
      updateData.target_department_id = null;
      updateData.target_role_id = null;
    }
  }
  if (updates.targetDepartmentId !== undefined) {
    updateData.target_department_id = updates.targetDepartmentId;
  }
  if (updates.targetRoleId !== undefined) {
    updateData.target_role_id = updates.targetRoleId;
  }
  if (updates.scheduledAt) updateData.scheduled_at = updates.scheduledAt;
  if (updates.recurrencePattern) {
    updateData.recurrence_pattern = updates.recurrencePattern;
  }
  if (updates.recurrenceConfig) {
    updateData.recurrence_config = JSON.stringify(updates.recurrenceConfig);
  }
  if (updates.status) updateData.status = updates.status;

  // Perform update
  if (Object.keys(updateData).length > 0) {
    await db("admin_notifications").where({ id }).update(updateData);
  }

  // Return updated notification
  return getAdminNotificationById(id);
}

/**
 * Cancel a scheduled or recurring notification
 * @param {number} id - Admin notification ID
 * @returns {Promise<boolean>} - True if cancelled
 */
export async function cancelAdminNotification(id) {
  if (!id) {
    throw new Error("Notification ID is required");
  }

  // Check if notification exists
  const existing = await getAdminNotificationById(id);
  if (!existing) {
    throw new Error("Notification not found");
  }

  if (existing.status === "sent") {
    throw new Error("Cannot cancel a notification that has already been sent");
  }

  if (existing.status === "cancelled") {
    throw new Error("Notification is already cancelled");
  }

  // Update status to cancelled
  await db("admin_notifications")
    .where({ id })
    .update({ status: "cancelled" });

  return true;
}

/**
 * Delete an admin notification (only drafts/cancelled)
 * @param {number} id - Admin notification ID
 * @returns {Promise<boolean>} - True if deleted
 */
export async function deleteAdminNotification(id) {
  if (!id) {
    throw new Error("Notification ID is required");
  }

  // Check if notification can be deleted
  const existing = await getAdminNotificationById(id);
  if (!existing) {
    throw new Error("Notification not found");
  }

  if (!["draft", "cancelled"].includes(existing.status)) {
    throw new Error(
      "Can only delete draft or cancelled notifications. Cancel active notifications first."
    );
  }

  const count = await db("admin_notifications").where({ id }).delete();

  if (count === 0) {
    throw new Error("Notification not found");
  }

  return true;
}

/**
 * Resolve recipients based on target type
 * @param {Object} params
 * @param {string} params.targetType - 'everyone', 'department', 'role', 'specific_users'
 * @param {number} [params.targetDepartmentId]
 * @param {number} [params.targetRoleId]
 * @param {string} [params.targetUserIds] - JSON string of user IDs
 * @returns {Promise<Array>} - Array of user IDs
 */
async function resolveRecipients({
  targetType,
  targetDepartmentId,
  targetRoleId,
  targetUserIds = null,
}) {
  if (targetType === "everyone") {
    // Get all active users
    const users = await db("user").select("id").whereNotNull("id");
    return users.map((u) => u.id);
  }

  if (targetType === "department") {
    // Get users in specific department
    const users = await getUsersByRoleAndDepartment({
      departmentId: targetDepartmentId,
      activeOnly: true,
    });
    return users.map((u) => u.user_id);
  }

  if (targetType === "role") {
    // Get users with specific role
    const users = await getUsersByRoleAndDepartment({
      roleId: targetRoleId,
      activeOnly: true,
    });
    return users.map((u) => u.user_id);
  }

  if (targetType === "specific_users") {
    // Handle specific user IDs
    if (targetUserIds) {
      // MySQL returns JSON columns as already parsed objects/arrays
      // Check if it's already an array (from DB) or needs parsing (from form)
      if (Array.isArray(targetUserIds)) {
        return targetUserIds;
      }

      // If it's a string, try to parse it
      if (typeof targetUserIds === "string") {
        try {
          const userIds = JSON.parse(targetUserIds);
          return Array.isArray(userIds) ? userIds : [];
        } catch (error) {
          console.error("Error parsing target_user_ids:", error);
          return [];
        }
      }

      // If it's an object with IDs, extract them
      return [];
    }
    return [];
  }

  return [];
}

/**
 * Get recipient count for a notification before sending
 * @param {Object} params
 * @param {string} params.targetType
 * @param {number} [params.targetDepartmentId]
 * @param {number} [params.targetRoleId]
 * @param {string} [params.targetUserIds] - JSON string of user IDs
 * @returns {Promise<number>} - Estimated recipient count
 */
export async function getRecipientCount({
  targetType,
  targetDepartmentId,
  targetRoleId,
  targetUserIds = null,
}) {
  const recipients = await resolveRecipients({
    targetType,
    targetDepartmentId,
    targetRoleId,
    targetUserIds,
  });
  return recipients.length;
}

/**
 * Get recipients for sending (exported for sender service)
 * @param {Object} params
 * @returns {Promise<Array>} - Array of user IDs
 */
export async function getRecipients({
  targetType,
  targetDepartmentId,
  targetRoleId,
  targetUserIds = null,
}) {
  return resolveRecipients({ targetType, targetDepartmentId, targetRoleId, targetUserIds });
}
