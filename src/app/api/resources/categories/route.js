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

// GET /api/resources/categories - List all categories
export async function GET() {
    try {
        const categories = await db('resource_categories')
            .select('*')
            .orderBy('name', 'asc')

        return NextResponse.json({
            success: true,
            data: categories
        })
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch categories' },
            { status: 500 }
        )
    }
}

// POST /api/resources/categories - Create a new category (admin only)
export async function POST(request) {
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

        const body = await request.json()
        const { name, description, color } = body

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Category name is required' },
                { status: 400 }
            )
        }

        // Generate slug from name
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

        // Check if slug already exists
        const existing = await db('resource_categories')
            .where('slug', slug)
            .first()

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'A category with this name already exists' },
                { status: 400 }
            )
        }

        const [categoryId] = await db('resource_categories').insert({
            name,
            slug,
            description: description || null,
            color: color || '#3b82f6',
            created_by: session.user.id
        })

        return NextResponse.json({
            success: true,
            data: {
                id: categoryId,
                name,
                slug,
                message: 'Category created successfully'
            }
        })
    } catch (error) {
        console.error('Error creating category:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create category' },
            { status: 500 }
        )
    }
}
