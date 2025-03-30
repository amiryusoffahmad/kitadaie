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

// GET - List all assignments for a class
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

    const classId = await params.id;

    // Check if class exists
    const classExists = await db("tprog_class").where("id", classId).first();

    if (!classExists) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Get all assignments for the class
    const assignments = await db("tprog_assignment")
      .where("class_id", classId)
      .orderBy("due_date", "asc");

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

// POST - Create a new assignment for a class
export async function POST(request, { params }) {
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

    const classId = await params.id;

    // Check if class exists
    const classExists = await db("tprog_class").where("id", classId).first();

    if (!classExists) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.due_date) {
      return NextResponse.json(
        { error: "Assignment title and due date are required" },
        { status: 400 }
      );
    }

    // Create the assignment
    const [assignmentId] = await db("tprog_assignment").insert({
      class_id: classId,
      title: body.title,
      instructions: body.instructions || null,
      due_date: new Date(body.due_date),
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Get the created assignment
    const createdAssignment = await db("tprog_assignment")
      .where("id", assignmentId)
      .first();

    return NextResponse.json(createdAssignment, { status: 201 });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}
