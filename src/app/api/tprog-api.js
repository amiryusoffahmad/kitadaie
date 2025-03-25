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
    toast({
      title: "Error",
      description: error.message || "Failed to fetch enrolled classes",
      variant: "destructive",
    });
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

    toast({
      title: "Success",
      description: response.message || "Successfully enrolled in class",
    });

    return response;
  } catch (error) {
    console.error("Error enrolling in class:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to enroll in class",
      variant: "destructive",
    });
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
    toast({
      title: "Error",
      description: error.message || "Failed to fetch class details",
      variant: "destructive",
    });
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
    toast({
      title: "Error",
      description: error.message || "Failed to fetch assignments",
      variant: "destructive",
    });
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

    toast({
      title: "Error",
      description: error.message || "Failed to fetch assignment details",
      variant: "destructive",
    });
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

    toast({
      title: "Success",
      description: response.message || "Assignment submitted successfully",
    });

    return response;
  } catch (error) {
    console.error("[API] Error submitting assignment:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to submit assignment",
      variant: "destructive",
    });
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
    console.log(`[CLIENT API] Deleting submission: ${submissionId}`);

    if (!submissionId) {
      console.error(
        "[CLIENT API] Invalid submission ID for deletion:",
        submissionId
      );
      toast.error("Cannot delete: Invalid submission ID");
      return { success: false };
    }

    // Call the server action to delete the submission
    const result = await deleteSubmissionAction(submissionId);

    if (result.success) {
      toast.success("Submission deleted successfully");
      return result;
    } else {
      toast.error(result.message || "Failed to delete submission");
      return { success: false };
    }
  } catch (error) {
    console.error("[CLIENT API] Error deleting submission:", error);
    toast.error(`Failed to delete submission: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Downloads a submission file
 * @param {number} submissionId - The ID of the submission to download
 * @returns {Promise<{success: boolean, downloadUrl: string}>} Result with download URL
 */
export async function downloadSubmission(submissionId) {
  try {
    console.log(`[CLIENT API] Downloading submission: ${submissionId}`);

    if (!submissionId) {
      console.error(
        "[CLIENT API] Invalid submission ID for download:",
        submissionId
      );
      toast.error("Cannot download: Invalid submission ID");
      return { success: false };
    }

    // Create the download URL using the submission ID
    const downloadUrl = `/api/tprog/download/${submissionId}`;

    // We don't actually fetch the file here - just return the URL
    // The actual download will happen when the browser navigates to this URL
    return {
      success: true,
      downloadUrl,
      message: "Download URL generated successfully",
    };
  } catch (error) {
    console.error("[CLIENT API] Error generating download URL:", error);
    toast.error(`Failed to download file: ${error.message}`);
    return { success: false, error: error.message };
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
    const response = await actions.getSubmissionsAction(assignmentId);

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
