"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getRole } from "@/server/user/user.server";

// Import services
import * as templateService from "../admin-notifications/template-service";
import * as adminNotificationService from "../admin-notifications/admin-notification-service";
import * as senderService from "../admin-notifications/notification-sender-service";
import * as historyService from "../admin-notifications/history-service";
import * as schedulerService from "../admin-notifications/scheduler-service";

/**
 * Check admin permission
 * @returns {Promise<string>} - User ID if authorized
 * @throws {Error} - If not authenticated or not admin
 */
async function checkAdminPermission() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("Authentication required");
  }

  const roleData = await getRole(session.user.id);
  if (roleData.role !== "admin") {
    throw new Error("Admin permission required");
  }

  return session.user.id;
}

// ============================================================================
// TEMPLATE ACTIONS
// ============================================================================

/**
 * Fetch all notification templates
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function fetchTemplates() {
  try {
    const userId = await checkAdminPermission();
    const templates = await templateService.getTemplates();
    return { success: true, data: templates };
  } catch (error) {
    console.error("Error fetching templates:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Fetch single template by ID
 * @param {number} id - Template ID
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function fetchTemplateById(id) {
  try {
    await checkAdminPermission();
    const template = await templateService.getTemplateById(id);
    if (!template) {
      return { success: false, message: "Template not found" };
    }
    return { success: true, data: template };
  } catch (error) {
    console.error("Error fetching template:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Create a new notification template
 * @param {Object} data - Template data
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function createTemplateAction(data) {
  try {
    const userId = await checkAdminPermission();
    const template = await templateService.createTemplate({
      ...data,
      createdBy: userId,
    });

    revalidatePath("/admin-notifications/templates");
    return {
      success: true,
      data: template,
      message: "Template created successfully",
    };
  } catch (error) {
    console.error("Error creating template:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Update a notification template
 * @param {number} id - Template ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function updateTemplateAction(id, updates) {
  try {
    await checkAdminPermission();
    const template = await templateService.updateTemplate(id, updates);

    revalidatePath("/admin-notifications/templates");
    return {
      success: true,
      data: template,
      message: "Template updated successfully",
    };
  } catch (error) {
    console.error("Error updating template:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Delete a notification template
 * @param {number} id - Template ID
 * @returns {Promise<Object>} - { success, message }
 */
export async function deleteTemplateAction(id) {
  try {
    await checkAdminPermission();

    // Check if template is being used
    const usageCount = await templateService.getTemplateUsageCount(id);
    if (usageCount > 0) {
      return {
        success: false,
        message: `Cannot delete template. It is being used by ${usageCount} notification(s).`,
      };
    }

    await templateService.deleteTemplate(id);

    revalidatePath("/admin-notifications/templates");
    return { success: true, message: "Template deleted successfully" };
  } catch (error) {
    console.error("Error deleting template:", error);
    return { success: false, message: error.message };
  }
}

// ============================================================================
// ADMIN NOTIFICATION ACTIONS
// ============================================================================

/**
 * Fetch admin notifications with filters
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function fetchAdminNotifications(filters = {}) {
  try {
    await checkAdminPermission();
    const result = await adminNotificationService.getAdminNotifications(
      filters
    );
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Fetch single admin notification by ID
 * @param {number} id - Notification ID
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function fetchAdminNotificationById(id) {
  try {
    await checkAdminPermission();
    const notification =
      await adminNotificationService.getAdminNotificationById(id);
    if (!notification) {
      return { success: false, message: "Notification not found" };
    }
    return { success: true, data: notification };
  } catch (error) {
    console.error("Error fetching notification:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Create a new admin notification
 * @param {Object} data - Notification data
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function createAdminNotificationAction(data) {
  try {
    const userId = await checkAdminPermission();
    const notification = await adminNotificationService.createAdminNotification(
      {
        ...data,
        createdBy: userId,
      }
    );

    // If immediate, send right away
    if (data.scheduleType === "immediate") {
      const sendResult = await senderService.sendAdminNotification(
        notification.id
      );

      revalidatePath("/admin-notifications");
      return {
        success: true,
        data: { ...notification, sentCount: sendResult.sentCount },
        message: `Notification sent successfully to ${sendResult.sentCount} user(s)`,
      };
    }

    revalidatePath("/admin-notifications");
    return {
      success: true,
      data: notification,
      message:
        data.scheduleType === "scheduled"
          ? "Notification scheduled successfully"
          : "Recurring notification created successfully",
    };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Update an admin notification (only if not sent)
 * @param {number} id - Notification ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function updateAdminNotificationAction(id, updates) {
  try {
    await checkAdminPermission();
    const notification = await adminNotificationService.updateAdminNotification(
      id,
      updates
    );

    revalidatePath("/admin-notifications");
    revalidatePath(`/admin-notifications/${id}`);
    return {
      success: true,
      data: notification,
      message: "Notification updated successfully",
    };
  } catch (error) {
    console.error("Error updating notification:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Cancel a scheduled or recurring notification
 * @param {number} id - Notification ID
 * @returns {Promise<Object>} - { success, message }
 */
export async function cancelAdminNotificationAction(id) {
  try {
    await checkAdminPermission();
    await adminNotificationService.cancelAdminNotification(id);

    revalidatePath("/admin-notifications");
    revalidatePath(`/admin-notifications/${id}`);
    return { success: true, message: "Notification cancelled successfully" };
  } catch (error) {
    console.error("Error cancelling notification:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Delete an admin notification (only drafts/cancelled)
 * @param {number} id - Notification ID
 * @returns {Promise<Object>} - { success, message }
 */
export async function deleteAdminNotificationAction(id) {
  try {
    await checkAdminPermission();
    await adminNotificationService.deleteAdminNotification(id);

    revalidatePath("/admin-notifications");
    return { success: true, message: "Notification deleted successfully" };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Send a notification immediately (for scheduled notifications)
 * @param {number} id - Notification ID
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function sendNowAction(id) {
  try {
    await checkAdminPermission();
    const sendResult = await senderService.sendAdminNotification(id);

    revalidatePath("/admin-notifications");
    revalidatePath(`/admin-notifications/${id}`);
    return {
      success: true,
      data: sendResult,
      message: `Notification sent successfully to ${sendResult.sentCount} user(s)`,
    };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Get recipient count for a notification configuration
 * @param {Object} params - { targetType, targetDepartmentId, targetRoleId }
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function getRecipientCountAction(params) {
  try {
    await checkAdminPermission();
    const count = await adminNotificationService.getRecipientCount(params);
    return { success: true, data: { count } };
  } catch (error) {
    console.error("Error getting recipient count:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Resend a notification (create copy and send)
 * @param {number} id - Notification ID
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function resendNotificationAction(id) {
  try {
    const userId = await checkAdminPermission();
    const result = await senderService.resendAdminNotification(id, userId);

    revalidatePath("/admin-notifications");
    return {
      success: true,
      data: result,
      message: `Notification resent successfully to ${result.sentCount} user(s)`,
    };
  } catch (error) {
    console.error("Error resending notification:", error);
    return { success: false, message: error.message };
  }
}

// ============================================================================
// HISTORY ACTIONS
// ============================================================================

/**
 * Fetch notification history with filters
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function fetchNotificationHistory(filters = {}) {
  try {
    await checkAdminPermission();
    const result = await historyService.getNotificationHistory(filters);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching notification history:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Fetch recipients for a specific notification
 * @param {number} adminNotificationId - Notification ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function fetchNotificationRecipients(adminNotificationId, options) {
  try {
    await checkAdminPermission();
    const result = await historyService.getNotificationRecipients(
      adminNotificationId,
      options
    );
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching notification recipients:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Fetch recurrence log for a recurring notification
 * @param {number} adminNotificationId - Notification ID
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function fetchRecurrenceLog(adminNotificationId) {
  try {
    await checkAdminPermission();
    const log = await historyService.getRecurrenceLog(adminNotificationId);
    return { success: true, data: log };
  } catch (error) {
    console.error("Error fetching recurrence log:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Fetch notification statistics
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function fetchNotificationStatistics() {
  try {
    await checkAdminPermission();
    const stats = await historyService.getNotificationStatistics();
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching notification statistics:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Fetch recent notifications
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function fetchRecentNotifications() {
  try {
    await checkAdminPermission();
    const notifications = await historyService.getRecentNotifications();
    return { success: true, data: notifications };
  } catch (error) {
    console.error("Error fetching recent notifications:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Fetch read statistics for a notification
 * @param {number} adminNotificationId - Notification ID
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function fetchNotificationReadStats(adminNotificationId) {
  try {
    await checkAdminPermission();
    const stats = await historyService.getNotificationReadStats(
      adminNotificationId
    );
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching read stats:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Fetch performance metrics
 * @param {Object} options - { days }
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function fetchPerformanceMetrics(options = {}) {
  try {
    await checkAdminPermission();
    const metrics =
      await historyService.getNotificationPerformanceMetrics(options);
    return { success: true, data: metrics };
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    return { success: false, message: error.message };
  }
}

// ============================================================================
// SCHEDULER ACTIONS (FOR TESTING/DEBUGGING)
// ============================================================================

/**
 * Get upcoming scheduled notifications
 * @param {number} daysAhead - Days to look ahead
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function fetchUpcomingNotifications(daysAhead = 7) {
  try {
    await checkAdminPermission();
    const notifications =
      await schedulerService.getUpcomingScheduledNotifications(daysAhead);
    return { success: true, data: notifications };
  } catch (error) {
    console.error("Error fetching upcoming notifications:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Get next execution date for a recurring notification
 * @param {number} adminNotificationId - Notification ID
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function fetchNextRecurrenceDate(adminNotificationId) {
  try {
    await checkAdminPermission();
    const nextDate = await schedulerService.getNextRecurrenceExecution(
      adminNotificationId
    );
    return { success: true, data: { nextDate } };
  } catch (error) {
    console.error("Error fetching next recurrence date:", error);
    return { success: false, message: error.message };
  }
}
