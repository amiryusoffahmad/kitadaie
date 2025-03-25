import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request) {
  try {
    // Get session to authenticate the request
    const session = await auth.api.getSession({
      headers: headers(),
    });
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const data = await request.json();
    let { assignmentId, filePath, fileSize = 0, fileName, mimeType } = data;

    // Validate required fields
    if (!assignmentId) {
      return NextResponse.json(
        { message: "Assignment ID is required" },
        { status: 400 }
      );
    }

    if (!filePath) {
      return NextResponse.json(
        { message: "File path is required" },
        { status: 400 }
      );
    }

    // Normalize the file path to ensure it always starts with /uploads/
    if (!filePath.startsWith("/uploads/")) {
      // If path doesn't have /uploads/ prefix, check if it has uploads/ without leading slash
      if (filePath.startsWith("uploads/")) {
        filePath = "/" + filePath;
      } else if (filePath.includes("/uploads/")) {
        // Extract the /uploads/ part and everything after it
        filePath = "/" + filePath.split("/uploads/")[1];
        filePath = "/uploads/" + filePath;
      } else {
        // If the path is entirely different, log it but keep it as is
        console.log(
          "[API] Warning: File path does not follow expected pattern:",
          filePath
        );
      }
    }

    console.log(
      "[API] Processing assignment submission with normalized path:",
      {
        assignmentId,
        filePath,
        fileSize,
        userId: session.user.id,
      }
    );

    // Check if submission already exists
    const existingSubmission = await db("tprog_submission")
      .where({
        assignment_id: assignmentId,
        user_id: session.user.id,
      })
      .first();

    // If submission exists, update it
    if (existingSubmission) {
      // Get file ID from uploads table or create a new file record
      const file = await getOrCreateFileRecord(
        filePath,
        fileSize,
        fileName,
        mimeType,
        session.user.id
      );

      // Update submission
      await db("tprog_submission").where("id", existingSubmission.id).update({
        file_id: file.id,
        status: "pending_review",
        submitted_at: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: "Assignment submission updated",
      });
    } else {
      // Create a new file record
      const file = await getOrCreateFileRecord(
        filePath,
        fileSize,
        fileName,
        mimeType,
        session.user.id
      );

      // Create a new submission
      await db("tprog_submission").insert({
        assignment_id: assignmentId,
        user_id: session.user.id,
        file_id: file.id,
        status: "pending_review",
        submitted_at: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: "Assignment submitted successfully",
      });
    }
  } catch (error) {
    console.error("[API] Error submitting assignment:", error);
    return NextResponse.json(
      { message: "Failed to submit assignment: " + error.message },
      { status: 500 }
    );
  }
}

// Helper function to get or create a file record
async function getOrCreateFileRecord(
  filePath,
  fileSize = 0,
  providedFileName = null,
  providedMimeType = null,
  userId = null
) {
  // Extract original filename from path if not provided
  const fileName = providedFileName || filePath.split("/").pop();

  // Check if file record exists
  const existingFile = await db("uploads").where("path", filePath).first();

  if (existingFile) {
    return existingFile;
  }

  // Create a new file record
  const [fileId] = await db("uploads")
    .insert({
      filename: fileName, // Set filename same as original for now
      original_filename: fileName,
      path: filePath,
      size: fileSize, // Use the size provided from client
      mimetype: providedMimeType || getMimeType(fileName), // Use provided mimetype or guess based on extension
      user_id: userId, // Associate with user if provided
      document_type: "assignment",
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning("id");

  return { id: fileId, path: filePath };
}

// Helper function to get mimetype based on file extension
function getMimeType(fileName) {
  const extension = fileName.split(".").pop().toLowerCase();

  const mimeTypes = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    txt: "text/plain",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
  };

  return mimeTypes[extension] || "application/octet-stream"; // Default to binary if unknown
}
