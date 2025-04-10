"use client";

// Constants
const UPLOAD_API_URL =
  process.env.NEXT_PUBLIC_UPLOAD_API_URL || "http://localhost:4000";
const API_ENDPOINT = "/api/admin/tprog";

/**
 * Get the highest file ID from the upload API
 * @returns {Promise<number>} The highest file ID
 */
async function getHighestFileId() {
  try {
    const url = `${UPLOAD_API_URL}/api/uploads`;
    console.log("[ADMIN] Fetching existing uploads to determine highest ID");

    const response = await fetch(url);
    if (!response.ok) {
      console.warn("[ADMIN] Failed to fetch uploads:", response.statusText);
      return 0; // Default to 0 if we can't fetch
    }

    const data = await response.json();
    if (!data || !data.uploads || !Array.isArray(data.uploads)) {
      console.warn(
        "[ADMIN] Unexpected response format from uploads API:",
        data
      );
      return 0;
    }

    // Find the highest ID
    let highestId = 0;
    data.uploads.forEach((upload) => {
      if (upload.id && !isNaN(upload.id)) {
        const id = parseInt(upload.id, 10);
        if (id > highestId) {
          highestId = id;
        }
      }
    });

    console.log("[ADMIN] Highest file ID found:", highestId);
    return highestId;
  } catch (error) {
    console.error("[ADMIN] Error fetching highest file ID:", error);
    return 0; // Default to 0 if we encounter an error
  }
}

/**
 * File upload function for assignment instructions
 * @param {File} file - The file to upload
 * @returns {Promise<Object>} The upload result with file metadata
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", "assignment_instruction"); // Categorize the file

  // Get the highest file ID and increment it for consistent numbering
  let nextFileId;
  try {
    const highestId = await getHighestFileId();
    nextFileId = highestId + 1;
    console.log("[ADMIN] Next file ID will be:", nextFileId);

    // Add the next file ID to the form data
    formData.append("fileId", nextFileId.toString());
  } catch (error) {
    console.error("[ADMIN] Error setting next file ID:", error);
    // Continue without setting a custom ID
  }

  const url = `${UPLOAD_API_URL}/upload`;
  console.log("[ADMIN] Uploading to URL:", url);
  console.log(
    "[ADMIN] Uploading file:",
    file.name,
    "size:",
    file.size,
    "type:",
    file.type
  );

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[ADMIN] Upload failed with status:",
        response.status,
        response.statusText
      );
      console.error("[ADMIN] Error response:", errorText);
      throw new Error(`Upload failed: ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    console.log("[ADMIN] Upload response data:", JSON.stringify(data, null, 2));

    // Get the file path from the response
    let filePath = data.filePath || data.path || "";
    console.log("[ADMIN] Original file path from response:", filePath);

    // Normalize the path format to ensure consistency
    if (!filePath.startsWith("/uploads/") && filePath.includes("/uploads/")) {
      // If the path includes /uploads/ somewhere in the middle, extract that part
      const parts = filePath.split("/uploads/");
      filePath = "/uploads/" + parts[parts.length - 1];
    } else if (filePath.startsWith("uploads/")) {
      // If it starts with uploads/ without the leading slash, add it
      filePath = "/" + filePath;
    }

    console.log("[ADMIN] Normalized file path:", filePath);

    // Determine the file ID - use our incremented ID if available
    let fileId;

    if (nextFileId) {
      // Use our pre-determined next ID
      fileId = nextFileId;
      console.log("[ADMIN] Using pre-determined next ID:", fileId);
    }
    // Otherwise check if we have a numeric ID directly from the server
    else if (data.id && !isNaN(data.id)) {
      fileId = parseInt(data.id, 10);
      console.log("[ADMIN] Using numeric ID directly from server:", fileId);
    }
    // If not, check if fileId is numeric
    else if (data.fileId && !isNaN(data.fileId)) {
      fileId = parseInt(data.fileId, 10);
      console.log("[ADMIN] Using numeric fileId from server:", fileId);
    }
    // Otherwise, try to extract a numeric prefix from the filename
    else {
      const filename =
        data.fileId || data.filename || filePath.split("/").pop();
      const numericMatch = filename.match(/^(\d+)/);
      if (numericMatch && numericMatch[1]) {
        fileId = parseInt(numericMatch[1], 10);
        console.log("[ADMIN] Extracted numeric ID from filename:", fileId);
      } else {
        // If we can't extract a numeric ID, generate a timestamp-based ID instead of using the filename
        fileId = Date.now();
        console.log("[ADMIN] Generated numeric timestamp ID:", fileId);
        console.warn(
          "[ADMIN] Could not extract a numeric ID from filename. Using generated timestamp ID instead."
        );
      }
    }

    // Store original filename for display purposes
    const originalFilename =
      data.fileName || data.original_filename || file.name;

    // Normalize the response data
    return {
      filePath: filePath,
      fileName: originalFilename,
      fileSize: data.size || file.size || 0,
      mimeType: data.mimeType || data.mimetype || file.type || "",
      fileId: fileId,
      id: fileId, // Include both for compatibility
      originalFilename: originalFilename, // Keep the original filename separately
      rawResponse: data, // Include the raw response for debugging
      message: data.message || "File uploaded successfully",
    };
  } catch (error) {
    console.error("[ADMIN] Upload error:", error);
    throw error;
  }
}

/**
 * Helper function to download files
 * @param {string} filePath - The path to the file
 * @returns {Promise<boolean>} Success status
 */
export async function downloadFile(filePath) {
  if (!filePath) {
    throw new Error("No file path provided");
  }

  // Construct the download URL - if the path doesn't start with http/https, assume it's relative
  let downloadUrl = filePath;
  if (
    !downloadUrl.startsWith("http://") &&
    !downloadUrl.startsWith("https://")
  ) {
    // For relative paths, prepend the upload URL base
    downloadUrl = `${UPLOAD_API_URL}${filePath}`;
  }

  console.log("[ADMIN] Downloading file from:", downloadUrl);

  try {
    // Create a temporary link and simulate a click to download the file
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", ""); // This will use the server's suggested filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error("[ADMIN] Download error:", error);
    throw error;
  }
}

/**
 * Handles file download for an assignment
 * @param {Object} assignment - The assignment with file information
 * @returns {Promise<void>}
 */
export async function handleFileDownload(assignment) {
  // Skip if no file information is available
  if (!assignment || (!assignment.file_path && !assignment.file_id)) {
    throw new Error("No instruction file available for download");
  }

  console.log(
    "[ADMIN] Attempting to download instruction file for assignment:",
    assignment.id
  );

  // Log what file information we have
  if (assignment.file_id) {
    console.log("[ADMIN] Assignment has file_id:", assignment.file_id);
  }
  if (assignment.file_path) {
    console.log("[ADMIN] Assignment has file_path:", assignment.file_path);
  }

  // If we have a file_id, we should use a dedicated endpoint to get the file
  if (assignment.file_id) {
    // First try direct download if we have the path
    if (assignment.file_path) {
      console.log(
        "[ADMIN] Attempting download using direct path:",
        assignment.file_path
      );
      await downloadFile(assignment.file_path);
    } else {
      // Otherwise use the API to get the file info
      const url = `${UPLOAD_API_URL}/api/uploads/${assignment.file_id}`;
      console.log("[ADMIN] Fetching file info using ID:", url);

      // Fetch the file metadata first to get the actual path
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to retrieve file information: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("[ADMIN] File info response:", data);

      if (data && data.upload && data.upload.path) {
        // Now download using the path
        console.log("[ADMIN] Got file path from API:", data.upload.path);
        await downloadFile(data.upload.path);
      } else if (data && data.path) {
        // Alternative format
        console.log("[ADMIN] Got file path directly:", data.path);
        await downloadFile(data.path);
      } else {
        throw new Error(
          "File information is incomplete or in unexpected format"
        );
      }
    }
  } else if (assignment.file_path) {
    // Fallback to the direct path approach
    console.log(
      "[ADMIN] Falling back to direct path download:",
      assignment.file_path
    );
    await downloadFile(assignment.file_path);
  } else {
    throw new Error("No file information available for download");
  }
}

/**
 * Helper function to format dates
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Class management functions

/**
 * Fetch all classes
 * @returns {Promise<Array>} List of classes
 */
export async function fetchClasses() {
  try {
    const response = await fetch(`${API_ENDPOINT}/classes`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch classes");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error;
  }
}

/**
 * Create a new class
 * @param {Object} classData - The class data
 * @returns {Promise<Object>} The created class
 */
export async function createClass(classData) {
  try {
    // Create a properly formatted payload with correct field names
    const payload = {
      name: classData.name,
      class_code: classData.code, // Map 'code' to 'class_code'
      description: classData.description || "",
    };

    const response = await fetch(`${API_ENDPOINT}/classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create class");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating class:", error);
    throw error;
  }
}

/**
 * Update an existing class
 * @param {number|string} classId - The class ID
 * @param {Object} classData - The updated class data
 * @returns {Promise<Object>} The updated class
 */
export async function updateClass(classId, classData) {
  try {
    const response = await fetch(`${API_ENDPOINT}/classes/${classId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(classData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update class");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating class:", error);
    throw error;
  }
}

/**
 * Delete a class
 * @param {number|string} classId - The class ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteClass(classId) {
  try {
    const response = await fetch(`${API_ENDPOINT}/classes/${classId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete class");
    }

    return true;
  } catch (error) {
    console.error("Error deleting class:", error);
    throw error;
  }
}

// Assignment management functions

/**
 * Fetch assignments for a class
 * @param {number|string} classId - The class ID
 * @returns {Promise<Array>} List of assignments
 */
export async function fetchAssignments(classId) {
  try {
    const response = await fetch(
      `${API_ENDPOINT}/classes/${classId}/assignments`
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch assignments");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching assignments:", error);
    throw error;
  }
}

/**
 * Create a new assignment
 * @param {number|string} classId - The class ID
 * @param {Object} assignmentData - The assignment data
 * @returns {Promise<Object>} The created assignment
 */
export async function createAssignment(classId, assignmentData) {
  try {
    // First, handle file upload if a file is provided
    let fileUploadResult = null;
    if (assignmentData.file) {
      console.log("[ADMIN] Assignment has file to upload, processing first...");
      fileUploadResult = await uploadFile(assignmentData.file);
      console.log("[ADMIN] File upload completed:", fileUploadResult);

      // Verify we received a valid numeric ID
      if (!fileUploadResult.fileId || isNaN(fileUploadResult.fileId)) {
        console.warn(
          "[ADMIN] Upload didn't return a valid numeric ID. Using fallback."
        );
        // Generate a numeric timestamp-based ID as a fallback
        fileUploadResult.fileId = Date.now();
        console.log(
          "[ADMIN] Using generated timestamp as file ID:",
          fileUploadResult.fileId
        );
      }
    }

    // Create a proper payload with the basic assignment data
    const payload = {
      title: assignmentData.title,
      instructions: assignmentData.instructions || "",
      due_date: assignmentData.due_date,
      is_published: assignmentData.is_published || true,
    };

    // Add file ID to payload if we have one from the upload
    if (fileUploadResult && fileUploadResult.fileId) {
      // Ensure file_id is numeric and properly formatted as a number, not a string
      payload.file_id =
        typeof fileUploadResult.fileId === "number"
          ? fileUploadResult.fileId
          : parseInt(fileUploadResult.fileId, 10);

      console.log(
        "[ADMIN] Using file_id from upload:",
        payload.file_id,
        "Type:",
        typeof payload.file_id
      );
    }
    // Otherwise, check if a file_id was provided directly in the assignment data
    else if (assignmentData.file_id) {
      // Ensure file_id is numeric
      if (
        typeof assignmentData.file_id === "number" ||
        !isNaN(assignmentData.file_id)
      ) {
        payload.file_id =
          typeof assignmentData.file_id === "number"
            ? assignmentData.file_id
            : parseInt(assignmentData.file_id, 10);

        console.log(
          "[ADMIN] Using provided file_id:",
          payload.file_id,
          "Type:",
          typeof payload.file_id
        );
      } else {
        console.warn(
          "[ADMIN] Provided file_id is not numeric. Skipping file_id in payload:",
          assignmentData.file_id
        );
        // Do not include non-numeric file_id in the payload
      }
    } else {
      // If no file_id is provided, explicitly set to null
      console.log("[ADMIN] No file_id provided, setting to null in payload");
      payload.file_id = null;
    }

    // Log the final payload for debugging
    console.log(
      "[ADMIN] Creating assignment with payload:",
      JSON.stringify(payload, null, 2)
    );

    // Now create the assignment with the file ID
    console.log(
      `[ADMIN] Sending POST request to: ${API_ENDPOINT}/classes/${classId}/assignments`
    );
    const response = await fetch(
      `${API_ENDPOINT}/classes/${classId}/assignments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    console.log("[ADMIN] Create response status:", response.status);

    // Get response text first for better error logging
    const responseText = await response.text();
    console.log("[ADMIN] Response text:", responseText);

    if (!response.ok) {
      let errorData;
      try {
        // Try to parse the response as JSON if possible
        errorData = JSON.parse(responseText);
      } catch (e) {
        // If it's not valid JSON, use the text directly
        throw new Error(
          `Failed to create assignment: ${response.status} ${response.statusText}. ${responseText}`
        );
      }

      throw new Error(
        errorData.error || `Failed to create assignment: ${response.status}`
      );
    }

    // Parse the responseText to get the created assignment
    let createdAssignment;
    try {
      createdAssignment = JSON.parse(responseText);
    } catch (e) {
      console.error("[ADMIN] Error parsing response JSON:", e);
      throw new Error("Invalid response format from server");
    }

    // Add file metadata for UI display if applicable
    if (fileUploadResult) {
      createdAssignment.fileName =
        fileUploadResult.fileName || assignmentData.fileName;
      createdAssignment.filePath = fileUploadResult.filePath;
    }

    return createdAssignment;
  } catch (error) {
    console.error("Error creating assignment:", error);
    throw error;
  }
}

/**
 * Update an existing assignment
 * @param {number|string} classId - The class ID
 * @param {number|string} assignmentId - The assignment ID
 * @param {Object} assignmentData - The updated assignment data
 * @returns {Promise<Object>} The updated assignment
 */
export async function updateAssignment(classId, assignmentId, assignmentData) {
  try {
    // First, handle file upload if a new file is provided
    let fileUploadResult = null;
    if (assignmentData.file) {
      console.log(
        "[ADMIN] Assignment has new file to upload, processing first..."
      );
      fileUploadResult = await uploadFile(assignmentData.file);
      console.log("[ADMIN] File upload completed:", fileUploadResult);

      // Verify we received a valid numeric ID
      if (!fileUploadResult.fileId || isNaN(fileUploadResult.fileId)) {
        console.warn(
          "[ADMIN] Upload didn't return a valid numeric ID. Using fallback."
        );
        // Generate a numeric timestamp-based ID as a fallback
        fileUploadResult.fileId = Date.now();
        console.log(
          "[ADMIN] Using generated timestamp as file ID:",
          fileUploadResult.fileId
        );
      }
    }

    // Create a proper payload with only the necessary fields
    const payload = {
      title: assignmentData.title,
      instructions: assignmentData.instructions || "",
      due_date: assignmentData.due_date,
      is_published: assignmentData.is_published || true,
    };

    // Add file ID to payload if we have one from the upload
    if (fileUploadResult && fileUploadResult.fileId) {
      // Ensure file_id is numeric and properly formatted as a number, not a string
      payload.file_id =
        typeof fileUploadResult.fileId === "number"
          ? fileUploadResult.fileId
          : parseInt(fileUploadResult.fileId, 10);

      console.log(
        "[ADMIN] Using file_id from new upload:",
        payload.file_id,
        "Type:",
        typeof payload.file_id
      );
    }
    // Otherwise, use the existing file_id if provided
    else if (assignmentData.file_id) {
      // Ensure file_id is numeric
      if (
        typeof assignmentData.file_id === "number" ||
        !isNaN(assignmentData.file_id)
      ) {
        payload.file_id =
          typeof assignmentData.file_id === "number"
            ? assignmentData.file_id
            : parseInt(assignmentData.file_id, 10);

        console.log(
          "[ADMIN] Using existing file_id:",
          payload.file_id,
          "Type:",
          typeof payload.file_id
        );
      } else {
        console.warn(
          "[ADMIN] Existing file_id is not numeric. Skipping file_id in payload:",
          assignmentData.file_id
        );
        // Do not include non-numeric file_id in the payload
      }
    } else {
      // If no file_id is provided, explicitly set to null to clear any existing file
      console.log("[ADMIN] No file_id provided, setting to null in payload");
      payload.file_id = null;
    }

    // Log the final payload for debugging
    console.log(
      "[ADMIN] Updating assignment with payload:",
      JSON.stringify(payload, null, 2)
    );

    // Now update the assignment with the file ID
    console.log(
      `[ADMIN] Sending PUT request to: ${API_ENDPOINT}/classes/${classId}/assignments/${assignmentId}`
    );
    const response = await fetch(
      `${API_ENDPOINT}/classes/${classId}/assignments/${assignmentId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    console.log("[ADMIN] Update response status:", response.status);

    // Get response text first for better error logging
    const responseText = await response.text();
    console.log("[ADMIN] Response text:", responseText);

    if (!response.ok) {
      let errorData;
      try {
        // Try to parse the response as JSON if possible
        errorData = JSON.parse(responseText);
      } catch (e) {
        // If it's not valid JSON, use the text directly
        throw new Error(
          `Failed to update assignment: ${response.status} ${response.statusText}. ${responseText}`
        );
      }

      throw new Error(
        errorData.error || `Failed to update assignment: ${response.status}`
      );
    }

    // Parse the responseText to get the updated assignment
    let updatedAssignment;
    try {
      updatedAssignment = JSON.parse(responseText);
    } catch (e) {
      console.error("[ADMIN] Error parsing response JSON:", e);
      throw new Error("Invalid response format from server");
    }

    // Add file metadata for UI display if applicable
    if (fileUploadResult) {
      updatedAssignment.fileName = fileUploadResult.fileName;
      updatedAssignment.filePath = fileUploadResult.filePath;
    } else if (assignmentData.fileName) {
      updatedAssignment.fileName = assignmentData.fileName;
    }

    return updatedAssignment;
  } catch (error) {
    console.error("Error updating assignment:", error);
    throw error;
  }
}

/**
 * Delete an assignment
 * @param {number|string} classId - The class ID
 * @param {number|string} assignmentId - The assignment ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteAssignment(classId, assignmentId) {
  try {
    const response = await fetch(
      `${API_ENDPOINT}/classes/${classId}/assignments/${assignmentId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete assignment");
    }

    return true;
  } catch (error) {
    console.error("Error deleting assignment:", error);
    throw error;
  }
}
