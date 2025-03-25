import { db } from "@/lib/db";
import * as tprogData from "@/data/tprog-data";

// Class management functions
export async function enrollInClass(userId, classCode) {
  // Validate inputs
  if (!userId || !classCode) {
    throw new Error("User ID and class code are required");
  }

  return await db.transaction(async (trx) => {
    // Check if class exists
    const classObj = await trx("tprog_class")
      .where("class_code", classCode)
      .first();

    if (!classObj) {
      throw new Error("Class not found");
    }

    // Check if user is already enrolled
    const existingEnrollment = await trx("tprog_enrollment")
      .where({
        class_id: classObj.id,
        user_id: userId,
      })
      .first();

    if (existingEnrollment) {
      // If enrolled but inactive, reactivate
      if (existingEnrollment.status === "inactive") {
        await trx("tprog_enrollment")
          .where("id", existingEnrollment.id)
          .update({
            status: "active",
            updated_at: new Date(),
          });
        return { success: true, message: "Enrollment reactivated" };
      }
      throw new Error("You are already enrolled in this class");
    }

    // Create new enrollment
    await trx("tprog_enrollment").insert({
      class_id: classObj.id,
      user_id: userId,
      status: "active",
      enrolled_at: new Date(),
      updated_at: new Date(),
    });

    return { success: true, message: "Successfully enrolled in class" };
  });
}

export async function unenrollFromClass(userId, classId) {
  // Validate inputs
  if (!userId || !classId) {
    throw new Error("User ID and class ID are required");
  }

  await db("tprog_enrollment")
    .where({
      class_id: classId,
      user_id: userId,
    })
    .update({
      status: "inactive",
      updated_at: new Date(),
    });

  return { success: true, message: "Successfully unenrolled from class" };
}

// Assignment submission functions
export async function submitAssignment(assignmentId, userId, fileId) {
  // Validate inputs
  if (!assignmentId || !userId || !fileId) {
    throw new Error("Assignment ID, user ID, and file ID are required");
  }

  return await db.transaction(async (trx) => {
    // Get assignment details
    const assignment = await trx("tprog_assignment")
      .where("id", assignmentId)
      .first();

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    // Check if due date has passed
    if (new Date() > new Date(assignment.due_date)) {
      throw new Error("Assignment is past due date and cannot be submitted");
    }

    // Check if user is enrolled in the class
    const enrollment = await trx("tprog_enrollment")
      .where({
        class_id: assignment.class_id,
        user_id: userId,
        status: "active",
      })
      .first();

    if (!enrollment) {
      throw new Error("You are not enrolled in this class");
    }

    // Check if submission already exists
    const existingSubmission = await trx("tprog_submission")
      .where({
        assignment_id: assignmentId,
        user_id: userId,
      })
      .first();

    if (existingSubmission) {
      // Update existing submission
      await trx("tprog_submission").where("id", existingSubmission.id).update({
        file_id: fileId,
        status: "pending_review",
        submitted_at: new Date(),
        updated_at: new Date(),
      });
    } else {
      // Create new submission
      await trx("tprog_submission").insert({
        assignment_id: assignmentId,
        user_id: userId,
        file_id: fileId,
        status: "pending_review",
        submitted_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    return { success: true, message: "Assignment submitted successfully" };
  });
}

export async function deleteSubmission(submissionId, userId) {
  // Validate inputs
  if (!submissionId || !userId) {
    throw new Error("Submission ID and user ID are required");
  }

  return await db.transaction(async (trx) => {
    // Get submission details
    const submission = await trx("tprog_submission")
      .where("id", submissionId)
      .first();

    if (!submission) {
      throw new Error("Submission not found");
    }

    // Check if submission belongs to user
    if (submission.user_id !== userId) {
      throw new Error("You do not have permission to delete this submission");
    }

    // Get assignment to check if it's approved (can't delete approved submissions)
    if (submission.status === "approved") {
      throw new Error("Approved submissions cannot be deleted");
    }

    // Delete submission
    await trx("tprog_submission").where("id", submissionId).delete();

    return { success: true, message: "Submission deleted successfully" };
  });
}

// Helper function to retrieve assignment info with submission status
export async function getAssignmentDetails(assignmentId, userId) {
  try {
    console.log(
      "[SERVER] getAssignmentDetails called with assignmentId:",
      assignmentId,
      "userId:",
      userId
    );

    if (!assignmentId) {
      throw new Error("Assignment ID is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get assignment with submission
    const assignmentWithSubmission =
      await tprogData.getAssignmentWithSubmission(assignmentId, userId);

    console.log("[SERVER] Assignment retrieved:", !!assignmentWithSubmission);

    if (!assignmentWithSubmission) {
      throw new Error("Assignment not found");
    }

    const now = new Date();
    const dueDate = new Date(assignmentWithSubmission.due_date);

    console.log("[SERVER] Assignment due date:", dueDate);
    console.log(
      "[SERVER] Has submission:",
      !!assignmentWithSubmission.submission
    );

    // If no submission and past due date, mark as overdue
    if (!assignmentWithSubmission.submission && now > dueDate) {
      console.log("[SERVER] Marking assignment as overdue");
      return {
        ...assignmentWithSubmission,
        status: "overdue",
      };
    }

    // If has submission, use its status
    if (assignmentWithSubmission.submission) {
      console.log(
        "[SERVER] Using submission status:",
        assignmentWithSubmission.submission.status
      );
      return {
        ...assignmentWithSubmission,
        status: assignmentWithSubmission.submission.status,
      };
    }

    // Otherwise, not submitted
    console.log("[SERVER] Marking assignment as not submitted");
    return {
      ...assignmentWithSubmission,
      status: "not_submitted",
    };
  } catch (error) {
    console.error("[SERVER] Error in getAssignmentDetails:", error.message);
    throw error; // Re-throw to be handled by the action
  }
}
