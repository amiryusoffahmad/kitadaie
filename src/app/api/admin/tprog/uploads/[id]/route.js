import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

// Helper function to check if user is admin
async function isAdmin(userId) {
  try {
    if (!userId) return false;

    const userRole = await db("user_roles")
      .where({ user_id: userId, role: "admin" })
      .first();

    return !!userRole;
  } catch (error) {
    console.error("Error checking admin role:", error);
    return false;
  }
}

// GET - Get file information by ID
export async function GET(request, { params }) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const admin = await isAdmin(session.user.id);
    if (!admin) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const fileId = params.id;

    // Get file information from uploads table
    const fileInfo = await db("uploads").where("id", fileId).first();

    if (!fileInfo) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json(fileInfo);
  } catch (error) {
    console.error("Error fetching file information:", error);
    return NextResponse.json(
      { error: "Failed to fetch file information" },
      { status: 500 }
    );
  }
}
