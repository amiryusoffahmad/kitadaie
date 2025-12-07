import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
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

// GET /api/resources - List all active resources with optional category filter
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category");

    let query = db("resources")
      .select(
        "resources.*",
        "resource_categories.name as category_name",
        "resource_categories.slug as category_slug",
        "resource_categories.color as category_color",
        "uploads.filename",
        "uploads.original_filename as file_name",
        "uploads.path as file_path",
        "uploads.size as file_size",
        "uploads.mimetype"
      )
      .leftJoin(
        "resource_categories",
        "resources.category_id",
        "resource_categories.id"
      )
      .leftJoin("uploads", "resources.upload_id", "uploads.id")
      .where("resources.is_active", 1)
      .orderBy("resources.created_at", "desc");

    if (categoryId && categoryId !== "all") {
      query = query.where("resources.category_id", categoryId);
    }

    const resources = await query;

    // Parse tags from string to array
    const formattedResources = resources.map((resource) => ({
      ...resource,
      tags: resource.tags
        ? resource.tags.split(",").map((tag) => tag.trim())
        : [],
    }));

    return NextResponse.json({
      success: true,
      data: formattedResources,
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

// POST /api/resources - Upload a new resource (admin only)
export async function POST(request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const admin = await isAdmin(session.user.id);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Permission denied. Admin access required." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const title = formData.get("title");
    const categoryId = formData.get("category_id");
    const tags = formData.get("tags"); // Comma-separated string
    const description = formData.get("description");

    if (!file || !title) {
      return NextResponse.json(
        { success: false, error: "File and title are required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Only PDF files are allowed" },
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

    // Use UploadService to save file and create upload record
    const uploadMetadata = {
      user_id: session.user.id,
      document_type: "resource",
    };

    const upload = await UploadService.saveFile(fileData, uploadMetadata);

    // Create resource record
    const [resourceId] = await db("resources").insert({
      title,
      upload_id: upload.id,
      category_id: categoryId || null,
      tags: tags || null,
      description: description || null,
      created_by: session.user.id,
      is_active: 1,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: resourceId,
        title,
        file_path: upload.path,
        message: "Resource uploaded successfully",
      },
    });
  } catch (error) {
    console.error("Error uploading resource:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload resource" },
      { status: 500 }
    );
  }
}
