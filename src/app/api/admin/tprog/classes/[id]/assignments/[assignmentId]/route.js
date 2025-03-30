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

// DELETE - Delete an assignment by ID
export async function DELETE(request, { params }) {
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
    const assignmentId = params.assignmentId;

    // Check if class exists
    const classExists = await db("tprog_class").where("id", classId).first();

    if (!classExists) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Check if assignment exists and belongs to this class
    const assignment = await db("tprog_assignment")
      .where({
        id: assignmentId,
        class_id: classId,
      })
      .first();

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Delete associated data first - using a transaction
    await db.transaction(async (trx) => {
      // Delete submissions for this assignment
      await trx("tprog_submission")
        .where("assignment_id", assignmentId)
        .delete();

      // Delete the assignment
      await trx("tprog_assignment").where("id", assignmentId).delete();
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}

// PUT - Update an assignment by ID
export async function PUT(request, { params }) {
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

    const classId = params.id;
    const assignmentId = params.assignmentId;

    // Check if class exists
    const classExists = await db("tprog_class").where("id", classId).first();

    if (!classExists) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Check if assignment exists and belongs to this class
    const assignment = await db("tprog_assignment")
      .where({
        id: assignmentId,
        class_id: classId,
      })
      .first();

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
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

    // Update the assignment
    await db("tprog_assignment")
      .where("id", assignmentId)
      .update({
        title: body.title,
        instructions: body.instructions || null,
        due_date: new Date(body.due_date),
        updated_at: new Date(),
      });

    // Get the updated assignment
    const updatedAssignment = await db("tprog_assignment")
      .where("id", assignmentId)
      .first();

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}
