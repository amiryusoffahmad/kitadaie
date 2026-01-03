import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // Get the action URL from admin_notifications table
    const notification = await db("admin_notifications")
      .where({ id })
      .select("action_url")
      .first();

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      actionUrl: notification.action_url,
    });
  } catch (error) {
    console.error("Error fetching action URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
