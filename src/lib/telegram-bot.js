/**
 * Telegram Bot Integration
 * Simple HTTP-based Telegram Bot API integration
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Send a message to a Telegram chat (user or group)
 * @param {string} chatId - Chat ID (user chat ID or group chat ID)
 * @param {string} message - Message text
 * @param {Object} [options] - Additional options
 * @param {string} [options.parseMode] - Parse mode ('HTML', 'Markdown', 'MarkdownV2')
 * @param {boolean} [options.disableWebPagePreview] - Disable link previews
 * @returns {Promise<Object>} - Telegram API response
 */
export async function sendMessage(chatId, message, options = {}) {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN environment variable is not set");
    }

    if (!chatId || !message) {
      throw new Error("Chat ID and message are required");
    }

    const {
      parseMode = "HTML",
      disableWebPagePreview = false,
    } = options;

    const response = await fetch(`${TELEGRAM_API_BASE}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: parseMode,
        disable_web_page_preview: disableWebPagePreview,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(
        `Telegram API error: ${data.description || "Unknown error"}`
      );
    }

    return data.result;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    throw new Error(`Failed to send Telegram message: ${error.message}`);
  }
}

/**
 * Send a message to a Telegram group
 * @param {string} groupId - Group chat ID
 * @param {string} message - Message text
 * @param {Object} [options] - Additional options
 * @returns {Promise<Object>} - Telegram API response
 */
export async function sendMessageToGroup(groupId, message, options = {}) {
  try {
    return await sendMessage(groupId, message, options);
  } catch (error) {
    console.error("Error sending message to Telegram group:", error);
    throw error;
  }
}

/**
 * Send a message to a Telegram user
 * @param {string} chatId - User chat ID
 * @param {string} message - Message text
 * @param {Object} [options] - Additional options
 * @returns {Promise<Object>} - Telegram API response
 */
export async function sendMessageToUser(chatId, message, options = {}) {
  try {
    return await sendMessage(chatId, message, options);
  } catch (error) {
    console.error("Error sending message to Telegram user:", error);
    throw error;
  }
}

/**
 * Format a task as a Telegram notification message
 * @param {Object} task - Task object
 * @param {string} task.title - Task title
 * @param {string} [task.description] - Task description
 * @param {string} [task.training_type] - Training type
 * @param {number} task.target_month - Target month
 * @param {number} task.target_year - Target year
 * @param {string} [task.status] - Task status
 * @param {number} task.id - Task ID
 * @returns {string} - Formatted message
 */
export function formatTaskNotification(task) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Handle both snake_case (from DB) and camelCase formats
  const title = task.title || task.task_title;
  const description = task.description || task.task_description;
  const trainingType = task.training_type;
  const targetMonth = task.target_month;
  const targetYear = task.target_year;
  const status = task.status || task.task_status;
  const taskId = task.id || task.task_id;

  const monthName = monthNames[targetMonth - 1] || targetMonth;
  const deepLinkBase = process.env.NEXT_PUBLIC_APP_DEEP_LINK_BASE || process.env.NEXT_PUBLIC_APP_URL || "https://kitadaie.com";
  const taskUrl = `${deepLinkBase}/tasks/${taskId}`;

  let message = `📅 <b>Reminder: ${title}</b>\n`;
  message += `\n`;
  message += `<b>Target Date:</b> ${monthName} ${targetYear}\n`;

  if (trainingType) {
    message += `<b>Training Type:</b> ${trainingType}\n`;
  }

  if (description) {
    message += `<b>Description:</b> ${description}\n`;
  }

  if (status) {
    const statusEmoji = {
      pending: "⏳",
      in_progress: "🔄",
      completed: "✅",
    };
    message += `<b>Status:</b> ${statusEmoji[status] || ""} ${status.replace("_", " ").toUpperCase()}\n`;
  }

  message += `\n`;
  message += `📱 <a href="${taskUrl}">View details in app</a>`;

  return message;
}

/**
 * Format a short task notification message (for concise notifications)
 * @param {Object} task - Task object
 * @returns {string} - Formatted short message
 */
export function formatShortTaskNotification(task) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Handle both snake_case (from DB) and camelCase formats
  const title = task.title || task.task_title;
  const targetMonth = task.target_month;
  const targetYear = task.target_year;
  const taskId = task.id || task.task_id;

  const monthName = monthNames[targetMonth - 1] || targetMonth;
  const deepLinkBase = process.env.NEXT_PUBLIC_APP_DEEP_LINK_BASE || process.env.NEXT_PUBLIC_APP_URL || "https://kitadaie.com";
  const taskUrl = `${deepLinkBase}/tasks/${taskId}`;

  return `📅 <b>${title}</b> - ${monthName} ${targetYear}\n📱 <a href="${taskUrl}">View details</a>`;
}

/**
 * Check if Telegram bot is configured
 * @returns {boolean} - True if bot token is set
 */
export function isTelegramConfigured() {
  return !!TELEGRAM_BOT_TOKEN;
}

/**
 * Get bot information (for testing connection)
 * @returns {Promise<Object>} - Bot information
 */
export async function getBotInfo() {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN environment variable is not set");
    }

    const response = await fetch(`${TELEGRAM_API_BASE}/getMe`);
    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(
        `Telegram API error: ${data.description || "Unknown error"}`
      );
    }

    return data.result;
  } catch (error) {
    console.error("Error getting bot info:", error);
    throw new Error(`Failed to get bot info: ${error.message}`);
  }
}
