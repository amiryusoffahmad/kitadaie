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

    // Format resources - keep file_path as relative path (client will construct full URL)
    const formattedResources = resources.map((resource) => {
      return {
        ...resource,
        file_path: resource.file_path || (resource.file_id ? `/uploads/${resource.file_id}` : null),
        tags: resource.tags
          ? resource.tags.split(",").map((tag) => tag.trim())
          : [],
      };
    });

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

    // Check if this is a direct file upload (old FormData method) or metadata (new JSON method)
    const contentType = request.headers.get("content-type") || "";

    let title, categoryId, tags, description, fileId, filePath;

    if (contentType.includes("multipart/form-data")) {
      // Legacy: FormData upload (file included in request)
      // This may hit size limits, so we discourage this method
      const formData = await request.formData();
      const file = formData.get("file");
      title = formData.get("title");
      categoryId = formData.get("category_id");
      tags = formData.get("tags");
      description = formData.get("description");

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
      filePath = uploadResult.filePath || uploadResult.path || '';

      // Normalize the path format to ensure consistency (match assignment pattern)
      if (!filePath.startsWith('/uploads/') && filePath.includes('/uploads/')) {
        const parts = filePath.split('/uploads/');
        filePath = '/uploads/' + parts[parts.length - 1];
      } else if (filePath.startsWith('uploads/')) {
        filePath = '/' + filePath;
      }

      console.log("[RESOURCES API] Normalized file path:", filePath);

      // Get fileId from response (used as fallback if file_path column doesn't exist)
      fileId = uploadResult.fileId || uploadResult.filename || filePath.split('/').pop();

      console.log("[RESOURCES API] File uploaded successfully, path:", filePath, "fileId:", fileId);
    } else {
      // New method: JSON metadata only (file already uploaded directly)
      const body = await request.json();
      title = body.title;
      categoryId = body.category_id;
      tags = body.tags;
      description = body.description;
      fileId = body.file_id;
      filePath = body.file_path;

      if (!title || !fileId || !filePath) {
        return NextResponse.json(
          { success: false, error: "Title, file_id, and file_path are required" },
          { status: 400 }
        );
      }

      console.log("[RESOURCES API] Creating resource with pre-uploaded file:", filePath, "fileId:", fileId);
    }

    // Create resource record with file_id and file_path
    let resourceId;
    try {
      [resourceId] = await db("resources").insert({
        title,
        file_id: fileId,
        file_path: filePath, // Store the path from upload server
        category_id: categoryId || null,
        tags: tags || null,
        description: description || null,
        created_by: session.user.id,
        is_active: 1,
      });
      console.log("[RESOURCES API] Resource created with ID:", resourceId);
    } catch (dbError) {
      console.error("[RESOURCES API] Database insert error:", dbError);

      // If file_path column doesn't exist yet, try without it
      if (dbError.code === 'ER_BAD_FIELD_ERROR') {
        console.log("[RESOURCES API] file_path column doesn't exist, inserting without it");
        [resourceId] = await db("resources").insert({
          title,
          file_id: fileId,
          category_id: categoryId || null,
          tags: tags || null,
          description: description || null,
          created_by: session.user.id,
          is_active: 1,
        });
        console.log("[RESOURCES API] Resource created without file_path, ID:", resourceId);
      } else {
        throw dbError;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: resourceId,
        title,
        file_id: fileId,
        file_path: filePath,
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
