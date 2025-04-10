"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Server action to get the current user ID
 */
export async function getCurrentUserIdAction() {
  try {
    const session = await auth.api.getSession({
      headers: headers(),
    });

    return session?.user?.id || null;
  } catch (error) {
    console.error("Error getting current user ID in action:", error);
    return null;
  }
}

/**
 * Fetch upcoming events
 * @param {number} limit - Number of events to fetch
 * @returns {Promise<Array>} - Array of upcoming events
 */
export async function fetchUpcomingEventsAction(limit = 5) {
  try {
    const now = new Date();

    const events = await db("events")
      .where("start_date", ">", now)
      .where("is_active", true)
      .orderBy("start_date", "asc")
      .limit(limit);

    return events;
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    throw new Error("Failed to fetch upcoming events");
  }
}

/**
 * Format event date for display
 * @param {string} startDate - Event start date
 * @param {string} endDate - Event end date
 * @returns {string} - Formatted date string
 */
export async function formatEventDate(startDate, endDate) {
  const start = new Date(startDate);

  // Format for single day event
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };

  if (!endDate) {
    return `${start.toLocaleDateString(
      "en-US",
      dateOptions
    )} at ${start.toLocaleTimeString("en-US", timeOptions)}`;
  }

  // Format for multi-day event
  const end = new Date(endDate);

  // Same day, different times
  if (start.toDateString() === end.toDateString()) {
    return `${start.toLocaleDateString(
      "en-US",
      dateOptions
    )} from ${start.toLocaleTimeString(
      "en-US",
      timeOptions
    )} to ${end.toLocaleTimeString("en-US", timeOptions)}`;
  }

  // Different days
  return `From ${start.toLocaleDateString(
    "en-US",
    dateOptions
  )} to ${end.toLocaleDateString("en-US", dateOptions)}`;
}
