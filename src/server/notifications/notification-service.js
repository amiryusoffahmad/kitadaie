"use server";

import { db } from "@/lib/db";

/**
 * Create a new notification
 * @param {Object} notification - The notification data
 * @param {string} notification.userId - User ID to send notification to
 * @param {string} notification.title - Short notification title
 * @param {string} notification.message - Detailed notification message
 * @param {string} notification.type - Notification type/category
 * @param {string} [notification.resourceId] - Optional ID of related resource
 * @param {string} [notification.resourceType] - Optional type of related resource
 * @returns {Promise<Object>} - Created notification
 */
export async function createNotification({
  userId,
  title,
  message,
  type,
  resourceId = null,
  resourceType = null,
}) {
  try {
    // Validate required fields
    if (!userId || !title || !message || !type) {
      throw new Error("Missing required notification fields");
    }

    const [notificationId] = await db("notifications").insert({
      user_id: userId,
      title,
      message,
      type,
      resource_id: resourceId,
      resource_type: resourceType,
      read: 0,
      telegram_sent: 0,
    });

    // Return the created notification
    const notification = await db("notifications")
      .where({ id: notificationId })
      .first();

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error(`Failed to create notification: ${error.message}`);
  }
}

/**
 * Get notifications for a specific user
 * @param {Object} params - Query parameters
 * @param {string} params.userId - User ID to get notifications for
 * @param {boolean} [params.unreadOnly=false] - Get only unread notifications
 * @param {string} [params.type] - Filter by notification type
 * @param {number} [params.limit=20] - Number of notifications to return
 * @param {number} [params.offset=0] - Offset for pagination
 * @returns {Promise<Array>} - List of notifications
 */
export async function getUserNotifications({
  userId,
  unreadOnly = false,
  type = null,
  limit = 20,
  offset = 0,
}) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    let query = db("notifications").where({ user_id: userId });

    // Apply filters if provided
    if (unreadOnly) {
      query = query.where({ read: 0 });
    }

    if (type) {
      query = query.where({ type });
    }

    // Count using the same filters applied to the main query
    const [{ count }] = await query.clone().clearSelect().clearOrder().count("id as count");

    // Apply pagination and order by most recent first
    const notifications = await query
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);

    return {
      notifications,
      pagination: {
        total: count,
        limit,
        offset,
      },
    };
  } catch (error) {
    console.error("Error getting user notifications:", error);
    throw new Error(`Failed to get notifications: ${error.message}`);
  }
}

/**
 * Mark notification(s) as read
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {number|Array<number>} [params.notificationIds] - Specific notification ID(s) to mark as read
 * @param {boolean} [params.all=false] - Mark all user's notifications as read
 * @returns {Promise<number>} - Number of notifications updated
 */
export async function markNotificationsAsRead({
  userId,
  notificationIds = null,
  all = false,
}) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    let query = db("notifications").where({ user_id: userId });

    // Apply filters based on parameters
    if (notificationIds) {
      // Handle both single ID and array of IDs
      const ids = Array.isArray(notificationIds)
        ? notificationIds
        : [notificationIds];
      query = query.whereIn("id", ids);
    } else if (!all) {
      throw new Error(
        "Either specific notification IDs or 'all' flag must be provided"
      );
    }

    // Update the matched notifications
    const updatedCount = await query.update({
      read: 1,
      updated_at: db.fn.now(),
    });

    return updatedCount;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw new Error(`Failed to mark notifications as read: ${error.message}`);
  }
}

/**
 * Get unread notification count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Count of unread notifications
 */
export async function getUnreadNotificationCount(userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const [{ count }] = await db("notifications")
      .where({
        user_id: userId,
        read: 0,
      })
      .count("id as count");

    return count;
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    throw new Error(
      `Failed to get unread notification count: ${error.message}`
    );
  }
}

/**
 * Delete notification(s) for a user
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {number|Array<number>} params.notificationIds - Notification ID(s) to delete
 * @returns {Promise<number>} - Number of notifications deleted
 */
export async function deleteNotifications({ userId, notificationIds }) {
  try {
    if (!userId || !notificationIds) {
      throw new Error("User ID and notification IDs are required");
    }

    // Handle both single ID and array of IDs
    const ids = Array.isArray(notificationIds)
      ? notificationIds
      : [notificationIds];

    // Delete notifications that belong to the user
    const deletedCount = await db("notifications")
      .where({ user_id: userId })
      .whereIn("id", ids)
      .delete();

    return deletedCount;
  } catch (error) {
    console.error("Error deleting notifications:", error);
    throw new Error(`Failed to delete notifications: ${error.message}`);
  }
}

/**
 * Update a notification's telegram_sent status
 * @param {number} notificationId - Notification ID
 * @param {boolean} sent - Whether Telegram notification was sent successfully
 * @returns {Promise<Object>} - Updated notification
 */
export async function updateTelegramStatus(notificationId, sent = true) {
  try {
    if (!notificationId) {
      throw new Error("Notification ID is required");
    }

    await db("notifications")
      .where({ id: notificationId })
      .update({
        telegram_sent: sent ? 1 : 0,
        updated_at: db.fn.now(),
      });

    // Return updated notification
    return await db("notifications").where({ id: notificationId }).first();
  } catch (error) {
    console.error("Error updating Telegram status:", error);
    throw new Error(`Failed to update Telegram status: ${error.message}`);
  }
}
