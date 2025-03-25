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
