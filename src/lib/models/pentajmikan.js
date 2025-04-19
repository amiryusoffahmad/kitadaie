import { db } from "../db";

/**
 * Pentajmikan model for handling database operations related to programs
 */
const pentajmikanTable = "pentajmikan";
const participantsTable = "pentajmikan_participants";

export const PentajmikanModel = {
  /**
   * Create a new pentajmikan program
   * @param {Object} data - Program data
   * @returns {Promise<number>} - ID of the inserted record
   */
  async create(data) {
    const [id] = await db(pentajmikanTable).insert(data);
    return id;
  },

  /**
   * Get pentajmikan by ID
   * @param {number} id - Pentajmikan ID
   * @returns {Promise<Object|null>} - Pentajmikan record or null
   */
  async getById(id) {
    return await db(pentajmikanTable).where({ id }).first();
  },

  /**
   * Get all pentajmikan programs
   * @returns {Promise<Array>} - Array of pentajmikan records
   */
  async getAll() {
    return await db(pentajmikanTable).orderBy("created_at", "desc");
  },

  /**
   * Get pentajmikan programs created by a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} - Array of pentajmikan records
   */
  async getByCreator(userId) {
    return await db(pentajmikanTable)
      .where({ created_by: userId })
      .orderBy("created_at", "desc");
  },

  /**
   * Get pentajmikan programs where user is a participant
   * @param {number} userId - User ID
   * @returns {Promise<Array>} - Array of pentajmikan records
   */
  async getByParticipant(userId) {
    return await db(pentajmikanTable)
      .join(
        participantsTable,
        `${pentajmikanTable}.id`,
        "=",
        `${participantsTable}.pentajmikan_id`
      )
      .where(`${participantsTable}.user_id`, userId)
      .select(`${pentajmikanTable}.*`)
      .orderBy(`${pentajmikanTable}.created_at`, "desc");
  },

  /**
   * Update pentajmikan by ID
   * @param {number} id - Pentajmikan ID
   * @param {Object} data - Updated data
   * @returns {Promise<number>} - Number of updated records
   */
  async update(id, data) {
    return await db(pentajmikanTable).where({ id }).update(data);
  },

  /**
   * Delete pentajmikan by ID
   * @param {number} id - Pentajmikan ID
   * @returns {Promise<number>} - Number of deleted records
   */
  async delete(id) {
    return await db(pentajmikanTable).where({ id }).delete();
  },

  /**
   * Add a participant to a pentajmikan program
   * @param {number} pentajmikanId - Pentajmikan ID
   * @param {number} userId - User ID
   * @returns {Promise<number>} - ID of the inserted record
   */
  async addParticipant(pentajmikanId, userId) {
    try {
      const [id] = await db(participantsTable).insert({
        pentajmikan_id: pentajmikanId,
        user_id: userId,
      });
      // Update total participants count
      await this.updateParticipantCount(pentajmikanId);
      return id;
    } catch (error) {
      console.error("Error adding participant:", error);
      return null;
    }
  },

  /**
   * Remove a participant from a pentajmikan program
   * @param {number} pentajmikanId - Pentajmikan ID
   * @param {number} userId - User ID
   * @returns {Promise<number>} - Number of deleted records
   */
  async removeParticipant(pentajmikanId, userId) {
    const result = await db(participantsTable)
      .where({
        pentajmikan_id: pentajmikanId,
        user_id: userId,
      })
      .delete();

    // Update total participants count
    await this.updateParticipantCount(pentajmikanId);
    return result;
  },

  /**
   * Get participants of a pentajmikan program
   * @param {number} pentajmikanId - Pentajmikan ID
   * @returns {Promise<Array>} - Array of user records
   */
  async getParticipants(pentajmikanId) {
    return await db("user")
      .join(participantsTable, "user.id", "=", `${participantsTable}.user_id`)
      .where(`${participantsTable}.pentajmikan_id`, pentajmikanId)
      .select("user.id", "user.name", "user.email", "user.image as avatar");
  },

  /**
   * Update participant count for a pentajmikan program
   * @param {number} pentajmikanId - Pentajmikan ID
   * @returns {Promise<void>}
   */
  async updateParticipantCount(pentajmikanId) {
    const count = await db(participantsTable)
      .where({ pentajmikan_id: pentajmikanId })
      .count({ count: "*" })
      .first();

    if (count) {
      await db(pentajmikanTable)
        .where({ id: pentajmikanId })
        .update({ total_participants: count.count });
    }
  },
};
