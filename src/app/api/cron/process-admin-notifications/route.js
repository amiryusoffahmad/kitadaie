import {
  processScheduledNotifications,
  processRecurringNotifications,
} from "@/server/admin-notifications/scheduler-service";
import { NextResponse } from "next/server";

/**
 * Cron job to process scheduled and recurring admin notifications
 * Should run every hour (or every 15 minutes for more precision)
 *
 * Vercel cron config (add to vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-admin-notifications",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 *
 * External cron service (e.g., cron-job.org):
 * - URL: https://your-domain.com/api/cron/process-admin-notifications
 * - Schedule: 0 * * * * (every hour)
 * - Headers: Authorization: Bearer YOUR_CRON_SECRET
 */
export async function GET(request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      console.error("Unauthorized cron attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("=== Starting admin notifications processing ===");
    const startTime = Date.now();

    // Process scheduled notifications
    console.log("Processing scheduled notifications...");
    const scheduledResult = await processScheduledNotifications();
    console.log("Scheduled notifications result:", scheduledResult);

    // Process recurring notifications
    console.log("Processing recurring notifications...");
    const recurringResult = await processRecurringNotifications();
    console.log("Recurring notifications result:", recurringResult);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(
      `=== Admin notifications processing completed in ${duration}ms ===`
    );

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      scheduled: {
        processed: scheduledResult.processed,
        succeeded: scheduledResult.succeeded,
        failed: scheduledResult.failed,
        errors: scheduledResult.errors,
      },
      recurring: {
        processed: recurringResult.processed,
        succeeded: recurringResult.succeeded,
        failed: recurringResult.failed,
        skipped: recurringResult.skipped,
        errors: recurringResult.errors,
      },
    });
  } catch (error) {
    console.error("Critical error in cron job:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST method support for testing and manual triggers
 */
export async function POST(request) {
  return GET(request);
}
