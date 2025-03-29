// Dynamic imports to avoid bundling server code with client code
import { toast } from "sonner";
import config from "@/lib/config";
import {
  getAssignmentsForClassAction,
  submitAssignmentAction,
  getClassDetailsAction,
  getAssignmentDetailsAction,
  getSubmissionsAction,
  deleteSubmissionAction,
} from "@/server/actions/tprog-actions";

let tprogActions = null;

// Export the getActions function so it can be used in components
export async function getActions() {
  if (!tprogActions) {
    try {
      // Try importing the default export first
      const module = await import("@/server/actions/tprog-actions");
      tprogActions = module.default || module;

      // Log what we got to help debug
      console.log("[API] Imported tprog-actions:", Object.keys(tprogActions));

      if (!tprogActions) {
        throw new Error("Server actions module is empty");
      }
    } catch (error) {
      console.error("[API] Error importing tprog-actions:", error);
      throw new Error("Failed to import server actions: " + error.message);
    }
  }
  return tprogActions;
}

// Class related functions
export async function getEnrolledClasses() {
  try {
    const actions = await getActions();
    const response = await actions.getEnrolledClasses();

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch enrolled classes");
    }

    return response.data || [];
  } catch (error) {
    console.error("Error fetching enrolled classes:", error);
    toast.error(error.message || "Failed to fetch enrolled classes");
    return [];
  }
}

export async function enrollInClass(classCode) {
  try {
    const actions = await getActions();
    const response = await actions.enrollInClass(classCode);

    if (!response.success) {
      throw new Error(response.message || "Failed to enroll in class");
    }

    toast.success(response.message || "Successfully enrolled in class");
    return response;
  } catch (error) {
    console.error("Error enrolling in class:", error);
    toast.error(error.message || "Failed to enroll in class");
    throw error;
  }
}

export async function getClassDetails(classId) {
  try {
    console.log("[API] getClassDetails called with classId:", classId);

    if (!classId) {
      console.error("[API] Invalid classId:", classId);
      return null;
    }

    const actions = await getActions();
    const response = await actions.getClassDetails(classId.toString());

    console.log("[API] getClassDetails response:", response);

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch class details");
    }

    return response.data || null;
  } catch (error) {
    console.error("[API] Error fetching class details:", error);
    toast.error(error.message || "Failed to fetch class details");
    return null;
  }
}

// Assignment related functions
export async function getAssignments(classId) {
  try {
    console.log("[API] getAssignments called with classId:", classId);

    if (!classId) {
      console.error("[API] Invalid classId:", classId);
      return [];
    }

    const actions = await getActions();
    const response = await actions.getAssignmentsForClass(classId.toString());
    console.log("[API] getAssignments response:", response);

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch assignments");
    }

    return response.data || [];
  } catch (error) {
    console.error("[API] Error fetching assignments:", error);
    toast.error(error.message || "Failed to fetch assignments");
    return [];
  }
}

export async function getAssignmentDetails(assignmentId) {
  try {
    console.log(
      "[API] getAssignmentDetails called with assignmentId:",
      assignmentId
    );

    if (!assignmentId) {
      console.error("[API] Invalid assignmentId:", assignmentId);
      return null;
    }

    const actions = await getActions();

    // Check if getAssignmentDetails exists in the actions object
    if (!actions || typeof actions.getAssignmentDetails !== "function") {
      console.error(
        "[API] getAssignmentDetails function not found in actions:",
        actions
      );
      throw new Error("Server action getAssignmentDetails is not available");
    }

    const response = await actions.getAssignmentDetails(assignmentId);

    console.log("[API] getAssignmentDetails response:", response);

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch assignment details");
    }

    return response.data || null;
  } catch (error) {
    console.error("[API] Error fetching assignment details:", error);
    // Log the full error stack for better debugging
    if (error.stack) {
      console.error("[API] Error stack:", error.stack);
    }

    toast.error(error.message || "Failed to fetch assignment details");
    throw error;
  }
}

// Submission related functions
export async function submitAssignmentWithFile(assignmentId, file) {
  try {
    // First, upload the file to the custom upload API
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "assignment");

    console.log(
      "[API] Uploading file to custom API endpoint:",
      config.uploadApiUrl
    );

    let uploadResponse;
    try {
      // Use the custom API endpoint for uploads from config
      uploadResponse = await fetch(config.uploadApiUrl, {
        method: "POST",
        body: formData,
      });
    } catch (networkError) {
      console.error("[API] Network error during file upload:", networkError);
      throw new Error(
        `Upload server not available. Please check that the upload server at ${config.uploadApiUrl} is running.`
      );
    }

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("[API] Upload response error:", errorText);
      throw new Error(`Failed to upload file: ${errorText}`);
    }

    let uploadResult;
    try {
      uploadResult = await uploadResponse.json();
    } catch (parseError) {
      console.error("[API] Error parsing upload response:", parseError);
      const responseText = await uploadResponse.text();
      console.error("[API] Raw response:", responseText);
      throw new Error(
        "Failed to parse upload response. The server may not be configured correctly."
      );
    }

    if (!uploadResult || !uploadResult.fileId) {
      console.error("[API] Invalid upload result:", uploadResult);
      throw new Error(
        "Invalid response from upload server. File ID is missing."
      );
    }

    // Get the fileId from the upload result
    const fileId = uploadResult.fileId;
    console.log("[API] File uploaded successfully, ID:", fileId);

    // Then submit the assignment with the file ID
    const actions = await getActions();
    const response = await actions.submitAssignmentAction(assignmentId, fileId);

    if (!response.success) {
      throw new Error(response.message || "Failed to submit assignment");
    }

    toast.success(response.message || "Assignment submitted successfully");

    return response;
  } catch (error) {
    console.error("[API] Error submitting assignment:", error);
    toast.error(error.message || "Failed to submit assignment");
    throw error;
  }
}

// Direct server action for submitting an assignment with a file ID
export async function submitAssignment(assignmentId, fileId) {
  try {
    console.log(
      "[API] Submitting assignment with ID and fileId:",
      assignmentId,
      fileId
    );

    // Validate the assignment ID
    if (!assignmentId) {
      const error = new Error("Assignment ID is required");
      console.error("[API] Invalid assignmentId:", error);
      toast.error("Cannot submit: Missing assignment ID");
      return { success: false, message: error.message };
    }

    // Validate the file ID
    if (!fileId) {
      const error = new Error("File ID is required");
      console.error("[API] Invalid fileId:", error);
      toast.error("Cannot submit: Missing file ID");
      return { success: false, message: error.message };
    }

    // Pass the fileId directly to the server action
    // The server action will handle creating/finding the DB record
    const actions = await getActions();
    const response = await actions.submitAssignmentAction(assignmentId, fileId);

    if (!response.success) {
      throw new Error(response.message || "Failed to submit assignment");
    }

    toast.success(response.message || "Assignment submitted successfully");
    return response;
  } catch (error) {
    console.error("[API] Error submitting assignment:", error);
    toast.error(error.message || "Failed to submit assignment");
    return { success: false, message: error.message };
  }
}

// Delete a submission
export async function deleteSubmission(submissionId) {
  try {
    if (!submissionId) {
      throw new Error("Submission ID is required");
    }

    const actions = await getActions();
    const response = await actions.deleteSubmissionAction(submissionId);

    if (!response.success) {
      throw new Error(response.message || "Failed to delete submission");
    }

    toast.success(response.message || "Submission deleted successfully");
    return response;
  } catch (error) {
    console.error("Error deleting submission:", error);
    toast.error(error.message || "Failed to delete submission");
    throw error;
  }
}

/**
 * Downloads a submission file
 * @param {number} submissionId - The ID of the submission to download
 * @returns {Promise<{success: boolean, downloadUrl: string}>} Result with download URL
 */
export async function downloadSubmission(submissionId) {
  try {
    if (!submissionId) {
      throw new Error("Submission ID is required");
    }

    // This would be a direct call to download the file
    window.open(`/api/submissions/${submissionId}/download`, "_blank");
    return { success: true };
  } catch (error) {
    console.error("Error downloading submission:", error);
    toast.error(error.message || "Failed to download submission");
    throw error;
  }
}

// Get submissions for an assignment
export async function getSubmissions(assignmentId) {
  try {
    console.log("[API] getSubmissions called with assignmentId:", assignmentId);

    if (!assignmentId) {
      console.error("[API] Invalid assignmentId:", assignmentId);
      return [];
    }

    const actions = await getActions();
    const response = await actions.getSubmissions(assignmentId);

    console.log("[API] getSubmissions response:", response);

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch submissions");
    }

    return response.data || [];
  } catch (error) {
    console.error("[API] Error fetching submissions:", error);
    toast.error(error.message || "Failed to fetch submissions");
    return [];
  }
}

// Advisor-related functions
export async function isUserAdvisor() {
  try {
    console.log("[API] Checking if user is an advisor");
    const actions = await getActions();
    const response = await actions.isUserAdvisor();

    console.log("[API] isUserAdvisor response:", response);

    if (!response.success) {
      throw new Error(response.message || "Failed to check advisor status");
    }

    return response.data || false;
  } catch (error) {
    console.error("[API] Error checking advisor status:", error);
    // Don't show toast for this operation as it's a background check
    return false;
  }
}

export async function getAdvisorStudents() {
  try {
    const actions = await getActions();
    const response = await actions.getAdvisorStudents();

    if (!response.success) {
      throw new Error(response.message || "Failed to get advisor students");
    }

    return response.data || [];
  } catch (error) {
    console.error("[API] Error fetching advisor students:", error);
    toast.error(error.message || "Failed to fetch students");
    return [];
  }
}

export async function getMurobbiStudents() {
  try {
    const actions = await getActions();
    const response = await actions.getMurobbiStudents();

    if (!response.success) {
      throw new Error(response.message || "Failed to get murobbi students");
    }

    return response.data || [];
  } catch (error) {
    console.error("[API] Error fetching murobbi students:", error);
    toast.error(error.message || "Failed to fetch murobbi students");
    return [];
  }
}

export async function getStudentClasses(studentId) {
  try {
    if (!studentId) {
      console.error("[API] Invalid studentId:", studentId);
      return [];
    }

    const actions = await getActions();
    const response = await actions.getStudentClasses(studentId);

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch student classes");
    }

    return response.data || [];
  } catch (error) {
    console.error("[API] Error fetching student classes:", error);
    toast.error(error.message || "Failed to fetch student classes");
    return [];
  }
}

export async function getStudentAssignments(studentId, classId) {
  try {
    if (!studentId || !classId) {
      console.error(
        "[API] Invalid parameters. studentId:",
        studentId,
        "classId:",
        classId
      );
      return [];
    }

    const actions = await getActions();
    const response = await actions.getStudentAssignments(
      studentId,
      classId.toString()
    );

    if (!response.success) {
      throw new Error(
        response.message || "Failed to fetch student assignments"
      );
    }

    return response.data || [];
  } catch (error) {
    console.error("[API] Error fetching student assignments:", error);
    toast.error(error.message || "Failed to fetch student assignments");
    return [];
  }
}

export async function getStudentAssignmentDetails(assignmentId, studentId) {
  try {
    if (!assignmentId || !studentId) {
      console.error(
        "[API] Invalid parameters. assignmentId:",
        assignmentId,
        "studentId:",
        studentId
      );
      return null;
    }

    const actions = await getActions();
    const response = await actions.getStudentAssignmentDetails(
      assignmentId,
      studentId
    );

    if (!response.success) {
      throw new Error(
        response.message || "Failed to fetch student assignment details"
      );
    }

    return response.data || null;
  } catch (error) {
    console.error("[API] Error fetching student assignment details:", error);
    toast.error(error.message || "Failed to fetch student assignment details");
    return null;
  }
}

export async function updateSubmissionStatus(submissionId, status, comments) {
  try {
    if (!submissionId || !status) {
      console.error(
        "[API] Invalid parameters. submissionId:",
        submissionId,
        "status:",
        status
      );
      throw new Error("Invalid parameters for updating submission status");
    }

    const actions = await getActions();
    const response = await actions.updateSubmissionStatus(
      submissionId,
      status,
      comments || ""
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to update submission status");
    }

    toast.success(response.message || "Submission status updated successfully");
    return response;
  } catch (error) {
    console.error("[API] Error updating submission status:", error);
    toast.error(error.message || "Failed to update submission status");
    throw error;
  }
}

export const tprogApi = {
  getAssignments,
  getClassDetails,
  submitAssignmentWithFile,
  submitAssignment,
  getAssignmentDetails,
  getSubmissions,
  deleteSubmission,
  downloadSubmission,
};
