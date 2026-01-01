"use server";

import { db } from "@/lib/db";

/**
 * Get notification history with recipient details
 * @param {Object} filters
 * @param {string} [filters.status] - Filter by status
 * @param {string} [filters.targetType] - Filter by target type
 * @param {string} [filters.createdBy] - Filter by creator
 * @param {Date|string} [filters.dateFrom] - Filter from date
 * @param {Date|string} [filters.dateTo] - Filter to date
 * @param {number} [filters.limit=50] - Limit results
 * @param {number} [filters.offset=0] - Offset for pagination
 * @returns {Promise<Object>} - History records with pagination
 */
export async function getNotificationHistory(filters = {}) {
  const {
    status,
    targetType,
    createdBy,
    dateFrom,
    dateTo,
    limit = 50,
    offset = 0,
  } = filters;

  let query = db("admin_notifications as an")
    .leftJoin("user as u", "an.created_by", "u.id")
    .leftJoin("departments as d", "an.target_department_id", "d.id")
    .leftJoin("org_roles as r", "an.target_role_id", "r.id")
    .select(
      "an.*",
      "u.name as creator_name",
      "u.email as creator_email",
      "d.name as department_name",
      "r.name as role_name"
    );

  // Apply filters
  if (status) {
    if (Array.isArray(status)) {
      query = query.whereIn("an.status", status);
    } else {
      query = query.where("an.status", status);
    }
  }

  if (targetType) {
    query = query.where("an.target_type", targetType);
  }

  if (createdBy) {
    query = query.where("an.created_by", createdBy);
  }

  if (dateFrom) {
    query = query.where("an.created_at", ">=", dateFrom);
  }

  if (dateTo) {
    query = query.where("an.created_at", "<=", dateTo);
  }

  // Get total count
  const countQuery = query.clone().clearSelect().clearOrder().count("an.id as total");
  const [{ total }] = await countQuery;

  // Get paginated results
  const notifications = await query
    .orderBy("an.created_at", "desc")
    .limit(limit)
    .offset(offset);

  return {
    notifications,
    total: parseInt(total),
    limit,
    offset,
    hasMore: offset + limit < total,
  };
}

/**
 * Get detailed recipients for a specific admin notification
 * @param {number} adminNotificationId
 * @param {Object} options
 * @param {number} [options.limit=100]
 * @param {number} [options.offset=0]
 * @returns {Promise<Object>} - List of recipients with read status and pagination
 */
export async function getNotificationRecipients(
  adminNotificationId,
  { limit = 100, offset = 0 } = {}
) {
  if (!adminNotificationId) {
    throw new Error("Admin notification ID is required");
  }

  // Get recipients with their notification read status
  let query = db("admin_notification_recipients as anr")
    .join("user as u", "anr.user_id", "u.id")
    .leftJoin("notifications as n", "anr.notification_id", "n.id")
    .where("anr.admin_notification_id", adminNotificationId)
    .select(
      "anr.id",
      "anr.user_id",
      "u.name as user_name",
      "u.email as user_email",
      "u.username",
      "anr.delivered_at",
      "n.read",
      "n.id as notification_id"
    );

  // Get total count
  const countQuery = query
    .clone()
    .clearSelect()
    .clearOrder()
    .count("anr.id as total");
  const [{ total }] = await countQuery;

  // Get paginated results
  const recipients = await query
    .orderBy("anr.delivered_at", "desc")
    .limit(limit)
    .offset(offset);

  return {
    recipients,
    total: parseInt(total),
    limit,
    offset,
    hasMore: offset + limit < total,
  };
}

/**
 * Get recurrence execution log for a recurring notification
 * @param {number} adminNotificationId
 * @returns {Promise<Array>} - Execution log entries
 */
export async function getRecurrenceLog(adminNotificationId) {
  if (!adminNotificationId) {
    throw new Error("Admin notification ID is required");
  }

  const log = await db("admin_notification_recurrence_log")
    .where("admin_notification_id", adminNotificationId)
    .orderBy("execution_date", "desc")
    .select("*");

  return log;
}

/**
 * Get statistics for admin notifications
 * @param {string} [createdBy] - Filter by creator
 * @returns {Promise<Object>} - Statistics object
 */
export async function getNotificationStatistics(createdBy = null) {
  let query = db("admin_notifications");

  if (createdBy) {
    query = query.where("created_by", createdBy);
  }

  // Get counts by status
  const statusCounts = await query
    .clone()
    .select("status")
    .count("id as count")
    .groupBy("status");

  // Get total notifications sent (all time)
  const [totalSent] = await query
    .clone()
    .where("status", "sent")
    .count("id as count");

  // Get total recipients reached (all time)
  const [totalRecipients] = await query
    .clone()
    .where("status", "sent")
    .sum("sent_count as total");

  // Get notifications sent this month
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const [sentThisMonth] = await query
    .clone()
    .where("status", "sent")
    .where("sent_at", ">=", firstDayOfMonth.toISOString())
    .count("id as count");

  // Get active recurring notifications
  const [activeRecurring] = await query
    .clone()
    .where("status", "recurring_active")
    .count("id as count");

  // Get scheduled notifications
  const [scheduled] = await query
    .clone()
    .where("status", "scheduled")
    .count("id as count");

  // Convert status counts to object
  const statusCountsObj = statusCounts.reduce((acc, row) => {
    acc[row.status] = parseInt(row.count);
    return acc;
  }, {});

  return {
    totalSent: parseInt(totalSent.count),
    totalRecipients: parseInt(totalRecipients.total || 0),
    sentThisMonth: parseInt(sentThisMonth.count),
    activeRecurring: parseInt(activeRecurring.count),
    scheduled: parseInt(scheduled.count),
    byStatus: statusCountsObj,
  };
}

/**
 * Get recent notification activity (last 10 notifications)
 * @param {string} [createdBy] - Filter by creator
 * @returns {Promise<Array>} - Recent notifications
 */
export async function getRecentNotifications(createdBy = null) {
  let query = db("admin_notifications as an")
    .leftJoin("user as u", "an.created_by", "u.id")
    .leftJoin("departments as d", "an.target_department_id", "d.id")
    .leftJoin("org_roles as r", "an.target_role_id", "r.id")
    .select(
      "an.id",
      "an.title",
      "an.status",
      "an.target_type",
      "an.sent_at",
      "an.sent_count",
      "an.created_at",
      "u.name as creator_name",
      "d.name as department_name",
      "r.name as role_name"
    )
    .whereIn("an.status", ["sent", "scheduled", "recurring_active"])
    .orderBy("an.created_at", "desc")
    .limit(10);

  if (createdBy) {
    query = query.where("an.created_by", createdBy);
  }

  const notifications = await query;
  return notifications;
}

/**
 * Get read statistics for a specific notification
 * @param {number} adminNotificationId
 * @returns {Promise<Object>} - Read statistics
 */
export async function getNotificationReadStats(adminNotificationId) {
  if (!adminNotificationId) {
    throw new Error("Admin notification ID is required");
  }

  // Get total recipients
  const [total] = await db("admin_notification_recipients")
    .where("admin_notification_id", adminNotificationId)
    .count("id as count");

  // Get read count
  const [readCount] = await db("admin_notification_recipients as anr")
    .join("notifications as n", "anr.notification_id", "n.id")
    .where("anr.admin_notification_id", adminNotificationId)
    .where("n.read", 1)
    .count("anr.id as count");

  const totalCount = parseInt(total.count);
  const read = parseInt(readCount.count);
  const unread = totalCount - read;
  const readPercentage =
    totalCount > 0 ? Math.round((read / totalCount) * 100) : 0;

  return {
    total: totalCount,
    read,
    unread,
    readPercentage,
  };
}

/**
 * Get notification performance metrics (for dashboard/analytics)
 * @param {Object} options
 * @param {string} [options.createdBy] - Filter by creator
 * @param {number} [options.days=30] - Number of days to analyze
 * @returns {Promise<Object>} - Performance metrics
 */
export async function getNotificationPerformanceMetrics(options = {}) {
  const { createdBy, days = 30 } = options;

  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);

  let query = db("admin_notifications")
    .where("status", "sent")
    .where("sent_at", ">=", dateFrom.toISOString());

  if (createdBy) {
    query = query.where("created_by", createdBy);
  }

  // Get notifications sent in period
  const sentNotifications = await query.clone().select("*");

  // Calculate metrics
  const totalSent = sentNotifications.length;
  const totalRecipients = sentNotifications.reduce(
    (sum, n) => sum + (n.sent_count || 0),
    0
  );
  const avgRecipientsPerNotification =
    totalSent > 0 ? Math.round(totalRecipients / totalSent) : 0;

  // Get notifications by target type
  const byTargetType = sentNotifications.reduce((acc, n) => {
    acc[n.target_type] = (acc[n.target_type] || 0) + 1;
    return acc;
  }, {});

  // Get notifications by day
  const byDay = sentNotifications.reduce((acc, n) => {
    const day = new Date(n.sent_at).toISOString().split("T")[0];
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  return {
    period: `Last ${days} days`,
    totalSent,
    totalRecipients,
    avgRecipientsPerNotification,
    byTargetType,
    byDay,
  };
}
