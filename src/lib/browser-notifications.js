"use client";

/**
 * Browser Notification Utility
 * Handles browser push notifications using the Web Notification API
 */

/**
 * Check if browser notifications are supported
 * @returns {boolean}
 */
export function isNotificationSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Get current notification permission status
 * @returns {string} "granted", "denied", or "default"
 */
export function getNotificationPermission() {
  if (!isNotificationSupported()) {
    return "denied";
  }
  if (typeof window !== "undefined" && window.Notification) {
    return window.Notification.permission;
  }
  return "denied";
}

/**
 * Request notification permission from user
 * @returns {Promise<string>} "granted", "denied", or "default"
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    console.warn("Browser notifications are not supported");
    return "denied";
  }

  if (typeof window !== "undefined" && window.Notification) {
    if (window.Notification.permission === "granted") {
      return "granted";
    }

    try {
      const permission = await window.Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  }

  return "denied";
}

/**
 * Show a browser notification
 * @param {Object} options - Notification options
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body text
 * @param {string} [options.icon] - Icon URL
 * @param {string} [options.badge] - Badge icon URL
 * @param {string} [options.tag] - Unique tag to replace existing notifications
 * @param {boolean} [options.requireInteraction=false] - Keep notification until user interacts
 * @param {*} [options.data] - Custom data to attach
 * @param {Function} [options.onClick] - Callback when notification is clicked
 * @returns {Notification|null} The created notification or null if failed
 */
export function showBrowserNotification({
  title,
  body,
  icon = "/icons/icon-192x192.png",
  badge = "/icons/icon-96x96.png",
  tag = null,
  requireInteraction = false,
  data = null,
  onClick = null,
}) {
  // Check if notifications are supported and permitted
  if (!isNotificationSupported()) {
    console.warn("Browser notifications are not supported");
    return null;
  }

  if (typeof window === "undefined" || !window.Notification) {
    console.warn("Notification API not available");
    return null;
  }

  if (window.Notification.permission !== "granted") {
    console.warn("Notification permission not granted");
    return null;
  }

  try {
    // Create notification options
    const options = {
      body,
      icon,
      badge,
      requireInteraction,
      data,
      // Add vibration pattern for mobile
      vibrate: [200, 100, 200],
      // Show notification even if tab is focused
      silent: false,
    };

    // Add tag if provided (for notification grouping/replacement)
    if (tag) {
      options.tag = tag;
    }

    // Create the notification
    const notification = new window.Notification(title, options);

    // Add click handler if provided
    if (onClick && typeof onClick === "function") {
      notification.onclick = (event) => {
        event.preventDefault();
        onClick(notification);
        notification.close();
      };
    }

    // Auto-close after 10 seconds if not requireInteraction
    if (!requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 10000);
    }

    return notification;
  } catch (error) {
    console.error("Error showing browser notification:", error);
    return null;
  }
}

/**
 * Show a task reminder notification
 * @param {Object} task - Task data
 * @param {string} task.id - Task ID
 * @param {string} task.title - Task title
 * @param {string} task.description - Task description
 * @param {number} task.target_month - Target month
 * @param {number} task.target_year - Target year
 */
export function showTaskNotification(task) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthName = months[task.target_month - 1];

  return showBrowserNotification({
    title: `Task Reminder: ${task.title}`,
    body: `Target: ${monthName} ${task.target_year}\n${task.description || ""}`,
    tag: `task-${task.id}`,
    data: { type: "task", taskId: task.id },
    onClick: (notification) => {
      // Focus window and navigate to task
      if (typeof window === "undefined") return;

      window.focus();
      if (notification.data?.taskId) {
        window.location.href = `/tasks/${notification.data.taskId}`;
      }
    },
  });
}

/**
 * Show a generic notification from notification data
 * @param {Object} notification - Notification data from database
 * @param {string} notification.id - Notification ID
 * @param {string} notification.title - Notification title
 * @param {string} notification.message - Notification message
 * @param {string} notification.type - Notification type
 * @param {string} [notification.resource_id] - Resource ID
 * @param {string} [notification.resource_type] - Resource type
 * @param {string} [notification.action_url] - Custom action URL (for admin broadcasts)
 */
export function showNotificationFromData(notification) {
  const onClick = async (browserNotif) => {
    if (typeof window === "undefined") return;

    window.focus();

    // Navigate based on notification type and resource
    if (notification.resource_type === "organizational_task" && notification.resource_id) {
      window.location.href = `/tasks/${notification.resource_id}`;
    } else if (notification.type === "organizational_task" && notification.resource_id) {
      window.location.href = `/tasks/${notification.resource_id}`;
    } else if (notification.type === "admin_broadcast" && notification.resource_id) {
      // For admin broadcasts, check if there's a custom action URL
      try {
        const response = await fetch(`/api/admin/notifications/${notification.resource_id}/action-url`);
        if (response.ok) {
          const data = await response.json();
          if (data.actionUrl) {
            window.location.href = data.actionUrl;
            return;
          }
        }
      } catch (error) {
        console.error("Error fetching action URL:", error);
      }
      // Fallback to notifications page
      window.location.href = "/user/notifications";
    } else if (notification.action_url) {
      // Direct action URL if provided
      window.location.href = notification.action_url;
    } else {
      // Default: go to notifications page
      window.location.href = "/user/notifications";
    }
  };

  return showBrowserNotification({
    title: notification.title,
    body: notification.message,
    tag: `notification-${notification.id}`,
    data: {
      notificationId: notification.id,
      type: notification.type,
      resourceId: notification.resource_id,
      resourceType: notification.resource_type,
    },
    onClick,
  });
}

/**
 * Check if user has enabled notifications and request if not
 * @returns {Promise<boolean>} True if granted, false otherwise
 */
export async function ensureNotificationPermission() {
  if (!isNotificationSupported()) {
    return false;
  }

  const permission = getNotificationPermission();

  if (permission === "granted") {
    return true;
  }

  if (permission === "default") {
    const result = await requestNotificationPermission();
    return result === "granted";
  }

  // Permission was denied
  return false;
}
