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

          // Update the assignment with file information
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
    }
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}

// New endpoint to handle file uploads specifically
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
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const assignmentIdIndex = pathParts.indexOf("assignments") + 1;
    const assignmentId =
      assignmentIdIndex < pathParts.length
        ? pathParts[assignmentIdIndex]
        : null;

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

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
