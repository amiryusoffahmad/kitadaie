/**
 * Deep Linking Utility
 * Generate deep links for app navigation from external sources (e.g., Telegram notifications)
 */

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_DEEP_LINK_BASE ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://kitadaie.com";

/**
 * Generate a deep link for a task
 * @param {number} taskId - Task ID
 * @returns {string} - Full URL to task detail page
 */
export function generateTaskDeepLink(taskId) {
  if (!taskId) {
    throw new Error("Task ID is required");
  }

  return `${APP_BASE_URL}/tasks/${taskId}`;
}

/**
 * Generate a deep link for the tasks list page
 * @param {Object} [filters] - Optional filters
 * @param {string} [filters.status] - Filter by status
 * @param {number} [filters.month] - Filter by month
 * @param {number} [filters.year] - Filter by year
 * @returns {string} - Full URL to tasks list page
 */
export function generateTasksListDeepLink(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.append("status", filters.status);
  }

  if (filters.month) {
    params.append("month", filters.month.toString());
  }

  if (filters.year) {
    params.append("year", filters.year.toString());
  }

  const queryString = params.toString();
  return `${APP_BASE_URL}/tasks${queryString ? `?${queryString}` : ""}`;
}

/**
 * Generate a deep link for a notification
 * @param {number} notificationId - Notification ID
 * @returns {string} - Full URL to notification detail page
 */
export function generateNotificationDeepLink(notificationId) {
  if (!notificationId) {
    throw new Error("Notification ID is required");
  }

  return `${APP_BASE_URL}/user/notifications/${notificationId}`;
}

/**
 * Generate a deep link for the home page
 * @returns {string} - Full URL to home page
 */
export function generateHomeDeepLink() {
  return `${APP_BASE_URL}/home`;
}

/**
 * Get the app base URL
 * @returns {string} - App base URL
 */
export function getAppBaseUrl() {
  return APP_BASE_URL;
}
