"use server";

import { db } from "@/lib/db";
import { createNotification } from "../notifications/notification-service";
import {
  getAdminNotificationById,
  getRecipients,
} from "./admin-notification-service";

/**
 * Send an admin notification immediately
 * @param {number} adminNotificationId - Admin notification ID
 * @returns {Promise<Object>} - Result with sent count
 */
export async function sendAdminNotification(adminNotificationId) {
  if (!adminNotificationId) {
    throw new Error("Admin notification ID is required");
  }

  // Get notification details
  const adminNotification = await getAdminNotificationById(adminNotificationId);
  if (!adminNotification) {
    throw new Error("Notification not found");
  }

  // Check if already sent
  if (adminNotification.status === "sent") {
    throw new Error("Notification has already been sent");
  }

  if (adminNotification.status === "cancelled") {
    throw new Error("Cannot send a cancelled notification");
  }

  // Resolve recipients
  const recipientIds = await getRecipients({
    targetType: adminNotification.target_type,
    targetDepartmentId: adminNotification.target_department_id,
    targetRoleId: adminNotification.target_role_id,
  });

  if (recipientIds.length === 0) {
    throw new Error("No recipients found for this notification");
  }

  // Send notifications to all recipients
  const sentCount = await createNotificationsForUsers(
    adminNotificationId,
    recipientIds,
    adminNotification.title,
    adminNotification.message
  );

  // Update admin notification status
  await db("admin_notifications")
    .where({ id: adminNotificationId })
    .update({
      status: "sent",
      sent_at: db.fn.now(),
      sent_count: sentCount,
    });

  return {
    adminNotificationId,
    sentCount,
    recipientIds,
  };
}

/**
 * Internal function to create individual notifications for recipients
 * Batches inserts for better performance
 * @param {number} adminNotificationId
 * @param {Array} userIds
 * @param {string} title
 * @param {string} message
 * @returns {Promise<number>} - Number of notifications created
 */
async function createNotificationsForUsers(
  adminNotificationId,
  userIds,
  title,
  message
) {
  const BATCH_SIZE = 100;
  let totalCreated = 0;

  // Process in batches to avoid overwhelming the database
  for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
    const batch = userIds.slice(i, i + BATCH_SIZE);

    // Create notifications for this batch
    const notificationPromises = batch.map(async (userId) => {
      try {
        // Create individual notification using existing service
        const notification = await createNotification({
          userId,
          title,
          message,
          type: "admin_broadcast", // Type for admin notifications
          resourceId: String(adminNotificationId), // Resource ID points to admin notification
          resourceType: "admin_notification", // Resource type
        });

        // Log the delivery
        await logNotificationRecipient(
          adminNotificationId,
          notification.id,
          userId
        );

        return true;
      } catch (error) {
        console.error(
          `Failed to create notification for user ${userId}:`,
          error
        );
        return false;
      }
    });

    const results = await Promise.all(notificationPromises);
    totalCreated += results.filter(Boolean).length;
  }

  return totalCreated;
}

/**
 * Log delivery to admin_notification_recipients table
 * @param {number} adminNotificationId
 * @param {number} notificationId
 * @param {string} userId
 */
async function logNotificationRecipient(
  adminNotificationId,
  notificationId,
  userId
) {
  try {
    await db("admin_notification_recipients").insert({
      admin_notification_id: adminNotificationId,
      notification_id: notificationId,
      user_id: userId,
    });
  } catch (error) {
    // Log but don't fail the notification send
    console.error("Failed to log notification recipient:", error);
  }
}

/**
 * Resend a notification (creates a copy and sends it)
 * @param {number} adminNotificationId - Original notification ID
 * @param {string} createdBy - Admin user ID initiating resend
 * @returns {Promise<Object>} - Result with new notification ID and sent count
 */
export async function resendAdminNotification(adminNotificationId, createdBy) {
  if (!adminNotificationId || !createdBy) {
    throw new Error("Notification ID and creator are required");
  }

  // Get original notification
  const original = await getAdminNotificationById(adminNotificationId);
  if (!original) {
    throw new Error("Original notification not found");
  }

  // Parse recurrence_config if it's a string
  let recurrenceConfig = original.recurrence_config;
  if (typeof recurrenceConfig === "string") {
    try {
      recurrenceConfig = JSON.parse(recurrenceConfig);
    } catch (error) {
      recurrenceConfig = null;
    }
  }

  // Create a new notification with same content
  const [newId] = await db("admin_notifications").insert({
    title: original.title,
    message: original.message,
    target_type: original.target_type,
    target_department_id: original.target_department_id,
    target_role_id: original.target_role_id,
    schedule_type: "immediate",
    scheduled_at: null,
    recurrence_pattern: null,
    recurrence_config: null,
    status: "draft",
    template_id: original.template_id,
    created_by: createdBy,
  });

  // Send the new notification
  const result = await sendAdminNotification(newId);

  return {
    ...result,
    originalNotificationId: adminNotificationId,
  };
}
