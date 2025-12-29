"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  savePushSubscription,
  getUserPushSubscriptions,
  deleteUserPushSubscriptions,
  getPushSubscriptionStats,
} from "../push/push-subscription-service";

/**
 * Save push subscription for the authenticated user
 * @param {Object} params - Parameters
 * @param {Object} params.subscription - Push subscription object from browser
 * @param {Object} [params.deviceInfo] - Device information
 * @returns {Promise<Object>} - Result with success status
 */
export async function savePushSubscriptionAction({ subscription, deviceInfo = {} }) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    // Save subscription
    const savedSubscription = await savePushSubscription({
      userId: session.user.id,
      subscription,
      deviceInfo,
    });

    return {
      success: true,
      message: "Push subscription saved successfully",
      data: savedSubscription,
    };
  } catch (error) {
    console.error("Error in savePushSubscriptionAction:", error);
    return {
      success: false,
      message: error.message || "Failed to save push subscription",
    };
  }
}

/**
 * Get push subscriptions for the authenticated user
 * @returns {Promise<Object>} - Result with push subscriptions
 */
export async function getUserPushSubscriptionsAction() {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return {
        success: false,
        message: "Authentication required",
        data: [],
      };
    }

    // Get subscriptions
    const subscriptions = await getUserPushSubscriptions(session.user.id);

    return {
      success: true,
      data: subscriptions,
    };
  } catch (error) {
    console.error("Error in getUserPushSubscriptionsAction:", error);
    return {
      success: false,
      message: error.message || "Failed to get push subscriptions",
      data: [],
    };
  }
}

/**
 * Delete all push subscriptions for the authenticated user
 * @returns {Promise<Object>} - Result with success status
 */
export async function deleteUserPushSubscriptionsAction() {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    // Delete subscriptions
    const deleted = await deleteUserPushSubscriptions(session.user.id);

    return {
      success: true,
      message: `${deleted} subscription(s) deleted successfully`,
      data: { deleted },
    };
  } catch (error) {
    console.error("Error in deleteUserPushSubscriptionsAction:", error);
    return {
      success: false,
      message: error.message || "Failed to delete push subscriptions",
    };
  }
}

/**
 * Get push subscription statistics (admin only)
 * @returns {Promise<Object>} - Statistics data
 */
export async function getPushSubscriptionStatsAction() {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    // Check admin permission
    if (session.user.role !== "admin") {
      return {
        success: false,
        message: "Admin access required",
      };
    }

    // Get stats
    const stats = await getPushSubscriptionStats();

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Error in getPushSubscriptionStatsAction:", error);
    return {
      success: false,
      message: error.message || "Failed to get push subscription stats",
    };
  }
}
