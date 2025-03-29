"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import * as tprogServer from "@/server/tprog-server";
import * as tprogData from "@/data/tprog-data";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Enrollment actions
export async function enrollInClass(classCode) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    const result = await tprogServer.enrollInClass(session.user.id, classCode);
    revalidatePath("/tprog");
    return { success: true, message: result.message };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function unenrollFromClass(classId) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    const result = await tprogServer.unenrollFromClass(
      session.user.id,
      classId
    );
    revalidatePath("/tprog");
    return { success: true, message: result.message };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Class data actions
export async function getEnrolledClasses() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    const classes = await tprogData.getEnrolledClasses(session.user.id);
    return { success: true, data: classes };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getClassDetails(classId) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    // Verify enrollment
    const isEnrolled = await tprogData.checkEnrollment(
      classId,
      session.user.id
    );
    if (!isEnrolled) {
      throw new Error("You are not enrolled in this class");
    }

    const classDetails = await tprogData.getClassById(classId);
    return { success: true, data: classDetails };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Assignment actions
export async function getAssignmentsForClass(classId) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    console.log(
      "[SERVER] Getting assignments for class:",
      classId,
      "typeof classId:",
      typeof classId,
      "user:",
      session.user.id
    );

    // Try to ensure classId is properly formatted
    const parsedClassId = parseInt(classId, 10);
    console.log(
      "[SERVER] Parsed classId:",
      parsedClassId,
      "typeof:",
      typeof parsedClassId
    );

    // Verify enrollment
    const isEnrolled = await tprogData.checkEnrollment(
      parsedClassId,
      session.user.id
    );

    console.log("[SERVER] User enrolled:", isEnrolled);

    if (!isEnrolled) {
      throw new Error("You are not enrolled in this class");
    }

    // Check if class exists
    const classDetails = await tprogData.getClassById(parsedClassId);
    console.log("[SERVER] Class details:", classDetails);

    if (!classDetails) {
      throw new Error("Class not found");
    }

    const assignments = await tprogData.getAssignmentsWithStatus(
      parsedClassId,
      session.user.id
    );

    console.log("[SERVER] Found assignments:", assignments.length, assignments);

    // If no assignments found, create a sample one for testing
    if (assignments.length === 0) {
      console.log("[SERVER] Creating sample assignment for testing");
      await createSampleAssignment(parsedClassId);
      // Fetch assignments again
      const newAssignments = await tprogData.getAssignmentsWithStatus(
        parsedClassId,
        session.user.id
      );
      console.log(
        "[SERVER] After creating sample, assignments:",
        newAssignments.length
      );
      return { success: true, data: newAssignments };
    }

    return { success: true, data: assignments };
  } catch (error) {
    console.error("[SERVER] Error getting assignments:", error.message);
    return { success: false, message: error.message };
  }
}

// Helper function to create a sample assignment for testing
async function createSampleAssignment(classId) {
  try {
    const id = parseInt(classId, 10);
    console.log("[SERVER] Creating sample assignment for class ID:", id);

    // Create a sample assignment with a future due date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await db("tprog_assignment").insert({
      class_id: id,
      title: "Sample Assignment",
      instructions: "This is a sample assignment created for testing.",
      due_date: tomorrow.toISOString(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log("[SERVER] Sample assignment created:", result);
    return { success: true };
  } catch (error) {
    console.error("[SERVER] Error creating sample assignment:", error.message);
    return { success: false, message: error.message };
  }
}

export async function getAssignmentDetails(assignmentId) {
  try {
    console.log(
      "[SERVER ACTION] getAssignmentDetails called with assignmentId:",
      assignmentId
    );

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    // Validate assignmentId
    if (!assignmentId) {
      throw new Error("Assignment ID is required");
    }

    console.log(
      "[SERVER ACTION] Fetching details with assignmentId:",
      assignmentId,
      "userId:",
      session.user.id
    );

    const assignmentDetails = await tprogServer.getAssignmentDetails(
      assignmentId,
      session.user.id
    );

    console.log(
      "[SERVER ACTION] Assignment details found:",
      !!assignmentDetails
    );

    return { success: true, data: assignmentDetails };
  } catch (error) {
    console.error(
      "[SERVER ACTION] Error in getAssignmentDetails:",
      error.message
    );
    return { success: false, message: error.message };
  }
}

// Submission actions
export async function submitAssignmentAction(assignmentId, fileId) {
  try {
    console.log("[SERVER ACTION] submitAssignmentAction called with params:", {
      assignmentId,
      fileId,
      typeOfFileId: typeof fileId,
    });

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    // Validate parameters
    if (!assignmentId) {
      throw new Error("Assignment ID is required");
    }

    if (!fileId) {
      throw new Error("File ID is required");
    }

    // Get the clean filename from the fileId
    let filename = fileId;
    let originalFilename = fileId;

    // If the fileId contains a path, extract just the filename
    if (typeof fileId === "string" && fileId.includes("/uploads/")) {
      filename = fileId.split("/uploads/")[1];
      originalFilename = filename;
    }

    // Check if this file is already in our database by matching the filename
    console.log("[SERVER ACTION] Looking for file with filename:", filename);
    let fileDbId = null;
    const existingFile = await db("uploads")
      .where("filename", filename)
      .orWhere("path", "like", `%${filename}`)
      .first();

    // If file exists in the database, use its ID
    if (existingFile) {
      console.log(
        "[SERVER ACTION] Found existing file in database:",
        existingFile
      );
      fileDbId = existingFile.id;
    } else {
      // Create a new file record in the database
      console.log("[SERVER ACTION] Creating new file record in database");

      // Extract original filename if it's in timestamp-filename format
      if (filename.includes("-")) {
        originalFilename = filename.split("-").slice(1).join("-");
      }

      // Default mimetype based on extension
      let mimetype = "application/octet-stream";
      if (originalFilename.toLowerCase().endsWith(".pdf")) {
        mimetype = "application/pdf";
      } else if (
        originalFilename.toLowerCase().endsWith(".doc") ||
        originalFilename.toLowerCase().endsWith(".docx")
      ) {
        mimetype = "application/msword";
      }

      try {
        // Insert the file record
        const [insertedId] = await db("uploads").insert({
          filename: filename,
          original_filename: originalFilename,
          path: `/uploads/${filename}`,
          size: 0, // We don't have the actual size, but the column is required
          mimetype: mimetype,
          user_id: session.user.id,
          document_type: "assignment",
          created_at: new Date(),
          updated_at: new Date(),
        });

        console.log(
          "[SERVER ACTION] Created new file record with ID:",
          insertedId
        );
        fileDbId = insertedId;
      } catch (dbError) {
        console.error(
          "[SERVER ACTION] Database error creating file record:",
          dbError
        );
        throw new Error("Failed to create file record: " + dbError.message);
      }
    }

    // Now we have a valid database ID for the file, submit the assignment
    console.log(
      "[SERVER ACTION] Submitting assignment with fileDbId:",
      fileDbId
    );

    if (!fileDbId) {
      throw new Error("Failed to process file. No valid file ID obtained.");
    }

    const result = await tprogServer.submitAssignment(
      assignmentId,
      session.user.id,
      fileDbId
    );

    console.log("[SERVER ACTION] Submission result:", result);

    revalidatePath(`/tprog/[id]/assignment/[assignmentId]`);
    return { success: true, message: result.message };
  } catch (error) {
    console.error("[SERVER ACTION] submitAssignmentAction error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Deletes a submission by ID
 * @param {number} submissionId - The ID of the submission to delete
 * @returns {Promise<object>} Result of the deletion operation
 */
export async function deleteSubmissionAction(submissionId) {
  try {
    console.log("[SERVER ACTION] Deleting submission:", submissionId);

    // Validate input
    if (!submissionId) {
      throw new Error("Submission ID is required");
    }

    // Get the current user
    const session = await auth.api.getSession({
      headers: headers(),
    });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    // Verify that the user owns this submission
    const submission = await db("tprog_submission")
      .where({
        id: submissionId,
        user_id: session.user.id,
      })
      .first();

    if (!submission) {
      throw new Error(
        "Submission not found or you don't have permission to delete it"
      );
    }

    // Get the file information before deletion for debugging
    let fileInfo = null;
    if (submission.file_id) {
      fileInfo = await db("uploads").where("id", submission.file_id).first();
    }

    // Delete the submission
    await db("tprog_submission").where("id", submissionId).delete();

    console.log("[SERVER ACTION] Submission deleted successfully:", {
      submissionId,
      fileInfo,
    });

    return {
      success: true,
      message: "Submission deleted successfully",
      deletedFileInfo: fileInfo,
    };
  } catch (error) {
    console.error("[SERVER ACTION] Error deleting submission:", error);
    throw error;
  }
}

export async function getSubmissionsAction(assignmentId) {
  try {
    console.log(
      "[SERVER ACTION] getSubmissionsAction called with assignmentId:",
      assignmentId
    );

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    // Get all submissions for the assignment for this user
    const submissions = await db("tprog_submission")
      .select(
        "tprog_submission.*",
        "uploads.filename",
        "uploads.path as filepath",
        "uploads.size as filesize",
        "uploads.mimetype"
      )
      .leftJoin("uploads", "tprog_submission.file_id", "uploads.id")
      .where({
        assignment_id: assignmentId,
        user_id: session.user.id,
      })
      .orderBy("tprog_submission.submitted_at", "desc");

    console.log("[SERVER ACTION] Found submissions:", submissions.length);

    return {
      success: true,
      data: submissions,
    };
  } catch (error) {
    console.error("[SERVER ACTION] Error fetching submissions:", error);
    return { success: false, message: error.message };
  }
}

// Advisor-Student actions
export async function isUserAdvisor() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    // Debug the session object to understand its structure
    console.log(
      "[SERVER ACTION] Session user object:",
      JSON.stringify(session.user, null, 2)
    );

    // Get username from the session - it might be in session.user.id
    const username = session.user.username || session.user.id;
    console.log("[SERVER ACTION] Using username for advisor check:", username);

    // Pass the username
    const isAdvisor = await tprogData.isUserAdvisor(username);

    console.log("[SERVER ACTION] isAdvisor result:", isAdvisor);
    return { success: true, data: isAdvisor };
  } catch (error) {
    console.error("[SERVER ACTION] Error in isUserAdvisor:", error.message);
    return { success: false, message: error.message };
  }
}

export async function getAdvisorStudents() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    // Debug the session object
    console.log(
      "[SERVER ACTION] getAdvisorStudents - Session user:",
      JSON.stringify(session.user, null, 2)
    );

    // Get username from the session - it might be in session.user.id
    const username = session.user.username || session.user.id;
    console.log(
      "[SERVER ACTION] Using identifier for advisor students:",
      username
    );

    const students = await tprogData.getAdvisorStudents(username);
    console.log("[SERVER ACTION] Found advisor students:", students.length);

    return { success: true, data: students };
  } catch (error) {
    console.error(
      "[SERVER ACTION] Error in getAdvisorStudents:",
      error.message
    );
    return { success: false, message: error.message };
  }
}

export async function getMurobbiStudents() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    // Debug the session object
    console.log(
      "[SERVER ACTION] getMurobbiStudents - Session user:",
      JSON.stringify(session.user, null, 2)
    );

    // Get username from the session - it might be in session.user.id
    const username = session.user.username || session.user.id;
    console.log(
      "[SERVER ACTION] Using identifier for murobbi students:",
      username
    );

    const students = await tprogData.getMurobbiStudents(username);
    console.log("[SERVER ACTION] Found murobbi students:", students.length);

    return { success: true, data: students };
  } catch (error) {
    console.error(
      "[SERVER ACTION] Error in getMurobbiStudents:",
      error.message
    );
    return { success: false, message: error.message };
  }
}

export async function getStudentClasses(studentId) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    // Get username from the session - it might be in session.user.id
    const username = session.user.username || session.user.id;
    console.log(
      "[SERVER ACTION] Using identifier for advisor check:",
      username
    );

    // Verify that the current user is an advisor of the student
    const students = await tprogData.getAdvisorStudents(username);
    console.log("[SERVER ACTION] Found students for advisor:", students.length);

    const isAdvisor = students.some((student) => student.id === studentId);
    console.log("[SERVER ACTION] Is advisor of this student:", isAdvisor);

    if (!isAdvisor) {
      throw new Error(
        "You are not authorized to view this student's information"
      );
    }

    const classes = await tprogData.getStudentClasses(studentId);
    return { success: true, data: classes };
  } catch (error) {
    console.error("[SERVER ACTION] Error in getStudentClasses:", error.message);
    return { success: false, message: error.message };
  }
}

export async function getStudentAssignments(studentId, classId) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    // Get username from the session - it might be in session.user.id
    const username = session.user.username || session.user.id;
    console.log(
      "[SERVER ACTION] Using identifier for advisor check:",
      username
    );

    // Verify that the current user is an advisor of the student
    const students = await tprogData.getAdvisorStudents(username);
    const isAdvisor = students.some((student) => student.id === studentId);

    if (!isAdvisor) {
      throw new Error(
        "You are not authorized to view this student's information"
      );
    }

    const assignments = await tprogData.getStudentAssignments(
      studentId,
      classId
    );
    return { success: true, data: assignments };
  } catch (error) {
    console.error(
      "[SERVER ACTION] Error in getStudentAssignments:",
      error.message
    );
    return { success: false, message: error.message };
  }
}

export async function getStudentAssignmentDetails(assignmentId, studentId) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    // Get username from the session - it might be in session.user.id
    const username = session.user.username || session.user.id;
    console.log(
      "[SERVER ACTION] Using identifier for advisor check:",
      username
    );

    // Verify that the current user is an advisor of the student
    const students = await tprogData.getAdvisorStudents(username);
    const isAdvisor = students.some((student) => student.id === studentId);

    if (!isAdvisor) {
      throw new Error(
        "You are not authorized to view this student's information"
      );
    }

    const assignmentDetails = await tprogData.getStudentAssignmentDetails(
      assignmentId,
      studentId
    );
    return { success: true, data: assignmentDetails };
  } catch (error) {
    console.error(
      "[SERVER ACTION] Error in getStudentAssignmentDetails:",
      error.message
    );
    return { success: false, message: error.message };
  }
}

export async function updateSubmissionStatus(submissionId, status, comments) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    // Get submission details to verify authorization
    const submission = await db("tprog_submission")
      .where("id", submissionId)
      .first();

    if (!submission) {
      throw new Error("Submission not found");
    }

    // Get username from the session - it might be in session.user.id
    const username = session.user.username || session.user.id;
    console.log(
      "[SERVER ACTION] Using identifier for advisor check:",
      username
    );

    // Verify that the current user is an advisor of the student who made the submission
    const students = await tprogData.getAdvisorStudents(username);
    const isAdvisor = students.some(
      (student) => student.id === submission.user_id
    );

    if (!isAdvisor) {
      throw new Error("You are not authorized to update this submission");
    }

    await tprogData.updateSubmissionStatus(submissionId, status, comments);
    revalidatePath(`/tprog`);

    return { success: true, message: "Submission status updated successfully" };
  } catch (error) {
    console.error(
      "[SERVER ACTION] Error in updateSubmissionStatus:",
      error.message
    );
    return { success: false, message: error.message };
  }
}
