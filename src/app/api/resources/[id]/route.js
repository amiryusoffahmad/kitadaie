import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { UploadService } from '@/lib/services/upload-service'

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

// GET /api/resources/[id] - Get a specific resource
export async function GET(request, { params }) {
    try {
        const { id } = params

        const resource = await db('resources')
            .select(
                'resources.*',
                'resource_categories.name as category_name',
                'resource_categories.slug as category_slug',
                'resource_categories.color as category_color',
                'uploads.filename',
                'uploads.original_filename as file_name',
                'uploads.path as file_path',
                'uploads.size as file_size',
                'uploads.mimetype'
            )
            .leftJoin('resource_categories', 'resources.category_id', 'resource_categories.id')
            .leftJoin('uploads', 'resources.upload_id', 'uploads.id')
            .where('resources.id', id)
            .where('resources.is_active', 1)
            .first()

        if (!resource) {
            return NextResponse.json(
                { success: false, error: 'Resource not found' },
                { status: 404 }
            )
        }

        // Parse tags
        const formattedResource = {
            ...resource,
            tags: resource.tags ? resource.tags.split(',').map(tag => tag.trim()) : []
        }

        return NextResponse.json({
            success: true,
            data: formattedResource
        })
    } catch (error) {
        console.error('Error fetching resource:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch resource' },
            { status: 500 }
        )
    }
}

// DELETE /api/resources/[id] - Delete a resource (admin only)
export async function DELETE(request, { params }) {
    try {
        const session = await auth.api.getSession({ headers: await headers() })

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check if user is admin
        const admin = await isAdmin(session.user.id);
        if (!admin) {
            return NextResponse.json(
                { success: false, error: 'Permission denied. Admin access required.' },
                { status: 403 }
            )
        }

        const { id } = params

        // Get resource to get upload_id
        const resource = await db('resources')
            .where('id', id)
            .first()

        if (!resource) {
            return NextResponse.json(
                { success: false, error: 'Resource not found' },
                { status: 404 }
            )
        }

        // Delete the file using UploadService (deletes both file and upload record)
        await UploadService.deleteFile(resource.upload_id)

        // Delete resource record (upload will cascade delete due to FK)
        await db('resources')
            .where('id', id)
            .delete()

        return NextResponse.json({
            success: true,
            message: 'Resource deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting resource:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete resource' },
            { status: 500 }
        )
    }
}

// PATCH /api/resources/[id] - Update a resource (admin only)
export async function PATCH(request, { params }) {
    try {
        const session = await auth.api.getSession({ headers: await headers() })

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check if user is admin
        const admin = await isAdmin(session.user.id);
        if (!admin) {
            return NextResponse.json(
                { success: false, error: 'Permission denied. Admin access required.' },
                { status: 403 }
            )
        }

        const { id } = params
        const body = await request.json()
        const { title, category_id, tags, description } = body

        const updateData = {}
        if (title) updateData.title = title
        if (category_id !== undefined) updateData.category_id = category_id
        if (tags !== undefined) updateData.tags = tags
        if (description !== undefined) updateData.description = description

        await db('resources')
            .where('id', id)
            .update(updateData)

        return NextResponse.json({
            success: true,
            message: 'Resource updated successfully'
        })
    } catch (error) {
        console.error('Error updating resource:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update resource' },
            { status: 500 }
        )
    }
}
