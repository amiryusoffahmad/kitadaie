import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'

/**
 * Search for married users to link as spouse
 * GET /api/users/search-spouse?q=search_term
 */
export async function GET(request) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get search query
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    // Search for married users whose name matches the query
    const users = await db('user')
      .join('users_profile', 'user.id', '=', 'users_profile.id')
      .where('users_profile.marital_status', 'married')
      .where('user.id', '!=', session.user.id) // Exclude current user
      .where(function() {
        this.where('user.name', 'like', `%${query}%`)
          .orWhere('users_profile.first_name', 'like', `%${query}%`)
      })
      .select(
        'user.id',
        'user.name',
        'users_profile.first_name',
        'users_profile.phone',
        'users_profile.email'
      )
      .limit(10)

    // Format results
    const results = users.map(user => ({
      id: user.id,
      name: user.first_name || user.name,
      fullName: user.name,
      phone: user.phone,
      email: user.email
    }))

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching spouse:', error)
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    )
  }
}
