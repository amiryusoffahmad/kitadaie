# Profile Completion System - Database Analysis & Implementation Plan

## STEP 1: Current Database Structure Analysis

### Core Tables Identified

#### 1. **user** (Better Auth managed)
- `id` (PK, varchar 36)
- `name` (text) - Full name from auth
- `email` (varchar 255, unique)
- `emailVerified` (boolean)
- `username` (varchar 36, unique)
- `displayUsername` (text)
- `image` (text)
- `createdAt`, `updatedAt`

#### 2. **users_profile** (Main Profile Table)
- `id` (PK, FK to user.id)
- `first_name` (varchar 255)
- `gender` (varchar 50) - **CRITICAL for spouse validation**
- `email` (varchar 255)
- `phone` (varchar 50)
- `address` (text)
- `profile_picture` (varchar 255)
- `branch` (varchar 255)
- `income_classification` (varchar 50)
- `marital_status` (varchar 50)
- `family_status` (varchar 50)
- `murobbi_id` (varchar 36)
- `spouse_id` (varchar 36) - **EXISTS via migration**
- `created_at`, `updated_at`

#### 3. **personal_information**
- `id` (PK)
- `user_id` (FK to user.id, unique)
- `ic_no` (varchar 50, unique) - IC number
- `created_at`, `updated_at`

#### 4. **education** (Can have multiple records)
- `id` (PK)
- `user_id` (FK to user.id)
- `university` (varchar 255)
- `field_of_study` (varchar 255)
- `degree` (varchar 255)
- `start_year` (varchar 4)
- `end_year` (varchar 4, nullable)
- `is_current` (boolean)
- `course` (varchar 255)
- `scholarship` (varchar 255)

#### 5. **high_school**
- `id` (PK)
- `user_id` (FK to user.id)
- `state` (varchar 255)
- `type` (varchar 50) - School type
- `school_name` (varchar 255)
- `position` (varchar 255)
- `spm_result` (varchar 255)
- `highest_achievement` (text)
- `spm_year` (varchar 4)

#### 6. **family** (Can have multiple records)
- `id` (PK)
- `user_id` (FK to user.id)
- `relationship` (varchar 50) - father, mother, sibling, etc.
- `full_name` (varchar 255)
- `phone` (varchar 20)
- `occupation` (varchar 255)
- `company` (varchar 255)
- `supports_dakwah` (boolean)
- `jemaah_name` (varchar 255)

#### 7. **certification** (Can have multiple records)
- `id` (PK)
- `user_id` (FK to user.id)
- `type` (varchar 50)
- `name` (varchar 255)
- `issuing_institution` (varchar 255)
- `year_obtained` (varchar 4)

#### 8. **user_roles**
- `id` (PK)
- `user_id` (FK to user.id)
- `role` (varchar 36) - admin, user, etc.

---

## STEP 2: Required Fields for 100% Profile Completion

### Category A: Personal Information (30% weight)
**Table: users_profile + personal_information**

**Mandatory Fields (10 fields):**
1. ✓ `first_name` (users_profile)
2. ✓ `gender` (users_profile) - **ikhwah/akhwat**
3. ✓ `phone` (users_profile)
4. ✓ `address` (users_profile)
5. ✓ `ic_no` (personal_information)
6. ✓ `marital_status` (users_profile)
7. ✓ `family_status` (users_profile)
8. ✓ `income_classification` (users_profile)
9. ✓ `branch` (users_profile)
10. ✓ `profile_picture` (users_profile) - Optional but recommended

**Calculation:** Each field = 3%

---

### Category B: Education Background (25% weight)
**Tables: high_school + education**

**High School (Required - 1 record minimum) - 12%:**
1. ✓ `school_name` (high_school)
2. ✓ `state` (high_school)
3. ✓ `type` (high_school)
4. ✓ `spm_year` (high_school)
5. ✓ `spm_result` (high_school)

**Higher Education (Required - 1 record minimum) - 13%:**
1. ✓ `university` (education)
2. ✓ `field_of_study` (education)
3. ✓ `degree` (education)
4. ✓ `start_year` (education)
5. ✓ End year OR `is_current=1` (education)

**Calculation:**
- High school exists with all required fields = 12%
- At least 1 university education record with all required fields = 13%

---

### Category C: Family Information (20% weight)
**Table: family**

**Required Family Members (Minimum 2 records: Father + Mother) - 20%:**
1. ✓ Father record with:
   - `full_name`
   - `occupation`
   - `phone` (optional but recommended)

2. ✓ Mother record with:
   - `full_name`
   - `occupation`
   - `phone` (optional but recommended)

**Calculation:**
- Father record complete = 10%
- Mother record complete = 10%

---

### Category D: Spouse Information (15% weight)
**Table: users_profile (spouse_id field)**

**Required for Married Users:**
1. ✓ `spouse_id` is NOT NULL
2. ✓ Spouse gender is opposite to user gender
3. ✓ Spouse also links back (mutual linking)

**Calculation:**
- If `marital_status` = 'single': Auto-complete (15%)
- If `marital_status` = 'married':
  - `spouse_id` filled = 10%
  - Mutual linking verified = 5%

---

### Category E: Role Assignment (10% weight)
**Tables: user_roles + users_profile**

**Required:**
1. ✓ Has role in `user_roles` table
2. ✓ `murobbi_id` is filled (for non-admin users)

**Calculation:**
- Role assigned = 5%
- Murobbi assigned (if applicable) = 5%

---

## STEP 3: Database Schema Updates Needed

### ✅ Already Exists (from migration)
```sql
-- spouse_id column already in migration file
ALTER TABLE `users_profile`
ADD COLUMN `spouse_id` varchar(36) DEFAULT NULL;
```

### ⚠️ Need to Apply Migration
Check if the migration has been applied to the database. Run:
```sql
SHOW COLUMNS FROM users_profile LIKE 'spouse_id';
```

If not found, apply the migration:
```bash
mysql -u root kitadaie < migrations/add_spouse_id.sql
```

### 🆕 Additional Recommended Fields (Optional Enhancement)

#### users_profile enhancements:
```sql
ALTER TABLE `users_profile`
ADD COLUMN `profile_completion_percentage` INT DEFAULT 0 AFTER `spouse_id`,
ADD COLUMN `profile_last_updated_at` DATETIME DEFAULT NULL AFTER `profile_completion_percentage`,
ADD INDEX `idx_profile_completion` (`profile_completion_percentage`),
ADD INDEX `idx_gender` (`gender`);
```

**Purpose:**
- `profile_completion_percentage`: Cache the calculated completion %
- `profile_last_updated_at`: Track when user last updated profile
- Indexes for faster querying in admin reports

---

## STEP 4: Profile Completion Calculation Logic

### Algorithm Overview

```javascript
function calculateProfileCompletion(userId) {
  let totalScore = 0;
  let maxScore = 100;

  // Category A: Personal Info (30%)
  totalScore += calculatePersonalInfo(userId);

  // Category B: Education (25%)
  totalScore += calculateEducation(userId);

  // Category C: Family (20%)
  totalScore += calculateFamily(userId);

  // Category D: Spouse (15%)
  totalScore += calculateSpouse(userId);

  // Category E: Role (10%)
  totalScore += calculateRole(userId);

  return Math.round(totalScore);
}
```

### Detailed Breakdown

#### A. Personal Info Calculation (30%)
```javascript
async function calculatePersonalInfo(userId) {
  const profile = await getProfile(userId);
  const personalInfo = await getPersonalInfo(userId);

  let score = 0;
  const fields = [
    profile.first_name,        // 3%
    profile.gender,            // 3%
    profile.phone,             // 3%
    profile.address,           // 3%
    personalInfo.ic_no,        // 3%
    profile.marital_status,    // 3%
    profile.family_status,     // 3%
    profile.income_classification, // 3%
    profile.branch,            // 3%
    profile.profile_picture    // 3%
  ];

  fields.forEach(field => {
    if (field) score += 3;
  });

  return score;
}
```

#### B. Education Calculation (25%)
```javascript
async function calculateEducation(userId) {
  let score = 0;

  // High school check (12%)
  const highSchool = await getHighSchool(userId);
  if (highSchool) {
    const hsRequired = [
      highSchool.school_name,
      highSchool.state,
      highSchool.type,
      highSchool.spm_year,
      highSchool.spm_result
    ];

    const hsComplete = hsRequired.every(field => field !== null);
    if (hsComplete) score += 12;
  }

  // University check (13%)
  const university = await getUniversity(userId);
  if (university && university.length > 0) {
    const uni = university[0]; // Check first record
    const uniRequired = [
      uni.university,
      uni.field_of_study,
      uni.degree,
      uni.start_year,
      (uni.end_year || uni.is_current)
    ];

    const uniComplete = uniRequired.every(field => field);
    if (uniComplete) score += 13;
  }

  return score;
}
```

#### C. Family Calculation (20%)
```javascript
async function calculateFamily(userId) {
  let score = 0;
  const family = await getFamily(userId);

  // Check for father (10%)
  const father = family.find(f =>
    f.relationship.toLowerCase() === 'father' ||
    f.relationship.toLowerCase() === 'ayah'
  );
  if (father && father.full_name && father.occupation) {
    score += 10;
  }

  // Check for mother (10%)
  const mother = family.find(f =>
    f.relationship.toLowerCase() === 'mother' ||
    f.relationship.toLowerCase() === 'ibu'
  );
  if (mother && mother.full_name && mother.occupation) {
    score += 10;
  }

  return score;
}
```

#### D. Spouse Calculation (15%)
```javascript
async function calculateSpouse(userId) {
  const profile = await getProfile(userId);

  // If single, auto-complete
  if (profile.marital_status === 'single' ||
      profile.marital_status === 'Single') {
    return 15;
  }

  // If married, check spouse_id
  if (profile.marital_status === 'married' ||
      profile.marital_status === 'Married') {

    if (!profile.spouse_id) return 0;

    let score = 10; // Has spouse_id

    // Verify mutual linking and opposite gender
    const spouse = await getProfile(profile.spouse_id);
    if (spouse &&
        spouse.spouse_id === userId &&
        spouse.gender !== profile.gender) {
      score += 5; // Mutual linking verified
    }

    return score;
  }

  return 0;
}
```

#### E. Role Calculation (10%)
```javascript
async function calculateRole(userId) {
  let score = 0;

  // Check role (5%)
  const role = await getUserRole(userId);
  if (role) score += 5;

  // Check murobbi (5%)
  const profile = await getProfile(userId);
  if (profile.murobbi_id || role === 'admin') {
    score += 5;
  }

  return score;
}
```

---

## STEP 5: Admin Report Page Requirements

### Page URL
`/dashboard/admin/profile-report`

### Features Required

#### 1. User List Table
**Columns:**
- Username
- Full Name
- Gender (Ikhwah/Akhwat)
- Branch
- Completion %
- Missing Fields Count
- Last Updated
- Actions (View Details, Export Individual)

#### 2. Filters & Search
- Search by name/username
- Filter by completion % ranges:
  - 0-25% (Critical)
  - 26-50% (Low)
  - 51-75% (Medium)
  - 76-99% (Almost Complete)
  - 100% (Complete)
- Filter by gender
- Filter by branch
- Filter: Show only incomplete (<100%)

#### 3. Statistics Dashboard
- Total Users
- Average Completion %
- Users with <50% completion
- Users with 100% completion

#### 4. Export Functionality
- Export all to CSV
- Export filtered results to CSV
- Export individual user report to PDF

#### 5. Missing Fields Breakdown
**Per User Detail View:**
- Personal Info: List missing fields
- Education: Missing high school or university data
- Family: Missing father/mother records
- Spouse: Not linked (if married)
- Role: Missing role or murobbi assignment

---

## Implementation Files Structure

```
src/
├── server/
│   └── actions/
│       └── profile-completion.js         # Server actions
├── lib/
│   └── profile-completion-calculator.js  # Core calculation logic
├── app/
│   └── dashboard/
│       └── admin/
│           └── profile-report/
│               ├── page.jsx              # Main report page
│               └── _components/
│                   ├── ProfileTable.jsx
│                   ├── ProfileStats.jsx
│                   ├── ProfileFilters.jsx
│                   └── ExportButton.jsx
└── features/
    └── profile-completion/
        ├── hooks/
        │   └── useProfileCompletion.js
        └── components/
            ├── CompletionBadge.jsx
            └── MissingFieldsAlert.jsx
```

---

## Next Steps

1. ✅ **Apply spouse_id migration** to database
2. 🔨 **Create profile completion calculator** (Step 3)
3. 🎨 **Build admin report UI** (Step 4)
4. 🔗 **Implement spouse linking UI** (Step 5)

---

## Database Migration Checklist

- [ ] Verify spouse_id column exists in users_profile
- [ ] Add profile_completion_percentage column (optional)
- [ ] Add profile_last_updated_at column (optional)
- [ ] Create indexes for performance
- [ ] Test calculation on sample data
