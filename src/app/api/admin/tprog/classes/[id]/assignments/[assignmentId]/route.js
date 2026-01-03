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

// GET - Get a specific assignment
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

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}

// PUT - Update a specific assignment
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

    // Handle file upload if this is a multipart form request
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
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

      // Prepare update data
      const updateData = {
        title: title,
        instructions: instructions,
        due_date: new Date(due_date),
        updated_at: new Date(),
      };

      // Handle the file upload if a file was provided
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

          // Update the assignment with file information
          updateData.file_id = upload.id;
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
          // Continue with assignment update even if file upload fails
        }
      }

      // Update the assignment
      await db("tprog_assignment").where("id", assignmentId).update(updateData);

      // Get the updated assignment
      const updatedAssignment = await db("tprog_assignment")
        .where("id", assignmentId)
        .first();

      return NextResponse.json(updatedAssignment);
    } else {
      // Parse request body for JSON requests
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
    }
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific assignment
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

    // If the assignment has an instruction file, delete it
    if (assignment.file_id) {
      try {
        await UploadService.deleteFile(assignment.file_id);
      } catch (deleteError) {
        console.error("Error deleting instruction file:", deleteError);
        // Continue even if file deletion fails
      }
    }

    // Delete the assignment
    await db("tprog_assignment").where("id", assignmentId).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}

// Special endpoint for file uploads
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

    const { id: classId, assignmentId } = await params;
    const url = new URL(request.url);

    // Check if this is a file upload request for an existing assignment
    if (url.pathname.includes("upload") && assignmentId) {
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

      const formData = await request.formData();
      const file = formData.get("file");

      if (!file || file.size === 0) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
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

        // Update the assignment with file information
        await db("tprog_assignment").where("id", assignmentId).update({
          file_id: upload.id,
          updated_at: new Date(),
        });

        // Get the file details from the upload object for the response
        const fileDetails = {
          id: upload.id,
          path: upload.path,
          name: upload.original_filename,
        };

        // Get the updated assignment
        const updatedAssignment = await db("tprog_assignment")
          .where("id", assignmentId)
          .first();

        // Join with uploads table to get file info
        const fileInfo = await db("uploads")
          .where("id", updatedAssignment.file_id)
          .first();

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
    } else {
      return NextResponse.json({ error: "Invalid endpoint" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error processing upload:", error);
    return NextResponse.json(
      { error: "Failed to process upload: " + error.message },
      { status: 500 }
    );
  }
}
