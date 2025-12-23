import { sendTaskReminders } from "@/server/notifications/task-notification-service";
import { NextResponse } from "next/server";

/**
 * Cron job endpoint to send task reminders
 * This endpoint should be called daily by a cron service (e.g., Vercel Cron, external cron)
 *
 * Setup instructions:
 * 1. Set CRON_SECRET environment variable
 * 2. Configure cron service to call this endpoint daily with Authorization header
 *
 * Example cron configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-reminders",
 *     "schedule": "0 8 * * *"
 *   }]
 * }
 *
 * Or use external service like cron-job.org:
 * - URL: https://your-domain.com/api/cron/send-reminders
 * - Schedule: 0 8 * * * (Daily at 8 AM)
 * - Headers: Authorization: Bearer YOUR_CRON_SECRET
 */
export async function GET(request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Check authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const providedSecret = authHeader.substring(7); // Remove "Bearer " prefix

    if (providedSecret !== cronSecret) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid credentials" },
        { status: 401 }
      );
    }

    // Execute reminder sending
    console.log("Cron job triggered: Sending task reminders...");
    const result = await sendTaskReminders();

    console.log("Cron job completed:", result);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error("Error in cron job:", error);
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

// Also support POST method
export async function POST(request) {
  return GET(request);
}
