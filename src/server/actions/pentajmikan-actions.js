"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PentajmikanModel } from "@/lib/models/pentajmikan";
import { UploadService } from "@/lib/services/upload-service";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Get the current user ID from session
 * @returns {Promise<string|null>} - User ID or null
 */
export async function getCurrentUserId() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session?.user?.id || null;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
}

/**
 * Create a new pentajmikan program
 * @param {Object} data - Program data
 * @returns {Promise<Object>} - Result with success flag and data/error
 */
export async function createPentajmikan(data) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Prepare data for insertion
    const pentajmikanData = {
      name: data.name,
      description: data.description || "",
      total_participants: data.total_participants || 0,
      date: new Date(data.date),
      niche: data.niche || "",
      image_id: data.image_id || null,
      created_by: userId,
    };

    // Create the program
    const programId = await PentajmikanModel.create(pentajmikanData);

    // Add participants if provided
    if (data.participants && Array.isArray(data.participants)) {
      for (const participantId of data.participants) {
        await PentajmikanModel.addParticipant(programId, participantId);
      }
    }

    revalidatePath("/user/pentajmikan");
    return { success: true, data: { id: programId } };
  } catch (error) {
    console.error("Error creating pentajmikan program:", error);
    return {
      success: false,
      error: error.message || "Failed to create program",
    };
  }
}

/**
 * Get all pentajmikan programs
 * @returns {Promise<Object>} - Result with success flag and data/error
 */
export async function getAllPentajmikan() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const programs = await PentajmikanModel.getAll();

    // Process programs to include image URLs
    const processedPrograms = await Promise.all(
      programs.map(async (program) => {
        // If there's an image_id, fetch detailed image information
        let imageUrl = null;
        if (program.image_id) {
          try {
            const imageInfo = await db("uploads")
              .where({ id: program.image_id })
              .first();
            if (imageInfo) {
              imageUrl = imageInfo.path;
            }
          } catch (imageError) {
            console.error(
              `Error fetching image details for program ${program.id}:`,
              imageError
            );
          }
        }

        return {
          ...program,
          image_url: imageUrl,
        };
      })
    );

    return { success: true, data: processedPrograms };
  } catch (error) {
    console.error("Error fetching pentajmikan programs:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch programs",
    };
  }
}

/**
 * Get pentajmikan program by ID
 * @param {number} id - Program ID
 * @returns {Promise<Object>} - Result with success flag and data/error
 */
export async function getPentajmikanById(id) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const program = await PentajmikanModel.getById(id);
    if (!program) {
      return { success: false, error: "Program not found" };
    }

    // Get participants
    const participants = await PentajmikanModel.getParticipants(id);

    // If there's an image_id, fetch detailed image information
    let imageUrl = null;
    if (program.image_id) {
      try {
        const imageInfo = await db("uploads")
          .where({ id: program.image_id })
          .first();
        if (imageInfo) {
          imageUrl = imageInfo.path;
        }
      } catch (imageError) {
        console.error("Error fetching image details:", imageError);
      }
    }

    return {
      success: true,
      data: {
        ...program,
        participants,
        image_url: imageUrl,
      },
    };
  } catch (error) {
    console.error(`Error fetching pentajmikan program ${id}:`, error);
    return {
      success: false,
      error: error.message || "Failed to fetch program",
    };
  }
}

/**
 * Update a pentajmikan program
 * @param {number} id - Program ID
 * @param {Object} data - Updated program data
 * @returns {Promise<Object>} - Result with success flag and data/error
 */
export async function updatePentajmikan(id, data) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if program exists and user is the creator
    const program = await PentajmikanModel.getById(id);
    if (!program) {
      return { success: false, error: "Program not found" };
    }

    if (program.created_by !== userId) {
      return {
        success: false,
        error: "You don't have permission to update this program",
      };
    }

    // Prepare data for update
    const updateData = {
      name: data.name,
      description: data.description || "",
      date: new Date(data.date),
      niche: data.niche || "",
    };

    // Update image if provided
    if (data.image_id) {
      updateData.image_id = data.image_id;
    }

    // Update the program
    await PentajmikanModel.update(id, updateData);

    // Handle participants if provided
    if (data.participants && Array.isArray(data.participants)) {
      // Get current participants
      const currentParticipants = await PentajmikanModel.getParticipants(id);
      const currentParticipantIds = currentParticipants.map((p) => p.id);

      // Add new participants
      for (const participantId of data.participants) {
        if (!currentParticipantIds.includes(participantId)) {
          await PentajmikanModel.addParticipant(id, participantId);
        }
      }

      // Remove participants not in the new list
      for (const currentId of currentParticipantIds) {
        if (!data.participants.includes(currentId)) {
          await PentajmikanModel.removeParticipant(id, currentId);
        }
      }
    }

    revalidatePath("/user/pentajmikan");
    revalidatePath(`/user/pentajmikan/${id}`);

    return { success: true };
  } catch (error) {
    console.error(`Error updating pentajmikan program ${id}:`, error);
    return {
      success: false,
      error: error.message || "Failed to update program",
    };
  }
}

/**
 * Delete a pentajmikan program
 * @param {number} id - Program ID
 * @returns {Promise<Object>} - Result with success flag and data/error
 */
export async function deletePentajmikan(id) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if program exists and user is the creator
    const program = await PentajmikanModel.getById(id);
    if (!program) {
      return { success: false, error: "Program not found" };
    }

    if (program.created_by !== userId) {
      return {
        success: false,
        error: "You don't have permission to delete this program",
      };
    }

    // Delete the program
    await PentajmikanModel.delete(id);

    // Delete image if exists
    if (program.image_id) {
      await UploadService.deleteFile(program.image_id);
    }

    revalidatePath("/user/pentajmikan");

    return { success: true };
  } catch (error) {
    console.error(`Error deleting pentajmikan program ${id}:`, error);
    return {
      success: false,
      error: error.message || "Failed to delete program",
    };
  }
}

/**
 * Get users for participant selection
 * @param {string} search - Search term
 * @returns {Promise<Object>} - Result with success flag and data/error
 */
export async function searchUsers(search) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    console.log("[SERVER] Searching users with query:", search);

    // Try with user table first, which is the correct table name
    let users = [];
    try {
      users = await db("user")
        .where("name", "like", `%${search}%`)
        .orWhere("email", "like", `%${search}%`)
        .select("id", "name", "email", "image as avatar")
        .limit(10);

      console.log("[SERVER] Found users:", users.length);
    } catch (error) {
      console.error("[SERVER] Error with user table search, error:", error);
      users = [];
    }

    return { success: true, data: users };
  } catch (error) {
    console.error("[SERVER] Error searching users:", error);
    return { success: false, error: error.message || "Failed to search users" };
  }
}
