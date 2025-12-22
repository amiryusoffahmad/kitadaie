'use server'

import { db } from '@/lib/db'
import { calculateProfileCompletion } from '@/lib/profile-completion-calculator'

/**
 * Fetch all profile data for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} All profile data
 */
export async function getUserProfileData(userId) {
  try {
    // Fetch users_profile
    const profile = await db('users_profile')
      .where('id', userId)
      .first();

    // Fetch personal_information
    const personalInfo = await db('personal_information')
      .where('user_id', userId)
      .first();

    // Fetch high_school
    const highSchool = await db('high_school')
      .where('user_id', userId)
      .first();

    // Fetch education records
    const education = await db('education')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .select('*');

    // Fetch family records
    const family = await db('family')
      .where('user_id', userId)
      .select('*');

    // Fetch spouse profile if linked
    let spouseProfile = null;
    if (profile && profile.spouse_id) {
      spouseProfile = await db('users_profile')
        .where('id', profile.spouse_id)
        .first();
    }

    // Fetch user role
    const role = await db('user_roles')
      .where('user_id', userId)
      .first();

    return {
      profile,
      personalInfo,
      highSchool,
      education,
      family,
      spouseProfile,
      role
    };
  } catch (error) {
    console.error('Error fetching user profile data:', error);
    throw new Error('Failed to fetch profile data');
  }
}

/**
 * Calculate profile completion for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Profile completion result
 */
export async function getProfileCompletion(userId) {
  try {
    const data = await getUserProfileData(userId);
    const completion = calculateProfileCompletion(data);

    // Also fetch user basic info for context
    const user = await db('user')
      .where('id', userId)
      .select('id', 'name', 'email', 'username')
      .first();

    return {
      ...completion,
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        username: user?.username,
        firstName: data.profile?.first_name,
        gender: data.profile?.gender,
        branch: data.profile?.branch
      }
    };
  } catch (error) {
    console.error('Error calculating profile completion:', error);
    throw new Error('Failed to calculate profile completion');
  }
}

/**
 * Get profile completion for all users (Admin only)
 * @returns {Promise<Array>} Array of user completion data
 */
export async function getAllUsersProfileCompletion() {
  try {
    // Get all users
    const users = await db('user')
      .select('id', 'name', 'email', 'username', 'createdAt')
      .orderBy('createdAt', 'desc');

    // Calculate completion for each user
    const completionData = await Promise.all(
      users.map(async (user) => {
        try {
          const completion = await getProfileCompletion(user.id);
          return {
            userId: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            firstName: completion.user.firstName,
            gender: completion.user.gender,
            branch: completion.user.branch,
            percentage: completion.percentage,
            score: completion.score,
            missingFieldsCount: completion.missingFields.length,
            missingFields: completion.missingFields,
            breakdown: completion.breakdown,
            createdAt: user.createdAt
          };
        } catch (error) {
          console.error(`Error calculating completion for user ${user.id}:`, error);
          return {
            userId: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            firstName: null,
            gender: null,
            branch: null,
            percentage: 0,
            score: 0,
            missingFieldsCount: 0,
            missingFields: [],
            breakdown: null,
            error: 'Calculation failed',
            createdAt: user.createdAt
          };
        }
      })
    );

    return completionData;
  } catch (error) {
    console.error('Error getting all users profile completion:', error);
    throw new Error('Failed to get all users profile completion');
  }
}

/**
 * Get profile completion statistics
 * @returns {Promise<Object>} Statistics object
 */
export async function getProfileCompletionStats() {
  try {
    const allUsers = await getAllUsersProfileCompletion();

    const totalUsers = allUsers.length;
    const completeProfiles = allUsers.filter(u => u.percentage === 100).length;
    const incompleteProfiles = totalUsers - completeProfiles;

    const averageCompletion = totalUsers > 0
      ? Math.round(allUsers.reduce((sum, u) => sum + u.percentage, 0) / totalUsers)
      : 0;

    const criticalProfiles = allUsers.filter(u => u.percentage < 26).length;
    const lowProfiles = allUsers.filter(u => u.percentage >= 26 && u.percentage < 51).length;
    const mediumProfiles = allUsers.filter(u => u.percentage >= 51 && u.percentage < 76).length;
    const almostCompleteProfiles = allUsers.filter(u => u.percentage >= 76 && u.percentage < 100).length;

    return {
      totalUsers,
      completeProfiles,
      incompleteProfiles,
      averageCompletion,
      distribution: {
        critical: criticalProfiles,      // 0-25%
        low: lowProfiles,                // 26-50%
        medium: mediumProfiles,          // 51-75%
        almostComplete: almostCompleteProfiles, // 76-99%
        complete: completeProfiles       // 100%
      }
    };
  } catch (error) {
    console.error('Error getting profile completion stats:', error);
    throw new Error('Failed to get profile completion statistics');
  }
}

/**
 * Update cached profile completion percentage
 * (Optional: for performance optimization)
 * @param {string} userId - User ID
 * @param {number} percentage - Completion percentage
 */
export async function updateProfileCompletionCache(userId, percentage) {
  try {
    // Check if profile exists
    const profile = await db('users_profile')
      .where('id', userId)
      .first();

    if (profile) {
      // Update if column exists (need to run migration first)
      await db('users_profile')
        .where('id', userId)
        .update({
          // profile_completion_percentage: percentage,
          // profile_last_updated_at: db.fn.now()
          updated_at: db.fn.now()
        });
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating profile completion cache:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get users with incomplete profiles
 * @param {number} threshold - Completion percentage threshold (default: 100)
 * @returns {Promise<Array>} Array of users with incomplete profiles
 */
export async function getIncompleteProfiles(threshold = 100) {
  try {
    const allUsers = await getAllUsersProfileCompletion();

    return allUsers
      .filter(user => user.percentage < threshold)
      .sort((a, b) => a.percentage - b.percentage); // Sort by lowest completion first
  } catch (error) {
    console.error('Error getting incomplete profiles:', error);
    throw new Error('Failed to get incomplete profiles');
  }
}

/**
 * Get users by completion range
 * @param {number} min - Minimum percentage
 * @param {number} max - Maximum percentage
 * @returns {Promise<Array>} Array of users in the range
 */
export async function getUsersByCompletionRange(min, max) {
  try {
    const allUsers = await getAllUsersProfileCompletion();

    return allUsers
      .filter(user => user.percentage >= min && user.percentage <= max)
      .sort((a, b) => b.percentage - a.percentage);
  } catch (error) {
    console.error('Error getting users by completion range:', error);
    throw new Error('Failed to get users by completion range');
  }
}

/**
 * Export profile completion data to CSV format
 * @returns {Promise<string>} CSV string
 */
export async function exportProfileCompletionToCSV() {
  try {
    const allUsers = await getAllUsersProfileCompletion();

    // CSV Headers
    const headers = [
      'Username',
      'Name',
      'First Name',
      'Email',
      'Gender',
      'Branch',
      'Completion %',
      'Missing Fields Count',
      'Personal Info %',
      'Education %',
      'Family %',
      'Spouse %',
      'Role %',
      'Created At'
    ];

    // CSV Rows
    const rows = allUsers.map(user => [
      user.username || '',
      user.name || '',
      user.firstName || '',
      user.email || '',
      user.gender || '',
      user.branch || '',
      user.percentage,
      user.missingFieldsCount,
      user.breakdown?.personal?.percentage || 0,
      user.breakdown?.education?.percentage || 0,
      user.breakdown?.family?.percentage || 0,
      user.breakdown?.spouse?.percentage || 0,
      user.breakdown?.role?.percentage || 0,
      user.createdAt ? new Date(user.createdAt).toISOString() : ''
    ]);

    // Combine headers and rows
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell =>
        // Escape commas and quotes in cells
        typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))
          ? `"${cell.replace(/"/g, '""')}"`
          : cell
      ).join(','))
    ].join('\n');

    return csv;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export profile completion data');
  }
}
