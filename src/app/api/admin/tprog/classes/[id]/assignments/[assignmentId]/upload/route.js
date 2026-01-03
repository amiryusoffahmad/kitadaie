import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { UploadService } from "@/lib/services/upload-service";

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

// PUT - Update instruction file for an existing assignment
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

    const { id: classId, assignmentId } = await params;

    // Check if assignment exists
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

    // Process multipart form data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file type
    const fileType = file.type;
    if (
      ![
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(fileType)
    ) {
      return NextResponse.json(
        { error: "Only PDF and Word documents are allowed" },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Initialize update data
    const updateData = {
      updated_at: new Date(),
    };

    // If there are other form fields, process them too
    const title = formData.get("title");
    const instructions = formData.get("instructions");
    const due_date = formData.get("due_date");

    if (title) updateData.title = title;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (due_date) updateData.due_date = new Date(due_date);

    try {
      // Convert File object to format expected by UploadService
      const fileBuffer = await file.arrayBuffer();
      const fileData = {
        originalname: file.name,
        mimetype: file.type,
        size: file.size,
        buffer: Buffer.from(fileBuffer),
      };

      // Add metadata for the upload
      const uploadMetadata = {
        user_id: session.user.id,
        document_type: "assignment_instruction",
        reference_id: assignmentId,
      };

      // If there's an existing file, try to delete it
      if (assignment.file_id) {
        try {
          await UploadService.deleteFile(assignment.file_id);
        } catch (deleteError) {
          console.error("Error deleting previous file:", deleteError);
          // Continue even if deletion fails
        }
      }

      // Save file using UploadService
      const upload = await UploadService.saveFile(fileData, uploadMetadata);

      // Add file information to update data
      updateData.file_id = upload.id;

      // Update the assignment
      await db("tprog_assignment").where("id", assignmentId).update(updateData);

      // Get the updated assignment
      const updatedAssignment = await db("tprog_assignment")
        .where("id", assignmentId)
        .first();

      // Get the file details from the upload
      const fileDetails = {
        id: upload.id,
        path: upload.path,
        name: upload.original_filename,
      };

      return NextResponse.json({
        success: true,
        assignment: updatedAssignment,
        file: fileDetails,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      return NextResponse.json(
        { error: "Failed to upload file: " + error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing upload:", error);
    return NextResponse.json(
      { error: "Failed to process upload: " + error.message },
      { status: 500 }
    );
  }
}
