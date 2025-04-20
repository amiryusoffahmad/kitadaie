"use server";

import { db } from "@/lib/db";

/**
 * Get notification preferences for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User notification preferences
 */
export async function getNotificationPreferences(userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get user preferences or create default if doesn't exist
    let preferences = await db("user_notification_preferences")
      .where({ user_id: userId })
      .first();

    // If preferences don't exist, create default ones
    if (!preferences) {
      preferences = await createDefaultPreferences(userId);
    }

    return preferences;
  } catch (error) {
    console.error("Error getting notification preferences:", error);
    throw new Error(`Failed to get notification preferences: ${error.message}`);
  }
}

/**
 * Create default notification preferences for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Created default preferences
 */
async function createDefaultPreferences(userId) {
  try {
    const [preferenceId] = await db("user_notification_preferences").insert({
      user_id: userId,
      telegram_enabled: 0,
      telegram_chat_id: null,
      in_app_enabled: 1,
    });

    return await db("user_notification_preferences")
      .where({ id: preferenceId })
      .first();
  } catch (error) {
    console.error("Error creating default notification preferences:", error);
    throw new Error(
      `Failed to create default notification preferences: ${error.message}`
    );
  }
}

/**
 * Update notification preferences for a user
 * @param {Object} preferences - Updated preferences
 * @param {string} preferences.userId - User ID
 * @param {boolean} [preferences.telegramEnabled] - Whether Telegram notifications are enabled
 * @param {string} [preferences.telegramChatId] - Telegram chat ID for the user
 * @param {boolean} [preferences.inAppEnabled] - Whether in-app notifications are enabled
 * @returns {Promise<Object>} - Updated preferences
 */
export async function updateNotificationPreferences({
  userId,
  telegramEnabled,
  telegramChatId,
  inAppEnabled,
}) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get current preferences
    let currentPreferences = await getNotificationPreferences(userId);

    // Prepare update object with only provided fields
    const updates = {};

    if (telegramEnabled !== undefined) {
      updates.telegram_enabled = telegramEnabled ? 1 : 0;
    }

    if (telegramChatId !== undefined) {
      updates.telegram_chat_id = telegramChatId;
    }

    if (inAppEnabled !== undefined) {
      updates.in_app_enabled = inAppEnabled ? 1 : 0;
    }

    // If we're enabling Telegram but no chat ID is provided or exists
    if (
      updates.telegram_enabled === 1 &&
      !updates.telegram_chat_id &&
      !currentPreferences.telegram_chat_id
    ) {
      throw new Error(
        "Telegram chat ID is required when enabling Telegram notifications"
      );
    }

    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      // Add updated_at
      updates.updated_at = db.fn.now();

      await db("user_notification_preferences")
        .where({ user_id: userId })
        .update(updates);
    }

    // Return updated preferences
    return await getNotificationPreferences(userId);
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    throw new Error(
      `Failed to update notification preferences: ${error.message}`
    );
  }
}
