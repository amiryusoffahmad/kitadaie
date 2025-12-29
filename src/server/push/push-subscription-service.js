"use server";

import { db } from "@/lib/db";

/**
 * Save or update push subscription for a user
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {Object} params.subscription - Push subscription object from browser
 * @param {Object} [params.deviceInfo] - Device information
 * @returns {Promise<Object>} - Saved subscription record
 */
export async function savePushSubscription({
  userId,
  subscription,
  deviceInfo = {},
}) {
  try {
    if (!userId || !subscription) {
      throw new Error("User ID and subscription are required");
    }

    // Extract subscription keys
    const endpoint = subscription.endpoint;
    const p256dhKey = subscription.keys?.p256dh || "";
    const authKey = subscription.keys?.auth || "";

    if (!endpoint || !p256dhKey || !authKey) {
      throw new Error("Invalid subscription object");
    }

    // Check if this subscription already exists (by endpoint)
    const existing = await db("push_subscriptions")
      .where({ endpoint })
      .first();

    if (existing) {
      // Update existing subscription
      await db("push_subscriptions")
        .where({ id: existing.id })
        .update({
          user_id: userId, // Update user if subscription was reassigned
          p256dh_key: p256dhKey,
          auth_key: authKey,
          device_info: JSON.stringify(deviceInfo),
          is_active: 1,
          updated_at: db.fn.now(),
        });

      return await db("push_subscriptions").where({ id: existing.id }).first();
    }

    // Insert new subscription
    const [subscriptionId] = await db("push_subscriptions").insert({
      user_id: userId,
      endpoint,
      p256dh_key: p256dhKey,
      auth_key: authKey,
      device_info: JSON.stringify(deviceInfo),
      is_active: 1,
    });

    return await db("push_subscriptions")
      .where({ id: subscriptionId })
      .first();
  } catch (error) {
    console.error("Error saving push subscription:", error);
    throw new Error(`Failed to save push subscription: ${error.message}`);
  }
}

/**
 * Get all active push subscriptions for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of subscription objects
 */
export async function getUserPushSubscriptions(userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const subscriptions = await db("push_subscriptions")
      .where({ user_id: userId, is_active: 1 })
      .select("id", "endpoint", "p256dh_key", "auth_key");

    // Convert to Web Push API subscription format
    return subscriptions.map((sub) => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh_key,
        auth: sub.auth_key,
      },
    }));
  } catch (error) {
    console.error("Error getting user push subscriptions:", error);
    return [];
  }
}

/**
 * Get push subscriptions for multiple users
 * @param {Array<string>} userIds - Array of user IDs
 * @returns {Promise<Object>} - Map of userId => array of subscriptions
 */
export async function getUsersPushSubscriptions(userIds) {
  try {
    if (!userIds || userIds.length === 0) {
      return {};
    }

    const subscriptions = await db("push_subscriptions")
      .whereIn("user_id", userIds)
      .where({ is_active: 1 })
      .select("user_id", "endpoint", "p256dh_key", "auth_key");

    // Group subscriptions by user ID
    const subscriptionsByUser = {};
    subscriptions.forEach((sub) => {
      if (!subscriptionsByUser[sub.user_id]) {
        subscriptionsByUser[sub.user_id] = [];
      }
      subscriptionsByUser[sub.user_id].push({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh_key,
          auth: sub.auth_key,
        },
      });
    });

    return subscriptionsByUser;
  } catch (error) {
    console.error("Error getting users push subscriptions:", error);
    return {};
  }
}

/**
 * Get all push subscriptions for multiple users (flat array)
 * @param {Array<string>} userIds - Array of user IDs
 * @returns {Promise<Array>} - Array of subscription objects
 */
export async function getAllPushSubscriptionsForUsers(userIds) {
  try {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    const subscriptions = await db("push_subscriptions")
      .whereIn("user_id", userIds)
      .where({ is_active: 1 })
      .select("endpoint", "p256dh_key", "auth_key");

    // Convert to Web Push API subscription format
    return subscriptions.map((sub) => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh_key,
        auth: sub.auth_key,
      },
    }));
  } catch (error) {
    console.error("Error getting push subscriptions for users:", error);
    return [];
  }
}

/**
 * Mark push subscription as inactive (when it becomes invalid)
 * @param {string} endpoint - Push subscription endpoint
 * @returns {Promise<number>} - Number of subscriptions deactivated
 */
export async function deactivatePushSubscription(endpoint) {
  try {
    if (!endpoint) {
      throw new Error("Endpoint is required");
    }

    const updated = await db("push_subscriptions")
      .where({ endpoint })
      .update({
        is_active: 0,
        updated_at: db.fn.now(),
      });

    return updated;
  } catch (error) {
    console.error("Error deactivating push subscription:", error);
    return 0;
  }
}

/**
 * Deactivate multiple push subscriptions
 * @param {Array<Object>} subscriptions - Array of subscription objects with endpoints
 * @returns {Promise<number>} - Number of subscriptions deactivated
 */
export async function deactivatePushSubscriptions(subscriptions) {
  try {
    if (!subscriptions || subscriptions.length === 0) {
      return 0;
    }

    const endpoints = subscriptions.map((sub) => sub.endpoint);

    const updated = await db("push_subscriptions")
      .whereIn("endpoint", endpoints)
      .update({
        is_active: 0,
        updated_at: db.fn.now(),
      });

    console.log(`Deactivated ${updated} invalid push subscriptions`);
    return updated;
  } catch (error) {
    console.error("Error deactivating push subscriptions:", error);
    return 0;
  }
}

/**
 * Update last used timestamp for a push subscription
 * @param {string} endpoint - Push subscription endpoint
 * @returns {Promise<void>}
 */
export async function updatePushSubscriptionLastUsed(endpoint) {
  try {
    if (!endpoint) return;

    await db("push_subscriptions").where({ endpoint }).update({
      last_used_at: db.fn.now(),
    });
  } catch (error) {
    console.error("Error updating push subscription last used:", error);
  }
}

/**
 * Delete inactive push subscriptions (cleanup)
 * @param {number} [daysInactive=90] - Number of days to consider subscription inactive
 * @returns {Promise<number>} - Number of subscriptions deleted
 */
export async function cleanupInactivePushSubscriptions(daysInactive = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    const deleted = await db("push_subscriptions")
      .where({ is_active: 0 })
      .where("updated_at", "<", cutoffDate)
      .delete();

    console.log(`Cleaned up ${deleted} inactive push subscriptions`);
    return deleted;
  } catch (error) {
    console.error("Error cleaning up inactive push subscriptions:", error);
    return 0;
  }
}

/**
 * Delete all push subscriptions for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of subscriptions deleted
 */
export async function deleteUserPushSubscriptions(userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const deleted = await db("push_subscriptions")
      .where({ user_id: userId })
      .delete();

    return deleted;
  } catch (error) {
    console.error("Error deleting user push subscriptions:", error);
    return 0;
  }
}

/**
 * Get push subscription statistics
 * @returns {Promise<Object>} - Statistics object
 */
export async function getPushSubscriptionStats() {
  try {
    const [totalActive] = await db("push_subscriptions")
      .where({ is_active: 1 })
      .count("id as count");

    const [totalInactive] = await db("push_subscriptions")
      .where({ is_active: 0 })
      .count("id as count");

    const [uniqueUsers] = await db("push_subscriptions")
      .where({ is_active: 1 })
      .countDistinct("user_id as count");

    return {
      activeSubscriptions: totalActive.count || 0,
      inactiveSubscriptions: totalInactive.count || 0,
      usersWithSubscriptions: uniqueUsers.count || 0,
    };
  } catch (error) {
    console.error("Error getting push subscription stats:", error);
    return {
      activeSubscriptions: 0,
      inactiveSubscriptions: 0,
      usersWithSubscriptions: 0,
    };
  }
}
