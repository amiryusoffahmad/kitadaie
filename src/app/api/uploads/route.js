import { NextResponse } from "next/server";
import { UploadService } from "@/lib/services/upload-service";
import { UploadModel } from "@/lib/models/upload";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Handles multipart form data for file uploads
 */
async function parseFormData(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file) {
    throw new Error("No file provided");
  }

  // Extract metadata from form data
  const metadata = {};
  for (const [key, value] of formData.entries()) {
    if (key !== "file") {
      metadata[key] = value;
    }
  }

  return { file, metadata };
}

/**
 * POST /api/uploads - Upload a file
 */
export async function POST(request) {
  try {
    // Get the authenticated user from the auth API with headers
    const session = await auth.api.getSession({
      headers: headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse multipart form data
    const { file, metadata } = await parseFormData(request);

    // Check if file is a PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Convert File object to format expected by UploadService
    const fileBuffer = await file.arrayBuffer();
    const fileData = {
      originalname: file.name,
      mimetype: file.type,
      size: file.size,
      buffer: Buffer.from(fileBuffer),
    };

    // Add user ID to metadata
    const uploadMetadata = {
      ...metadata,
      user_id: session.user.id,
    };

    // Save file and create database record
    const upload = await UploadService.saveFile(fileData, uploadMetadata);

    return NextResponse.json({
      success: true,
      upload: {
        id: upload.id,
        filename: upload.original_filename,
        path: upload.path,
        size: upload.size,
        type: upload.mimetype,
      },
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/uploads - Get uploads for the authenticated user
 */
export async function GET(request) {
  try {
    // Get the authenticated user from the auth API with headers
    const session = await auth.api.getSession({
      headers: headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const referenceId = searchParams.get("referenceId");
    const documentType = searchParams.get("documentType");

    let uploads;

    // Get uploads by reference ID and document type if provided
    if (referenceId && documentType) {
      uploads = await UploadModel.getByReference(
        parseInt(referenceId, 10),
        documentType
      );
    } else {
      // Otherwise get all uploads for the user
      uploads = await UploadModel.getByUserId(session.user.id);
    }

    return NextResponse.json({ uploads });
  } catch (error) {
    console.error("Error fetching uploads:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch uploads" },
      { status: 500 }
    );
  }
}
