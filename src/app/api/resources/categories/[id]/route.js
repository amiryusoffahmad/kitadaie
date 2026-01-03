import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

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

// PATCH /api/resources/categories/[id] - Update a category (admin only)
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

        const { id } = await params
        const body = await request.json()
        const { name, description, color } = body

        const updateData = {}
        if (name) {
            updateData.name = name
            updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        }
        if (description !== undefined) updateData.description = description
        if (color) updateData.color = color

        await db('resource_categories')
            .where('id', id)
            .update(updateData)

        return NextResponse.json({
            success: true,
            message: 'Category updated successfully'
        })
    } catch (error) {
        console.error('Error updating category:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update category' },
            { status: 500 }
        )
    }
}

// DELETE /api/resources/categories/[id] - Delete a category (admin only)
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

        const { id } = await params

        // Check if any resources are using this category (with fallback for missing column)
        let resourceCount = { count: 0 };
        try {
            resourceCount = await db('resources')
                .where('category_id', id)
                .where('is_active', 1)
                .count('id as count')
                .first()
        } catch (dbError) {
            // If category_id column doesn't exist, we can safely delete the category
            if (dbError.code === 'ER_BAD_FIELD_ERROR') {
                console.log('[CATEGORIES API] category_id column does not exist yet, skipping usage check')
                resourceCount = { count: 0 };
            } else {
                throw dbError;
            }
        }

        if (resourceCount.count > 0) {
            return NextResponse.json(
                { success: false, error: `Cannot delete category. ${resourceCount.count} resources are using it.` },
                { status: 400 }
            )
        }

        await db('resource_categories')
            .where('id', id)
            .delete()

        return NextResponse.json({
            success: true,
            message: 'Category deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting category:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete category' },
            { status: 500 }
        )
    }
}
