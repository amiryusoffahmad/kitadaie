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

// DELETE - Delete a class by ID
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

    // Check if class exists
    const classExists = await db("tprog_class").where("id", classId).first();

    if (!classExists) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Delete associated data first - using a transaction to ensure all related data is deleted
    await db.transaction(async (trx) => {
      // Delete assignments and their submissions in a cascading manner
      const assignments = await trx("tprog_assignment")
        .where("class_id", classId)
        .select("id");

      if (assignments.length > 0) {
        const assignmentIds = assignments.map((a) => a.id);

        // Delete submissions
        await trx("tprog_submission")
          .whereIn("assignment_id", assignmentIds)
          .delete();

        // Delete assignments
        await trx("tprog_assignment").where("class_id", classId).delete();
      }

      // Delete enrollments
      await trx("tprog_enrollment").where("class_id", classId).delete();

      // Finally delete the class
      await trx("tprog_class").where("id", classId).delete();
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    );
  }
}

// PUT - Update a class by ID
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

    // Check if class exists
    const classExists = await db("tprog_class").where("id", classId).first();

    if (!classExists) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Class name is required" },
        { status: 400 }
      );
    }

    // Note: We don't allow changing the class_code as it may be referenced elsewhere

    // Update the class
    await db("tprog_class")
      .where("id", classId)
      .update({
        name: body.name,
        description: body.description || null,
        updated_at: new Date(),
      });

    // Get the updated class
    const updatedClass = await db("tprog_class").where("id", classId).first();

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    );
  }
}
