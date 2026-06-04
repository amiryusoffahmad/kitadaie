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

    const parsedClassId = parseInt(classId, 10);

    const isEnrolled = await tprogData.checkEnrollment(
      parsedClassId,
      session.user.id
    );
    if (!isEnrolled) {
      throw new Error("You are not enrolled in this class");
    }

    const classDetails = await tprogData.getClassById(parsedClassId);
    if (!classDetails) {
      throw new Error("Class not found");
    }

    const assignments = await tprogData.getAssignmentsWithStatus(
      parsedClassId,
      session.user.id
    );

    return { success: true, data: assignments };
  } catch (error) {
    console.error("[SERVER] Error getting assignments:", error.message);
    return { success: false, message: error.message };
  }
}

export async function getAssignmentDetails(assignmentId) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    if (!assignmentId) {
      throw new Error("Assignment ID is required");
    }

    const assignmentDetails = await tprogServer.getAssignmentDetails(
      assignmentId,
      session.user.id
    );

    return { success: true, data: assignmentDetails };
  } catch (error) {
    console.error("[SERVER] Error in getAssignmentDetails:", error.message);
    return { success: false, message: error.message };
  }
}

// Submission actions
export async function submitAssignmentAction(assignmentId, fileId) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    if (!assignmentId) {
      throw new Error("Assignment ID is required");
    }

    if (!fileId) {
      throw new Error("File ID is required");
    }

    let filename = fileId;
    let originalFilename = fileId;

    if (typeof fileId === "string" && fileId.includes("/uploads/")) {
      filename = fileId.split("/uploads/")[1];
      originalFilename = filename;
    }

    let fileDbId = null;
    const existingFile = await db("uploads")
      .where("filename", filename)
      .orWhere("path", "like", `%${filename}`)
      .first();

    if (existingFile) {
      fileDbId = existingFile.id;
    } else {
      if (filename.includes("-")) {
        originalFilename = filename.split("-").slice(1).join("-");
      }

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
        const [insertedId] = await db("uploads").insert({
          filename: filename,
          original_filename: originalFilename,
          path: `/uploads/${filename}`,
          size: 0,
          mimetype: mimetype,
          user_id: session.user.id,
          document_type: "assignment",
          created_at: new Date(),
          updated_at: new Date(),
        });
        fileDbId = insertedId;
      } catch (dbError) {
        console.error("[SERVER] Database error creating file record:", dbError);
        throw new Error("Failed to create file record: " + dbError.message);
      }
    }

    if (!fileDbId) {
      throw new Error("Failed to process file. No valid file ID obtained.");
    }

    const result = await tprogServer.submitAssignment(
      assignmentId,
      session.user.id,
      fileDbId
    );

    revalidatePath(`/tprog/[id]/assignment/[assignmentId]`);
    return { success: true, message: result.message };
  } catch (error) {
    console.error("[SERVER] submitAssignmentAction error:", error);
    return { success: false, message: error.message };
  }
}

export async function deleteSubmissionAction(submissionId) {
  try {
    if (!submissionId) {
      throw new Error("Submission ID is required");
    }

    const session = await auth.api.getSession({
      headers: headers(),
    });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

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

    let fileInfo = null;
    if (submission.file_id) {
      fileInfo = await db("uploads").where("id", submission.file_id).first();
    }

    await db("tprog_submission").where("id", submissionId).delete();

    return {
      success: true,
      message: "Submission deleted successfully",
      deletedFileInfo: fileInfo,
    };
  } catch (error) {
    console.error("[SERVER] Error deleting submission:", error);
    throw error;
  }
}

export async function getSubmissionsAction(assignmentId) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

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

    return {
      success: true,
      data: submissions,
    };
  } catch (error) {
    console.error("[SERVER] Error fetching submissions:", error);
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

    const username = session.user.username || session.user.id;
    const isAdvisor = await tprogData.isUserAdvisor(username);

    return { success: true, data: isAdvisor };
  } catch (error) {
    console.error("[SERVER] Error in isUserAdvisor:", error.message);
    return { success: false, message: error.message };
  }
}

export async function getAdvisorStudents() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    const username = session.user.username || session.user.id;
    const students = await tprogData.getAdvisorStudents(username);

    return { success: true, data: students };
  } catch (error) {
    console.error("[SERVER] Error in getAdvisorStudents:", error.message);
    return { success: false, message: error.message };
  }
}

export async function getMurobbiStudents() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    const username = session.user.username || session.user.id;
    const students = await tprogData.getMurobbiStudents(username);

    return { success: true, data: students };
  } catch (error) {
    console.error("[SERVER] Error in getMurobbiStudents:", error.message);
    return { success: false, message: error.message };
  }
}

export async function getStudentClasses(studentId) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    const username = session.user.username || session.user.id;

    const [advisorStudents, murobbiStudents] = await Promise.all([
      tprogData.getAdvisorStudents(username),
      tprogData.getMurobbiStudents(username),
    ]);

    const isAdvisor = advisorStudents.some((s) => s.id === studentId);
    const isMurobbi = murobbiStudents.some((s) => s.id === studentId);

    if (!isAdvisor && !isMurobbi) {
      throw new Error(
        "You are not authorized to view this student's information"
      );
    }

    const classes = await tprogData.getStudentClasses(studentId);
    return { success: true, data: classes };
  } catch (error) {
    console.error("[SERVER] Error in getStudentClasses:", error.message);
    return { success: false, message: error.message };
  }
}

export async function getStudentAssignments(studentId, classId) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    const username = session.user.username || session.user.id;

    const [advisorStudents, murobbiStudents] = await Promise.all([
      tprogData.getAdvisorStudents(username),
      tprogData.getMurobbiStudents(username),
    ]);

    const isAdvisor = advisorStudents.some((s) => s.id === studentId);
    const isMurobbi = murobbiStudents.some((s) => s.id === studentId);

    if (!isAdvisor && !isMurobbi) {
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
    console.error("[SERVER] Error in getStudentAssignments:", error.message);
    return { success: false, message: error.message };
  }
}

export async function getStudentAssignmentDetails(assignmentId, studentId) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    const username = session.user.username || session.user.id;

    const [advisorStudents, murobbiStudents] = await Promise.all([
      tprogData.getAdvisorStudents(username),
      tprogData.getMurobbiStudents(username),
    ]);

    const isAdvisor = advisorStudents.some((s) => s.id === studentId);
    const isMurobbi = murobbiStudents.some((s) => s.id === studentId);

    if (!isAdvisor && !isMurobbi) {
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
      "[SERVER] Error in getStudentAssignmentDetails:",
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

    const submission = await db("tprog_submission")
      .where("id", submissionId)
      .first();

    if (!submission) {
      throw new Error("Submission not found");
    }

    const username = session.user.username || session.user.id;

    const [advisorStudents, murobbiStudents] = await Promise.all([
      tprogData.getAdvisorStudents(username),
      tprogData.getMurobbiStudents(username),
    ]);

    const isAdvisor = advisorStudents.some(
      (s) => s.id === submission.user_id
    );
    const isMurobbi = murobbiStudents.some(
      (s) => s.id === submission.user_id
    );

    if (!isAdvisor && !isMurobbi) {
      throw new Error("You are not authorized to update this submission");
    }

    await tprogData.updateSubmissionStatus(submissionId, status, comments);
    revalidatePath(`/tprog`);

    return { success: true, message: "Submission status updated successfully" };
  } catch (error) {
    console.error("[SERVER] Error in updateSubmissionStatus:", error.message);
    return { success: false, message: error.message };
  }
}
