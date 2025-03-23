import { NextResponse } from "next/server";
import { UploadService } from "@/lib/services/upload-service";
import { UploadModel } from "@/lib/models/upload";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/uploads/[id] - Get a specific upload
 */
export async function GET(request, { params }) {
  try {
    // Get the authenticated user from the auth API with headers
    const session = await auth.api.getSession({
      headers: headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const upload = await UploadModel.getById(id);

    if (!upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    // Check if the upload belongs to the user
    if (upload.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ upload });
  } catch (error) {
    console.error("Error fetching upload:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch upload" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/uploads/[id] - Delete an upload
 */
export async function DELETE(request, { params }) {
  try {
    // Get the authenticated user from the auth API with headers
    const session = await auth.api.getSession({
      headers: headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const upload = await UploadModel.getById(id);

    if (!upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    // Check if the upload belongs to the user
    if (upload.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the upload
    const deleted = await UploadService.deleteFile(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete upload" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting upload:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete upload" },
      { status: 500 }
    );
  }
}
