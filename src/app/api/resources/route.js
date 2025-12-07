import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import config from "@/lib/config";

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
        "resource_categories.color as category_color"
      )
      .leftJoin(
        "resource_categories",
        "resources.category_id",
        "resource_categories.id"
      )
      .where("resources.is_active", 1)
      .orderBy("resources.created_at", "desc");

    if (categoryId && categoryId !== "all") {
      query = query.where("resources.category_id", categoryId);
    }

    const resources = await query;

    // Fetch file information for each resource
    const resourcesWithFiles = await Promise.all(
      resources.map(async (resource) => {
        let fileInfo = null;
        if (resource.file_id) {
          try {
            const uploadRecord = await db("uploads")
              .where("id", resource.file_id)
              .first();

            if (uploadRecord) {
              fileInfo = {
                file_name: uploadRecord.original_filename,
                file_path: `${config.uploadApiUrl}${uploadRecord.path}`,
                file_size: uploadRecord.size,
                mimetype: uploadRecord.mimetype,
              };
            }
          } catch (error) {
            console.error(`Error fetching file info for resource ${resource.id}:`, error);
          }
        }

        return {
          ...resource,
          ...fileInfo,
          tags: resource.tags
            ? resource.tags.split(",").map((tag) => tag.trim())
            : [],
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: resourcesWithFiles,
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

    // Upload file to external upload server
    const uploadUrl = `${config.uploadApiUrl}/upload`;
    console.log("[RESOURCES API] Uploading file to:", uploadUrl);

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("type", "resource");

    let uploadResponse;
    try {
      uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: uploadFormData,
      });
    } catch (networkError) {
      console.error("[RESOURCES API] Network error during file upload:", networkError);
      return NextResponse.json(
        { success: false, error: `Upload server not available. Please check that the upload server at ${uploadUrl} is running.` },
        { status: 503 }
      );
    }

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("[RESOURCES API] Upload response error:", errorText);
      return NextResponse.json(
        { success: false, error: `Failed to upload file: ${errorText}` },
        { status: 500 }
      );
    }

    let uploadResult;
    try {
      uploadResult = await uploadResponse.json();
    } catch (parseError) {
      console.error("[RESOURCES API] Error parsing upload response:", parseError);
      return NextResponse.json(
        { success: false, error: "Failed to parse upload response. The server may not be configured correctly." },
        { status: 500 }
      );
    }

    console.log("[RESOURCES API] Upload response data:", uploadResult);

    // Get the file path from the response
    let filePath = uploadResult.filePath || uploadResult.path || '';

    // Normalize the path format to ensure consistency
    if (!filePath.startsWith('/uploads/') && filePath.includes('/uploads/')) {
      const parts = filePath.split('/uploads/');
      filePath = '/uploads/' + parts[parts.length - 1];
    } else if (filePath.startsWith('uploads/')) {
      filePath = '/' + filePath;
    }

    console.log("[RESOURCES API] Normalized file path:", filePath);

    // Get fileId from response (could be fileId, filename, or extracted from path)
    const fileId = uploadResult.fileId || uploadResult.filename || filePath.split('/').pop();

    if (!fileId) {
      console.error("[RESOURCES API] Invalid upload result:", uploadResult);
      return NextResponse.json(
        { success: false, error: "Invalid response from upload server. File ID is missing." },
        { status: 500 }
      );
    }

    console.log("[RESOURCES API] File uploaded successfully, ID:", fileId);

    // Create resource record with file_id
    const [resourceId] = await db("resources").insert({
      title,
      file_id: fileId,
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
        file_id: fileId,
        message: "Resource uploaded successfully",
      },
    });
  } catch (error) {
    console.error("[RESOURCES API] Error uploading resource:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload resource" },
      { status: 500 }
    );
  }
}
