import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getRole } from "@/server/user/user.server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleData = await getRole(session.user.id);
    if (!roleData || roleData.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ actionUrl: notification.action_url });
  } catch (error) {
    console.error("Error fetching action URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
