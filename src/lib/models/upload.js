import { db } from "../db";

/**
 * Upload model for handling database operations related to file uploads
 */
const uploadsTable = "uploads";

export const UploadModel = {
  /**
   * Create a new upload record
   * @param {Object} data - Upload data
   * @returns {Promise<number>} - ID of the inserted record
   */
  async create(data) {
    const [id] = await db(uploadsTable).insert(data);
    return id;
  },

  /**
   * Get upload by ID
   * @param {number} id - Upload ID
   * @returns {Promise<Object|null>} - Upload record or null
   */
  async getById(id) {
    return await db(uploadsTable).where({ id }).first();
  },

  /**
   * Get uploads by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Array>} - Array of upload records
   */
  async getByUserId(userId) {
    return await db(uploadsTable).where({ user_id: userId });
  },

  /**
   * Get uploads by reference ID and document type
   * @param {number} referenceId - Reference ID
   * @param {string} documentType - Document type
   * @returns {Promise<Array>} - Array of upload records
   */
  async getByReference(referenceId, documentType) {
    return await db(uploadsTable).where({
      reference_id: referenceId,
      document_type: documentType,
    });
  },

  /**
   * Delete upload by ID
   * @param {number} id - Upload ID
   * @returns {Promise<number>} - Number of deleted records
   */
  async delete(id) {
    return await db(uploadsTable).where({ id }).delete();
  },
};
