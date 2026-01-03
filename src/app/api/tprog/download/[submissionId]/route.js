import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import path from "path";
import fs from "fs";

export async function GET(request, { params }) {
  try {
    const { submissionId } = await params;
    console.log(
      "[API] Processing file download request for submission:",
      submissionId
    );

    if (!submissionId) {
      return NextResponse.json(
        { message: "Submission ID is required" },
        { status: 400 }
      );
    }

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

    // Get the submission with file information
    const submission = await db("tprog_submission")
      .select(
        "tprog_submission.*",
        "uploads.filename",
        "uploads.path as filepath"
      )
      .leftJoin("uploads", "tprog_submission.file_id", "uploads.id")
      .where({
        "tprog_submission.id": submissionId,
      })
      .first();

    if (!submission) {
      return NextResponse.json(
        { message: "Submission not found" },
        { status: 404 }
      );
    }

    // Get the assignment to check if the user has access
    const assignment = await db("tprog_assignment")
      .where("id", submission.assignment_id)
      .first();

    if (!assignment) {
      return NextResponse.json(
        { message: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check if the user is the owner of the submission or an admin/instructor
    const isOwner = submission.user_id === session.user.id;
    const isAdmin = session.user.role === "admin";
    const isInstructor = await db("tprog_class_instructor")
      .where({
        class_id: assignment.class_id,
        user_id: session.user.id,
      })
      .first();

    if (!isOwner && !isAdmin && !isInstructor) {
      return NextResponse.json(
        { message: "You don't have permission to download this file" },
        { status: 403 }
      );
    }

    // Check if we have file information
    if (!submission.file_id || !submission.filepath) {
      return NextResponse.json(
        { message: "No file associated with this submission" },
        { status: 404 }
      );
    }

    // Get file path
    const filePath = submission.filepath;
    const fileName = submission.filename || "download";

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error("[API] File not found at path:", filePath);
      return NextResponse.json(
        { message: "File not found on server" },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Create response with appropriate headers
    const response = new NextResponse(fileBuffer);

    // Set headers for download
    response.headers.set("Content-Type", "application/octet-stream");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );
    response.headers.set("Content-Length", fileBuffer.length);

    return response;
  } catch (error) {
    console.error("[API] Error downloading file:", error);
    return NextResponse.json(
      { message: "Error downloading file: " + error.message },
      { status: 500 }
    );
  }
}
