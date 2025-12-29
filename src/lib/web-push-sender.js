import "server-only";

import webpush from "web-push";

/**
 * Web Push Notification Sender
 * Handles sending push notifications using the native Web Push API
 */

let isConfigured = false;

/**
 * Configure web-push with VAPID keys
 */
function configureWebPush() {
  if (isConfigured) return;

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@kitadaie.com";

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn(
      "VAPID keys not configured. Web Push notifications will not work. Run: bun run generate-vapid-keys"
    );
    return;
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  isConfigured = true;
  console.log("Web Push configured with VAPID keys");
}

/**
 * Send a push notification to a single subscription
 * @param {Object} params - Push notification parameters
 * @param {Object} params.subscription - Push subscription object {endpoint, keys}
 * @param {string} params.title - Notification title
 * @param {string} params.body - Notification body
 * @param {Object} [params.data] - Custom data payload
 * @param {string} [params.icon] - Notification icon URL
 * @param {string} [params.badge] - Badge icon URL
 * @param {string} [params.clickAction] - URL to open when notification is clicked
 * @returns {Promise<Object>} Response from Web Push
 */
export async function sendWebPushNotification({
  subscription,
  title,
  body,
  data = {},
  icon = "/icons/icon-192x192.png",
  badge = "/icons/icon-96x96.png",
  clickAction = "/user/notifications",
}) {
  try {
    // Configure web-push if not already configured
    configureWebPush();

    if (!isConfigured) {
      return {
        success: false,
        error: "WEB_PUSH_NOT_CONFIGURED",
        message: "VAPID keys not configured",
      };
    }

    // Construct notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon,
      badge,
      data: {
        ...data,
        clickAction,
      },
      vibrate: [200, 100, 200],
      requireInteraction: false,
    });

    // Send the push notification
    const response = await webpush.sendNotification(subscription, payload);

    console.log("Successfully sent Web Push notification");

    return {
      success: true,
      statusCode: response.statusCode,
    };
  } catch (error) {
    console.error("Error sending Web Push notification:", error);

    // Handle specific error types
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription expired or not found
      return {
        success: false,
        error: "SUBSCRIPTION_EXPIRED",
        message: "Push subscription has expired or is invalid",
        statusCode: error.statusCode,
      };
    }

    return {
      success: false,
      error: error.code || "UNKNOWN_ERROR",
      message: error.message,
      statusCode: error.statusCode,
    };
  }
}

/**
 * Send push notifications to multiple subscriptions
 * @param {Object} params - Push notification parameters
 * @param {Array<Object>} params.subscriptions - Array of push subscription objects
 * @param {string} params.title - Notification title
 * @param {string} params.body - Notification body
 * @param {Object} [params.data] - Custom data payload
 * @param {string} [params.icon] - Notification icon URL
 * @param {string} [params.badge] - Badge icon URL
 * @param {string} [params.clickAction] - URL to open when notification is clicked
 * @returns {Promise<Object>} Response with success/failure counts
 */
export async function sendWebPushNotificationBatch({
  subscriptions,
  title,
  body,
  data = {},
  icon = "/icons/icon-192x192.png",
  badge = "/icons/icon-96x96.png",
  clickAction = "/user/notifications",
}) {
  try {
    // Configure web-push if not already configured
    configureWebPush();

    if (!isConfigured) {
      return {
        success: false,
        successCount: 0,
        failureCount: subscriptions.length,
        error: "WEB_PUSH_NOT_CONFIGURED",
        message: "VAPID keys not configured",
        invalidSubscriptions: [],
      };
    }

    let successCount = 0;
    let failureCount = 0;
    const invalidSubscriptions = [];

    // Send to all subscriptions in parallel
    const results = await Promise.allSettled(
      subscriptions.map((subscription) =>
        sendWebPushNotification({
          subscription,
          title,
          body,
          data,
          icon,
          badge,
          clickAction,
        })
      )
    );

    // Analyze results
    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value.success) {
        successCount++;
      } else {
        failureCount++;

        // Track invalid/expired subscriptions
        if (
          result.status === "fulfilled" &&
          result.value.error === "SUBSCRIPTION_EXPIRED"
        ) {
          invalidSubscriptions.push(subscriptions[index]);
        }
      }
    });

    console.log(
      `Web Push batch send: ${successCount} succeeded, ${failureCount} failed`
    );

    return {
      success: true,
      successCount,
      failureCount,
      invalidSubscriptions,
      results,
    };
  } catch (error) {
    console.error("Error sending Web Push batch notifications:", error);

    return {
      success: false,
      successCount: 0,
      failureCount: subscriptions.length,
      error: error.code || "UNKNOWN_ERROR",
      message: error.message,
      invalidSubscriptions: [],
    };
  }
}

/**
 * Check if web-push is properly configured
 * @returns {boolean}
 */
export function isWebPushConfigured() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

  return Boolean(vapidPublicKey && vapidPrivateKey);
}
