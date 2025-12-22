'use server'

import { db } from '@/lib/db'

/**
 * Get available spouse candidates for a user
 * Only returns opposite gender users who are married and not already linked
 * @param {string} userId - Current user ID
 * @returns {Promise<Array>} List of eligible spouse candidates
 */
export async function getSpouseCandidates(userId) {
  try {
    // Get current user's profile
    const currentUser = await db('users_profile')
      .where('id', userId)
      .select('id', 'gender', 'marital_status', 'spouse_id')
      .first()

    if (!currentUser) {
      throw new Error('User profile not found')
    }

    // Check if user is married
    const isMarried =
      currentUser.marital_status?.toLowerCase() === 'married' ||
      currentUser.marital_status?.toLowerCase() === 'berkahwin'

    if (!isMarried) {
      return []
    }

    // Determine opposite gender
    const oppositeGender = currentUser.gender?.toLowerCase() === 'male' ? 'female' : 'male'

    // Get all opposite gender users who are married and not linked
    const candidates = await db('user')
      .join('users_profile', 'user.id', 'users_profile.id')
      .where('users_profile.gender', oppositeGender)
      .whereIn('users_profile.marital_status', ['married', 'Married', 'berkahwin', 'Berkahwin'])
      .where(function() {
        this.whereNull('users_profile.spouse_id')
          .orWhere('users_profile.spouse_id', userId) // Include if already linked to current user
      })
      .whereNot('user.id', userId) // Exclude current user
      .select(
        'user.id',
        'user.name',
        'user.email',
        'user.username',
        'users_profile.first_name',
        'users_profile.gender',
        'users_profile.branch',
        'users_profile.spouse_id'
      )
      .orderBy('users_profile.first_name', 'asc')

    return candidates
  } catch (error) {
    console.error('Error getting spouse candidates:', error)
    throw new Error('Failed to get spouse candidates')
  }
}

/**
 * Link two users as spouses (mutual linking)
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID (spouse)
 * @returns {Promise<Object>} Result with success status
 */
export async function linkSpouses(userId1, userId2) {
  try {
    // Validate inputs
    if (!userId1 || !userId2) {
      throw new Error('Both user IDs are required')
    }

    if (userId1 === userId2) {
      throw new Error('Cannot link user to themselves')
    }

    // Get both users' profiles
    const [user1, user2] = await Promise.all([
      db('users_profile')
        .where('id', userId1)
        .select('id', 'gender', 'marital_status', 'spouse_id', 'first_name')
        .first(),
      db('users_profile')
        .where('id', userId2)
        .select('id', 'gender', 'marital_status', 'spouse_id', 'first_name')
        .first()
    ])

    if (!user1 || !user2) {
      throw new Error('One or both users not found')
    }

    // Validate both are married
    const user1Married = ['married', 'berkahwin'].includes(user1.marital_status?.toLowerCase())
    const user2Married = ['married', 'berkahwin'].includes(user2.marital_status?.toLowerCase())

    if (!user1Married || !user2Married) {
      throw new Error('Both users must have marital status set to "Married"')
    }

    // Validate opposite gender
    if (user1.gender?.toLowerCase() === user2.gender?.toLowerCase()) {
      throw new Error('Cannot link users of the same gender')
    }

    // Check if either is already linked to someone else
    if (user1.spouse_id && user1.spouse_id !== userId2) {
      throw new Error(`${user1.first_name} is already linked to another spouse`)
    }

    if (user2.spouse_id && user2.spouse_id !== userId1) {
      throw new Error(`${user2.first_name} is already linked to another spouse`)
    }

    // Perform mutual linking
    await Promise.all([
      db('users_profile')
        .where('id', userId1)
        .update({ spouse_id: userId2, updated_at: db.fn.now() }),
      db('users_profile')
        .where('id', userId2)
        .update({ spouse_id: userId1, updated_at: db.fn.now() })
    ])

    return {
      success: true,
      message: 'Spouses linked successfully',
      user1: { id: user1.id, name: user1.first_name },
      user2: { id: user2.id, name: user2.first_name }
    }
  } catch (error) {
    console.error('Error linking spouses:', error)
    return {
      success: false,
      message: error.message || 'Failed to link spouses'
    }
  }
}

/**
 * Unlink spouses (remove mutual link)
 * @param {string} userId - User ID to unlink
 * @returns {Promise<Object>} Result with success status
 */
export async function unlinkSpouse(userId) {
  try {
    // Get user's profile
    const user = await db('users_profile')
      .where('id', userId)
      .select('id', 'spouse_id', 'first_name')
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    if (!user.spouse_id) {
      throw new Error('User is not linked to any spouse')
    }

    const spouseId = user.spouse_id

    // Remove mutual linking
    await Promise.all([
      db('users_profile')
        .where('id', userId)
        .update({ spouse_id: null, updated_at: db.fn.now() }),
      db('users_profile')
        .where('id', spouseId)
        .update({ spouse_id: null, updated_at: db.fn.now() })
    ])

    return {
      success: true,
      message: 'Spouse unlinked successfully'
    }
  } catch (error) {
    console.error('Error unlinking spouse:', error)
    return {
      success: false,
      message: error.message || 'Failed to unlink spouse'
    }
  }
}

/**
 * Get spouse information for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Spouse information or null
 */
export async function getSpouseInfo(userId) {
  try {
    const user = await db('users_profile')
      .where('id', userId)
      .select('spouse_id')
      .first()

    if (!user || !user.spouse_id) {
      return null
    }

    const spouse = await db('user')
      .join('users_profile', 'user.id', 'users_profile.id')
      .where('user.id', user.spouse_id)
      .select(
        'user.id',
        'user.name',
        'user.email',
        'user.username',
        'users_profile.first_name',
        'users_profile.gender',
        'users_profile.branch',
        'users_profile.phone'
      )
      .first()

    return spouse || null
  } catch (error) {
    console.error('Error getting spouse info:', error)
    return null
  }
}

/**
 * Verify mutual spouse linking
 * @param {string} userId - User ID to verify
 * @returns {Promise<Object>} Verification result
 */
export async function verifySpouseLinking(userId) {
  try {
    const user = await db('users_profile')
      .where('id', userId)
      .select('id', 'spouse_id', 'first_name', 'gender')
      .first()

    if (!user) {
      return {
        isValid: false,
        message: 'User not found'
      }
    }

    if (!user.spouse_id) {
      return {
        isValid: true,
        message: 'No spouse linked',
        hasSpouse: false
      }
    }

    const spouse = await db('users_profile')
      .where('id', user.spouse_id)
      .select('id', 'spouse_id', 'first_name', 'gender')
      .first()

    if (!spouse) {
      return {
        isValid: false,
        message: 'Linked spouse not found in database',
        hasSpouse: true,
        issue: 'broken_link'
      }
    }

    // Check mutual linking
    if (spouse.spouse_id !== userId) {
      return {
        isValid: false,
        message: `Link is not mutual. ${spouse.first_name} is not linked back to ${user.first_name}`,
        hasSpouse: true,
        issue: 'not_mutual'
      }
    }

    // Check opposite gender
    if (user.gender?.toLowerCase() === spouse.gender?.toLowerCase()) {
      return {
        isValid: false,
        message: 'Linked spouses have the same gender',
        hasSpouse: true,
        issue: 'same_gender'
      }
    }

    return {
      isValid: true,
      message: 'Spouse linking is valid',
      hasSpouse: true,
      spouse: {
        id: spouse.id,
        name: spouse.first_name,
        gender: spouse.gender
      }
    }
  } catch (error) {
    console.error('Error verifying spouse linking:', error)
    return {
      isValid: false,
      message: 'Verification failed',
      error: error.message
    }
  }
}
