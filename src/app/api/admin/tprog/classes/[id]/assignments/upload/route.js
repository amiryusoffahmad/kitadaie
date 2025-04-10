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

// POST - Create a new assignment with file upload
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

    const classId = params.id;

    // Check if class exists
    const classExists = await db("tprog_class").where("id", classId).first();
    if (!classExists) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Extract data from multipart form
    const formData = await request.formData();

    // Extract form fields
    const title = formData.get("title");
    const instructions = formData.get("instructions") || null;
    const due_date = formData.get("due_date");
    const file = formData.get("file");

    // Validate required fields
    if (!title || !due_date) {
      return NextResponse.json(
        { error: "Assignment title and due date are required" },
        { status: 400 }
      );
    }

    // First create the assignment
    const [assignmentId] = await db("tprog_assignment").insert({
      class_id: classId,
      title: title,
      instructions: instructions,
      due_date: new Date(due_date),
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Now handle the file upload if a file was provided
    if (file && file.size > 0) {
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

        // Save file using UploadService
        const upload = await UploadService.saveFile(fileData, uploadMetadata);

        // Update the assignment with file information - using correct column name
        await db("tprog_assignment").where("id", assignmentId).update({
          file_id: upload.id,
        });
      } catch (uploadError) {
        console.error("Error uploading file:", uploadError);
        // Continue with assignment creation even if file upload fails
      }
    }

    // Get the created assignment with file info
    const createdAssignment = await db("tprog_assignment")
      .where("id", assignmentId)
      .first();

    return NextResponse.json(createdAssignment, { status: 201 });
  } catch (error) {
    console.error("Error creating assignment with file:", error);
    return NextResponse.json(
      { error: "Failed to create assignment: " + error.message },
      { status: 500 }
    );
  }
}
