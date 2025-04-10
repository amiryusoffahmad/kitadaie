import { db } from "@/lib/db";
// Class related queries
export async function getClassById(classId) {
  if (!classId) {
    console.log("[DATA] getClassById called with invalid classId:", classId);
    return null;
  }
  const id = parseInt(classId, 10);
  console.log("[DATA] getClassById parsed classId:", id);
  return await db("tprog_class").where("id", id).first();
}

export async function getClassByCode(classCode) {
  return await db("tprog_class").where("class_code", classCode).first();
}

export async function getEnrolledClasses(userId) {
  return await db("tprog_enrollment")
    .join("tprog_class", "tprog_enrollment.class_id", "tprog_class.id")
    .where("tprog_enrollment.user_id", userId)
    .where("tprog_enrollment.status", "active")
    .select(
      "tprog_class.id",
      "tprog_class.name",
      "tprog_class.description",
      "tprog_class.class_code"
    );
}

export async function checkEnrollment(classId, userId) {
  if (!classId || !userId) {
    console.log(
      "[DATA] checkEnrollment called with invalid params. classId:",
      classId,
      "userId:",
      userId
    );
    return false;
  }

  const id = parseInt(classId, 10);
  console.log("[DATA] checkEnrollment parsed classId:", id);

  const enrollment = await db("tprog_enrollment")
    .where({
      class_id: id,
      user_id: userId,
    })
    .first();

  console.log(
    "[DATA] checkEnrollment result:",
    !!enrollment,
    "for classId:",
    id,
    "userId:",
    userId
  );
  return !!enrollment;
}

// Assignment related queries
export async function getClassAssignments(classId) {
  return await db("tprog_assignment")
    .where("class_id", classId)
    .orderBy("due_date", "asc");
}

export async function getAssignmentById(assignmentId) {
  return await db("tprog_assignment").where("id", assignmentId).first();
}

export async function getAssignmentWithSubmission(assignmentId, userId) {
  const assignment = await db("tprog_assignment")
    .where("tprog_assignment.id", assignmentId)
    .first();

  if (!assignment) return null;

  const submission = await db("tprog_submission")
    .leftJoin("uploads", "tprog_submission.file_id", "uploads.id")
    .where({
      assignment_id: assignmentId,
      "tprog_submission.user_id": userId,
    })
    .select(
      "tprog_submission.id",
      "tprog_submission.status",
      "tprog_submission.submitted_at",
      "tprog_submission.feedback",
      "uploads.id as file_id",
      "uploads.original_filename as fileName",
      "uploads.path as filePath"
    )
    .first();

  return {
    ...assignment,
    submission: submission || null,
  };
}

// Submission related queries
export async function getSubmissionsByAssignment(assignmentId) {
  return await db("tprog_submission")
    .leftJoin("uploads", "tprog_submission.file_id", "uploads.id")
    .leftJoin("user", "tprog_submission.user_id", "user.id")
    .where("tprog_submission.assignment_id", assignmentId)
    .select(
      "tprog_submission.id",
      "tprog_submission.status",
      "tprog_submission.submitted_at",
      "uploads.id as file_id",
      "uploads.original_filename as fileName",
      "uploads.path as filePath",
      "user.name as userName",
      "tprog_submission.user_id"
    );
}

export async function getUserSubmission(assignmentId, userId) {
  return await db("tprog_submission")
    .leftJoin("uploads", "tprog_submission.file_id", "uploads.id")
    .where({
      assignment_id: assignmentId,
      "tprog_submission.user_id": userId,
    })
    .select(
      "tprog_submission.id",
      "tprog_submission.status",
      "tprog_submission.submitted_at",
      "tprog_submission.feedback",
      "uploads.id as file_id",
      "uploads.original_filename as fileName",
      "uploads.path as filePath"
    )
    .first();
}

// Get assignments with submission status for a user
export async function getAssignmentsWithStatus(classId, userId) {
  console.log(
    "[DATA] getAssignmentsWithStatus called with classId:",
    classId,
    "userId:",
    userId
  );

  // Make sure classId is an integer
  classId = parseInt(classId, 10);
  console.log("[DATA] Parsed classId:", classId);

  const assignments = await db("tprog_assignment")
    .where("class_id", classId)
    .orderBy("due_date", "asc");

  console.log("[DATA] Raw assignments found:", assignments.length, assignments);

  if (assignments.length === 0) {
    console.log("[DATA] No assignments found for class", classId);
    return [];
  }

  const submissions = await db("tprog_submission")
    .where("tprog_submission.user_id", userId)
    .whereIn(
      "assignment_id",
      assignments.map((a) => a.id)
    );

  console.log("[DATA] User submissions found:", submissions.length);

  const result = assignments.map((assignment) => {
    const submission = submissions.find(
      (s) => s.assignment_id === assignment.id
    );
    const now = new Date();
    const dueDate = new Date(assignment.due_date);

    let status = "not_submitted";
    if (submission) {
      status = submission.status;
    } else if (now > dueDate) {
      status = "overdue";
    }

    return {
      ...assignment,
      status,
    };
  });

  console.log("[DATA] Returning processed assignments:", result.length);
  return result;
}

// Advisor-Student related queries
export async function isUserAdvisor(identifier) {
  if (!identifier) {
    console.log(
      "[DATA] isUserAdvisor called with invalid identifier:",
      identifier
    );
    return false;
  }

  console.log(
    "[DATA] Checking if user is advisor with identifier:",
    identifier
  );

  try {
    // First try to find by advisor username
    let result = await db("tprog_role")
      .where("username_advisor", identifier)
      .first();

    if (result) {
      console.log("[DATA] Found advisor by username_advisor");
      return true;
    }

    // If not found, check if any users with this ID are advisors
    // First get the username for this user ID
    const user = await db("user")
      .where("id", identifier)
      .select("username")
      .first();

    if (user && user.username) {
      console.log("[DATA] Found username for ID:", user.username);

      // Now check if this username is in the advisor column
      result = await db("tprog_role")
        .where("username_advisor", user.username)
        .first();

      console.log("[DATA] isUserAdvisor result after ID lookup:", !!result);
      return !!result;
    }

    console.log("[DATA] isUserAdvisor query result: false (no matches found)");
    return false;
  } catch (error) {
    console.error("[DATA] Error in isUserAdvisor:", error);
    return false;
  }
}

export async function getAdvisorStudents(advisorIdentifier) {
  if (!advisorIdentifier) {
    console.log("[DATA] getAdvisorStudents called with invalid identifier");
    return [];
  }

  console.log("[DATA] Getting advisor students for:", advisorIdentifier);

  try {
    // First, get the username if we were passed a user ID
    let username = advisorIdentifier;
    const user = await db("user")
      .where("id", advisorIdentifier)
      .select("username")
      .first();

    if (user && user.username) {
      username = user.username;
      console.log("[DATA] Found username for ID:", username);
    }

    // Get student usernames from the tprog_role table
    const studentUsernames = await db("tprog_role")
      .where("username_advisor", username)
      .select("username_student");

    // Log the direct query results to debug
    console.log(
      "[DATA] Raw query results:",
      JSON.stringify(studentUsernames, null, 2)
    );

    // If no students found, return empty array
    if (!studentUsernames || studentUsernames.length === 0) {
      console.log("[DATA] No students found for advisor:", username);

      // As a fallback, try to query by ID directly
      const fallbackResults = await db("tprog_role")
        .where("username_advisor", advisorIdentifier)
        .select("username_student");

      console.log(
        "[DATA] Fallback query results:",
        JSON.stringify(fallbackResults, null, 2)
      );

      if (!fallbackResults || fallbackResults.length === 0) {
        return [];
      }

      console.log("[DATA] Found students in fallback query");
      const students = await db("user")
        .whereIn(
          "username",
          fallbackResults.map((s) => s.username_student)
        )
        .select("id", "name", "username", "email");

      console.log(
        "[DATA] Returning student records from fallback:",
        students.length
      );
      return students;
    }

    console.log("[DATA] Found student usernames:", studentUsernames.length);

    // Get student data from user table
    const students = await db("user")
      .whereIn(
        "username",
        studentUsernames.map((s) => s.username_student)
      )
      .select("id", "name", "username", "email");

    console.log("[DATA] Returning student records:", students.length);
    return students;
  } catch (error) {
    console.error("[DATA] Error in getAdvisorStudents:", error);
    return [];
  }
}

export async function getMurobbiStudents(murobbiIdentifier) {
  if (!murobbiIdentifier) {
    console.log("[DATA] getMurobbiStudents called with invalid identifier");
    return [];
  }

  console.log("[DATA] Getting murobbi students for:", murobbiIdentifier);

  try {
    // First, get the username if we were passed a user ID
    let username = murobbiIdentifier;
    const user = await db("user")
      .where("id", murobbiIdentifier)
      .select("username")
      .first();

    if (user && user.username) {
      username = user.username;
      console.log("[DATA] Found username for ID:", username);
    }

    // Get student IDs from the users_profile table where murobbi_id matches username
    const studentProfiles = await db("users_profile")
      .where("murobbi_id", username)
      .select("id"); // This selects user IDs

    // Log the direct query results to debug
    console.log(
      "[DATA] Raw murobbi query results:",
      JSON.stringify(studentProfiles, null, 2)
    );

    // If no students found, return empty array
    if (!studentProfiles || studentProfiles.length === 0) {
      console.log("[DATA] No murobbi students found for:", username);
      return [];
    }

    console.log("[DATA] Found student profiles:", studentProfiles.length);

    // Get student data from user table using the IDs
    const students = await db("user")
      .whereIn(
        "id",
        studentProfiles.map((s) => s.id)
      )
      .select("id", "name", "username", "email");

    console.log("[DATA] Returning murobbi student records:", students.length);
    return students;
  } catch (error) {
    console.error("[DATA] Error in getMurobbiStudents:", error);
    return [];
  }
}

export async function getStudentClasses(studentId) {
  return await getEnrolledClasses(studentId);
}

export async function getStudentAssignments(studentId, classId) {
  return await getAssignmentsWithStatus(classId, studentId);
}

export async function getStudentAssignmentDetails(assignmentId, studentId) {
  return await getAssignmentWithSubmission(assignmentId, studentId);
}

export async function updateSubmissionStatus(submissionId, status, comments) {
  try {
    await db("tprog_submission").where("id", submissionId).update({
      status,
      feedback: comments,
      updated_at: new Date(),
    });
    return true;
  } catch (error) {
    console.error("[DATA] Error updating submission status:", error);
    return false;
  }
}

export async function getFileById(fileId) {
  if (!fileId) return null;

  return await db("uploads").where("id", fileId).first();
}
