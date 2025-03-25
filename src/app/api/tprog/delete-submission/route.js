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
    const { submissionId } = data;

    // Validate required fields
    if (!submissionId) {
      return NextResponse.json(
        { message: "Submission ID is required" },
        { status: 400 }
      );
    }

    console.log("[API] Processing submission deletion:", {
      submissionId,
      userId: session.user.id,
    });

    // Verify that the user owns this submission
    const submission = await db("tprog_submission")
      .where({
        id: submissionId,
        user_id: session.user.id,
      })
      .first();

    if (!submission) {
      return NextResponse.json(
        {
          message:
            "Submission not found or you don't have permission to delete it",
        },
        { status: 404 }
      );
    }

    // Get the file information before deletion
    // This helps us understand the correct path structure for future uploads
    let fileInfo = null;
    if (submission.file_id) {
      fileInfo = await db("uploads").where("id", submission.file_id).first();

      console.log("[API] Associated file info before deletion:", fileInfo);
    }

    // Delete the submission
    await db("tprog_submission").where("id", submissionId).delete();

    // Do not delete the file record from uploads table
    // This preserves the path info for future reference and allows future uploads to use consistent paths

    return NextResponse.json({
      success: true,
      message: "Submission deleted successfully",
      deletedFileInfo: fileInfo, // Return file info for debugging
    });
  } catch (error) {
    console.error("[API] Error deleting submission:", error);
    return NextResponse.json(
      { message: "Failed to delete submission: " + error.message },
      { status: 500 }
    );
  }
}
