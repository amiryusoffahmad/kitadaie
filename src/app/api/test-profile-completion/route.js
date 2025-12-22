import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { calculateProfileCompletion } from '@/lib/profile-completion-calculator'

export async function GET(request) {
  try {
    // Get userId from query params or use first user
    const { searchParams } = new URL(request.url)
    let userId = searchParams.get('userId')

    if (!userId) {
      const user = await db('user').first()
      if (!user) {
        return NextResponse.json(
          { error: 'No users found in database' },
          { status: 404 }
        )
      }
      userId = user.id
    }

    // Fetch all profile data
    const user = await db('user').where('id', userId).first()
    const profile = await db('users_profile').where('id', userId).first()
    const personalInfo = await db('personal_information').where('user_id', userId).first()
    const highSchool = await db('high_school').where('user_id', userId).first()
    const education = await db('education').where('user_id', userId)
    const family = await db('family').where('user_id', userId)
    const role = await db('user_roles').where('user_id', userId).first()

    let spouseProfile = null
    if (profile && profile.spouse_id) {
      spouseProfile = await db('users_profile').where('id', profile.spouse_id).first()
    }

    // Prepare data object
    const data = {
      profile,
      personalInfo,
      highSchool,
      education,
      family,
      spouseProfile,
      role
    }

    // Calculate completion
    const result = calculateProfileCompletion(data)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      dataSummary: {
        hasProfile: !!profile,
        hasPersonalInfo: !!personalInfo,
        hasHighSchool: !!highSchool,
        educationCount: education.length,
        familyCount: family.length,
        hasSpouse: !!spouseProfile,
        hasRole: !!role
      },
      completion: result
    })
  } catch (error) {
    console.error('Profile completion test error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
