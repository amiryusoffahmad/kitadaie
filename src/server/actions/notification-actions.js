"use server";

import {
  getUserNotifications,
  markNotificationsAsRead,
  getUnreadNotificationCount,
  deleteNotifications,
} from "../notifications/notification-service";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../notifications/notification-preferences-service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Get notifications for the current user
 * @param {Object} params - Query parameters
 * @param {boolean} [params.unreadOnly=false] - Get only unread notifications
 * @param {string} [params.type] - Filter by notification type
 * @param {number} [params.limit=20] - Number of notifications to return
 * @param {number} [params.offset=0] - Offset for pagination
 * @returns {Promise<Object>} - List of notifications with pagination
 */
export async function fetchUserNotifications({
  unreadOnly = false,
  type = null,
  limit = 20,
  offset = 0,
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      throw new Error("User not authenticated");
    }

    return await getUserNotifications({
      userId: session.user.id,
      unreadOnly,
      type,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }
}

/**
 * Mark user notification(s) as read
 * @param {Object} params - Parameters
 * @param {number|Array<number>} [params.notificationIds] - Specific notification ID(s) to mark as read
 * @param {boolean} [params.all=false] - Mark all user's notifications as read
 * @returns {Promise<number>} - Number of notifications updated
 */
export async function markAsRead({ notificationIds = null, all = false }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      throw new Error("User not authenticated");
    }

    return await markNotificationsAsRead({
      userId: session.user.id,
      notificationIds,
      all,
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw new Error(`Failed to mark notifications as read: ${error.message}`);
  }
}

/**
 * Get unread notification count for current user
 * @returns {Promise<number>} - Count of unread notifications
 */
export async function fetchUnreadCount() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return 0; // Return 0 for unauthenticated users instead of error
    }

    return await getUnreadNotificationCount(session.user.id);
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    return 0; // Return 0 on error to avoid breaking UI
  }
}

/**
 * Delete notification(s) for current user
 * @param {Object} params - Parameters
 * @param {number|Array<number>} params.notificationIds - Notification ID(s) to delete
 * @returns {Promise<number>} - Number of notifications deleted
 */
export async function deleteUserNotifications({ notificationIds }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      throw new Error("User not authenticated");
    }

    return await deleteNotifications({
      userId: session.user.id,
      notificationIds,
    });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    throw new Error(`Failed to delete notifications: ${error.message}`);
  }
}

/**
 * Get notification preferences for current user
 * @returns {Promise<Object>} - User notification preferences
 */
export async function fetchNotificationPreferences() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      throw new Error("User not authenticated");
    }

    return await getNotificationPreferences(session.user.id);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    throw new Error(
      `Failed to fetch notification preferences: ${error.message}`
    );
  }
}

/**
 * Update notification preferences for current user
 * @param {Object} preferences - Updated preferences
 * @param {boolean} [preferences.telegramEnabled] - Whether Telegram notifications are enabled
 * @param {string} [preferences.telegramChatId] - Telegram chat ID for the user
 * @param {boolean} [preferences.inAppEnabled] - Whether in-app notifications are enabled
 * @returns {Promise<Object>} - Updated preferences
 */
export async function updateUserNotificationPreferences({
  telegramEnabled,
  telegramChatId,
  inAppEnabled,
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      throw new Error("User not authenticated");
    }

    return await updateNotificationPreferences({
      userId: session.user.id,
      telegramEnabled,
      telegramChatId,
      inAppEnabled,
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    throw new Error(
      `Failed to update notification preferences: ${error.message}`
    );
  }
}
