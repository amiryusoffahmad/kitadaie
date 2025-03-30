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

// GET - List all classes
export async function GET() {
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

    // Get all classes
    const classes = await db("tprog_class")
      .select("*")
      .orderBy("created_at", "desc");

    return NextResponse.json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

// POST - Create a new class
export async function POST(request) {
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

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.class_code) {
      return NextResponse.json(
        { error: "Class name and code are required" },
        { status: 400 }
      );
    }

    // Check if class code already exists
    const existingClass = await db("tprog_class")
      .where("class_code", body.class_code)
      .first();

    if (existingClass) {
      return NextResponse.json(
        { error: "Class code already exists" },
        { status: 400 }
      );
    }

    // Create the class
    const [classId] = await db("tprog_class").insert({
      name: body.name,
      class_code: body.class_code,
      description: body.description || null,
      created_by: session.user.id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Get the created class
    const createdClass = await db("tprog_class").where("id", classId).first();

    return NextResponse.json(createdClass, { status: 201 });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}
