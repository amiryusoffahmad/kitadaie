/**
 * Profile Completion Calculator
 * Calculates user profile completion percentage based on filled fields
 *
 * Weight Distribution:
 * - Personal Info: 30% (9 fields, profile picture excluded)
 * - Education: 25%
 * - Family: 20%
 * - Spouse: 15%
 * - Role: 10%
 *
 * Total: 100%
 */

/**
 * Calculate personal information completion (30%)
 * @param {Object} profile - users_profile record
 * @param {Object} personalInfo - personal_information record
 * @returns {Object} { score, missingFields }
 */
export function calculatePersonalInfo(profile, personalInfo) {
  const fields = [
    { key: 'first_name', value: profile?.first_name, weight: 3.4, label: 'First Name' },
    { key: 'gender', value: profile?.gender, weight: 3.4, label: 'Gender' },
    { key: 'ic_no', value: personalInfo?.ic_no, weight: 3.4, label: 'IC Number' },
    { key: 'phone', value: profile?.phone, weight: 3.3, label: 'Phone Number' },
    { key: 'address', value: profile?.address, weight: 3.3, label: 'Address' },
    { key: 'marital_status', value: profile?.marital_status, weight: 3.3, label: 'Marital Status' },
    { key: 'family_status', value: profile?.family_status, weight: 3.3, label: 'Family Status' },
    { key: 'income_classification', value: profile?.income_classification, weight: 3.3, label: 'Income Classification' },
    { key: 'branch', value: profile?.branch, weight: 3.3, label: 'Branch' }
  ];

  let score = 0;
  const missingFields = [];

  fields.forEach(field => {
    if (field.value) {
      score += field.weight;
    } else {
      missingFields.push({
        category: 'Personal Information',
        field: field.label,
        weight: field.weight
      });
    }
  });

  return { score, missingFields };
}

/**
 * Calculate education completion (25%)
 * @param {Object} highSchool - high_school record
 * @param {Array} education - education records array
 * @returns {Object} { score, missingFields }
 */
export function calculateEducation(highSchool, education) {
  const missingFields = [];
  let score = 0;

  // High School Check (12%)
  const hsRequired = [
    { key: 'school_name', value: highSchool?.school_name, label: 'High School Name' },
    { key: 'state', value: highSchool?.state, label: 'State' },
    { key: 'type', value: highSchool?.type, label: 'School Type' },
    { key: 'spm_year', value: highSchool?.spm_year, label: 'SPM Year' },
    { key: 'spm_result', value: highSchool?.spm_result, label: 'SPM Result' }
  ];

  const hsComplete = hsRequired.every(field => field.value);

  if (hsComplete) {
    score += 12;
  } else {
    if (!highSchool) {
      missingFields.push({
        category: 'Education',
        field: 'High School Record',
        weight: 12
      });
    } else {
      hsRequired.forEach(field => {
        if (!field.value) {
          missingFields.push({
            category: 'Education (High School)',
            field: field.label,
            weight: 2.4 // 12% / 5 fields
          });
        }
      });
    }
  }

  // University Check (13%)
  if (education && education.length > 0) {
    const uni = education[0]; // Check first/latest record
    const uniRequired = [
      { key: 'university', value: uni.university, label: 'University Name' },
      { key: 'field_of_study', value: uni.field_of_study, label: 'Field of Study' },
      { key: 'degree', value: uni.degree, label: 'Degree' },
      { key: 'start_year', value: uni.start_year, label: 'Start Year' },
      { key: 'end_year', value: uni.end_year || uni.is_current, label: 'End Year or Current Status' }
    ];

    const uniComplete = uniRequired.every(field => field.value);

    if (uniComplete) {
      score += 13;
    } else {
      uniRequired.forEach(field => {
        if (!field.value) {
          missingFields.push({
            category: 'Education (University)',
            field: field.label,
            weight: 2.6 // 13% / 5 fields
          });
        }
      });
    }
  } else {
    missingFields.push({
      category: 'Education',
      field: 'University/College Record',
      weight: 13
    });
  }

  return { score, missingFields };
}

/**
 * Calculate family information completion (20%)
 * @param {Array} family - family records array
 * @returns {Object} { score, missingFields }
 */
export function calculateFamily(family) {
  const missingFields = [];
  let score = 0;

  if (!family || family.length === 0) {
    missingFields.push({
      category: 'Family',
      field: 'Father Record',
      weight: 10
    });
    missingFields.push({
      category: 'Family',
      field: 'Mother Record',
      weight: 10
    });
    return { score: 0, missingFields };
  }

  // Check for Father (10%)
  const father = family.find(f => {
    const rel = f.relationship?.toLowerCase() || '';
    return rel === 'father' || rel === 'ayah' || rel === 'bapa';
  });

  if (father && father.full_name && father.occupation) {
    score += 10;
  } else {
    if (!father) {
      missingFields.push({
        category: 'Family',
        field: 'Father Record',
        weight: 10
      });
    } else {
      if (!father.full_name) {
        missingFields.push({
          category: 'Family (Father)',
          field: 'Full Name',
          weight: 5
        });
      }
      if (!father.occupation) {
        missingFields.push({
          category: 'Family (Father)',
          field: 'Occupation',
          weight: 5
        });
      }
    }
  }

  // Check for Mother (10%)
  const mother = family.find(f => {
    const rel = f.relationship?.toLowerCase() || '';
    return rel === 'mother' || rel === 'ibu' || rel === 'mak';
  });

  if (mother && mother.full_name && mother.occupation) {
    score += 10;
  } else {
    if (!mother) {
      missingFields.push({
        category: 'Family',
        field: 'Mother Record',
        weight: 10
      });
    } else {
      if (!mother.full_name) {
        missingFields.push({
          category: 'Family (Mother)',
          field: 'Full Name',
          weight: 5
        });
      }
      if (!mother.occupation) {
        missingFields.push({
          category: 'Family (Mother)',
          field: 'Occupation',
          weight: 5
        });
      }
    }
  }

  return { score, missingFields };
}

/**
 * Calculate spouse linking completion (15%)
 * @param {Object} profile - Current user's profile
 * @param {Object} spouseProfile - Spouse's profile (if linked)
 * @returns {Object} { score, missingFields }
 */
export function calculateSpouse(profile, spouseProfile) {
  const missingFields = [];
  const maritalStatus = profile?.marital_status?.toLowerCase() || '';

  // If single, auto-complete
  if (maritalStatus === 'single' || maritalStatus === 'bujang') {
    return { score: 15, missingFields: [] };
  }

  // If married, check spouse_id
  if (maritalStatus === 'married' || maritalStatus === 'berkahwin') {
    if (!profile?.spouse_id) {
      missingFields.push({
        category: 'Spouse',
        field: 'Spouse Linking',
        weight: 15
      });
      return { score: 0, missingFields };
    }

    let score = 10; // Has spouse_id

    // Verify mutual linking and opposite gender
    if (spouseProfile) {
      const mutualLink = spouseProfile.spouse_id === profile.id;
      const oppositeGender = spouseProfile.gender !== profile.gender;

      if (mutualLink && oppositeGender) {
        score += 5; // Mutual linking verified
      } else {
        if (!mutualLink) {
          missingFields.push({
            category: 'Spouse',
            field: 'Mutual Linking (spouse must link back)',
            weight: 3
          });
        }
        if (!oppositeGender) {
          missingFields.push({
            category: 'Spouse',
            field: 'Opposite Gender Validation',
            weight: 2
          });
        }
      }
    } else {
      // Spouse profile not found
      missingFields.push({
        category: 'Spouse',
        field: 'Valid Spouse Profile',
        weight: 5
      });
    }

    return { score, missingFields };
  }

  // Unknown marital status
  missingFields.push({
    category: 'Spouse',
    field: 'Marital Status Clarification',
    weight: 15
  });

  return { score: 0, missingFields };
}

/**
 * Calculate role and murobbi completion (10%)
 * @param {Object} role - user_roles record
 * @param {Object} profile - users_profile record
 * @returns {Object} { score, missingFields }
 */
export function calculateRole(role, profile) {
  const missingFields = [];
  let score = 0;

  // Check role (5%)
  if (role && role.role) {
    score += 5;
  } else {
    missingFields.push({
      category: 'Role',
      field: 'User Role Assignment',
      weight: 5
    });
  }

  // Check murobbi (5%) - not required for admin
  const isAdmin = role?.role === 'admin';

  if (isAdmin || profile?.murobbi_id) {
    score += 5;
  } else {
    missingFields.push({
      category: 'Role',
      field: 'Murobbi Assignment',
      weight: 5
    });
  }

  return { score, missingFields };
}

/**
 * Calculate overall profile completion
 * @param {Object} data - All user profile data
 * @returns {Object} { percentage, score, missingFields, breakdown }
 */
export function calculateProfileCompletion(data) {
  const {
    profile,
    personalInfo,
    highSchool,
    education,
    family,
    spouseProfile,
    role
  } = data;

  // Calculate each category
  const personalResult = calculatePersonalInfo(profile, personalInfo);
  const educationResult = calculateEducation(highSchool, education);
  const familyResult = calculateFamily(family);
  const spouseResult = calculateSpouse(profile, spouseProfile);
  const roleResult = calculateRole(role, profile);

  // Sum up scores
  const totalScore =
    personalResult.score +
    educationResult.score +
    familyResult.score +
    spouseResult.score +
    roleResult.score;

  // Combine missing fields
  const missingFields = [
    ...personalResult.missingFields,
    ...educationResult.missingFields,
    ...familyResult.missingFields,
    ...spouseResult.missingFields,
    ...roleResult.missingFields
  ];

  // Calculate percentage
  const percentage = Math.round(totalScore);

  return {
    percentage,
    score: totalScore,
    missingFields,
    breakdown: {
      personal: {
        score: personalResult.score,
        maxScore: 30,
        percentage: Math.round((personalResult.score / 30) * 100),
        missing: personalResult.missingFields
      },
      education: {
        score: educationResult.score,
        maxScore: 25,
        percentage: Math.round((educationResult.score / 25) * 100),
        missing: educationResult.missingFields
      },
      family: {
        score: familyResult.score,
        maxScore: 20,
        percentage: Math.round((familyResult.score / 20) * 100),
        missing: familyResult.missingFields
      },
      spouse: {
        score: spouseResult.score,
        maxScore: 15,
        percentage: Math.round((spouseResult.score / 15) * 100),
        missing: spouseResult.missingFields
      },
      role: {
        score: roleResult.score,
        maxScore: 10,
        percentage: Math.round((roleResult.score / 10) * 100),
        missing: roleResult.missingFields
      }
    }
  };
}

/**
 * Get profile completion status label
 * @param {number} percentage - Completion percentage
 * @returns {Object} { label, color, priority }
 */
export function getCompletionStatus(percentage) {
  if (percentage === 100) {
    return { label: 'Complete', color: 'green', priority: 5 };
  } else if (percentage >= 76) {
    return { label: 'Almost Complete', color: 'blue', priority: 4 };
  } else if (percentage >= 51) {
    return { label: 'Medium', color: 'yellow', priority: 3 };
  } else if (percentage >= 26) {
    return { label: 'Low', color: 'orange', priority: 2 };
  } else {
    return { label: 'Critical', color: 'red', priority: 1 };
  }
}
