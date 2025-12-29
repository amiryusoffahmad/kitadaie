"use server";

import { db } from "@/lib/db";

/**
 * Get all notification templates
 * @param {Object} options - Query options
 * @param {string} [options.createdBy] - Filter by creator user ID
 * @returns {Promise<Array>} - List of templates with creator info
 */
export async function getTemplates({ createdBy = null } = {}) {
  let query = db("admin_notification_templates as ant")
    .leftJoin("user as u", "ant.created_by", "u.id")
    .select(
      "ant.id",
      "ant.name",
      "ant.title",
      "ant.message",
      "ant.created_by",
      "u.name as creator_name",
      "u.email as creator_email",
      "ant.created_at",
      "ant.updated_at"
    )
    .orderBy("ant.name", "asc");

  if (createdBy) {
    query = query.where("ant.created_by", createdBy);
  }

  const templates = await query;
  return templates;
}

/**
 * Get a single template by ID
 * @param {number} id - Template ID
 * @returns {Promise<Object|null>} - Template object or null
 */
export async function getTemplateById(id) {
  if (!id) {
    throw new Error("Template ID is required");
  }

  const template = await db("admin_notification_templates as ant")
    .leftJoin("user as u", "ant.created_by", "u.id")
    .where("ant.id", id)
    .select(
      "ant.id",
      "ant.name",
      "ant.title",
      "ant.message",
      "ant.created_by",
      "u.name as creator_name",
      "u.email as creator_email",
      "ant.created_at",
      "ant.updated_at"
    )
    .first();

  return template || null;
}

/**
 * Get a template by name
 * @param {string} name - Template name
 * @returns {Promise<Object|null>} - Template object or null
 */
async function getTemplateByName(name) {
  const template = await db("admin_notification_templates")
    .where({ name })
    .first();

  return template || null;
}

/**
 * Create a new notification template
 * @param {Object} templateData
 * @param {string} templateData.name - Template name (must be unique)
 * @param {string} templateData.title - Notification title
 * @param {string} templateData.message - Notification message
 * @param {string} templateData.createdBy - Admin user ID
 * @returns {Promise<Object>} - Created template
 */
export async function createTemplate({ name, title, message, createdBy }) {
  // Validation
  if (!name || !title || !message || !createdBy) {
    throw new Error("Name, title, message, and creator are required");
  }

  // Check for duplicate name
  const existing = await getTemplateByName(name);
  if (existing) {
    throw new Error(`Template with name "${name}" already exists`);
  }

  // Insert template
  const [id] = await db("admin_notification_templates").insert({
    name: name.trim(),
    title: title.trim(),
    message: message.trim(),
    created_by: createdBy,
  });

  // Return created template
  return getTemplateById(id);
}

/**
 * Update a notification template
 * @param {number} id - Template ID
 * @param {Object} updates - Fields to update
 * @param {string} [updates.name] - Template name
 * @param {string} [updates.title] - Notification title
 * @param {string} [updates.message] - Notification message
 * @returns {Promise<Object>} - Updated template
 */
export async function updateTemplate(id, updates) {
  if (!id) {
    throw new Error("Template ID is required");
  }

  // Check if template exists
  const existing = await getTemplateById(id);
  if (!existing) {
    throw new Error("Template not found");
  }

  // Check for name conflict if name is being updated
  if (updates.name && updates.name !== existing.name) {
    const nameConflict = await getTemplateByName(updates.name);
    if (nameConflict) {
      throw new Error(`Template with name "${updates.name}" already exists`);
    }
  }

  // Prepare update data
  const updateData = {};
  if (updates.name) updateData.name = updates.name.trim();
  if (updates.title) updateData.title = updates.title.trim();
  if (updates.message) updateData.message = updates.message.trim();

  // Perform update
  if (Object.keys(updateData).length > 0) {
    await db("admin_notification_templates").where({ id }).update(updateData);
  }

  // Return updated template
  return getTemplateById(id);
}

/**
 * Delete a notification template
 * @param {number} id - Template ID
 * @returns {Promise<boolean>} - True if deleted
 */
export async function deleteTemplate(id) {
  if (!id) {
    throw new Error("Template ID is required");
  }

  const count = await db("admin_notification_templates").where({ id }).delete();

  if (count === 0) {
    throw new Error("Template not found");
  }

  return true;
}

/**
 * Get count of notifications using a specific template
 * @param {number} templateId - Template ID
 * @returns {Promise<number>} - Count of notifications using this template
 */
export async function getTemplateUsageCount(templateId) {
  const result = await db("admin_notifications")
    .where({ template_id: templateId })
    .count("id as count")
    .first();

  return result?.count || 0;
}
