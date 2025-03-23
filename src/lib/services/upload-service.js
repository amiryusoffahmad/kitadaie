import fs from "fs";
import path from "path";
import { UploadModel } from "../models/upload";

/**
 * Service for handling file uploads
 */
export const UploadService = {
  /**
   * Save file to disk and create database record
   * @param {Object} file - File object (from multer or formidable)
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} - Saved upload record
   */
  async saveFile(file, metadata = {}) {
    // Extract file information
    const {
      originalname,
      filename = Date.now() + "-" + originalname,
      mimetype,
      size,
      buffer,
      path: tempPath,
    } = file;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename if not provided
    const finalFilename =
      filename || `${Date.now()}-${originalname.replace(/\s+/g, "-")}`;
    const filePath = path.join(uploadsDir, finalFilename);

    // Save file to disk
    if (buffer) {
      fs.writeFileSync(filePath, buffer);
    } else if (tempPath) {
      // Copy from temp path if provided
      fs.copyFileSync(tempPath, filePath);
      // Optionally remove temp file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }

    // Create database record
    const uploadData = {
      filename: finalFilename,
      original_filename: originalname,
      path: `/uploads/${finalFilename}`,
      size,
      mimetype,
      ...metadata,
    };

    const id = await UploadModel.create(uploadData);
    return { id, ...uploadData };
  },

  /**
   * Delete file from disk and database
   * @param {number} id - Upload ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFile(id) {
    try {
      const upload = await UploadModel.getById(id);
      if (!upload) return false;

      // Delete file from disk
      const filePath = path.join(process.cwd(), "public", upload.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete database record
      await UploadModel.delete(id);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  },

  /**
   * Get file path for an upload
   * @param {number} id - Upload ID
   * @returns {Promise<string|null>} - File path or null if not found
   */
  async getFilePath(id) {
    const upload = await UploadModel.getById(id);
    return upload ? upload.path : null;
  },
};
