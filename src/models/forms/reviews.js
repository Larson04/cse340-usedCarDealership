import db from '../db.js';

/**
 * Insert a new review into the database.
 * @param {number} userId - ID of the user submitting the review
 * @param {number} vehicleId - ID of the vehicle being reviewed
 * @param {number} rating - Rating (1-5)
 * @param {string} comment - Review comment
 * @returns {Promise<Object>} The newly created review
 */
export const createReview = async (userId, vehicleId, rating, comment) => {
    const query = `
        INSERT INTO reviews (user_id, vehicle_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id AS "userId", vehicle_id AS "vehicleId", rating, comment, created_at AS "dateSubmitted"
    `;
    const result = await db.query(query, [userId, vehicleId, rating, comment]);
    return result.rows[0];
};

/**
 * Get all reviews, optionally filtered by user or date.
 * Admin/employee can see all reviews; regular users can see only their own.
 * @param {Object} options - Optional filters { userId, date }
 * @returns {Promise<Array>} Array of review records with user and vehicle info
 */
export const getReviews = async ({ userId = null, date = null } = {}) => {
    let query = `
        SELECT r.id, r.user_id AS "userId", u.name AS "userName",
               r.vehicle_id AS "vehicleId", CONCAT(v.make, ' ', v.model, ' (', v.year, ')') AS "vehicle",
               r.rating, r.comment, r.created_at AS "dateSubmitted"
        FROM reviews r
        INNER JOIN users u ON r.user_id = u.id
        INNER JOIN vehicles v ON r.vehicle_id = v.id
    `;
    const conditions = [];
    const params = [];

    if (userId) {
        params.push(userId);
        conditions.push(`r.user_id = $${params.length}`);
    }

    if (date) {
        params.push(date);
        conditions.push(`DATE(r.created_at) = $${params.length}`);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY r.created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
};

/**
 * Retrieve a single review by ID
 */
export const getReviewById = async (id) => {
    const query = `
        SELECT r.id, r.user_id AS "userId", u.name AS "userName",
               r.vehicle_id AS "vehicleId", CONCAT(v.make, ' ', v.model, ' (', v.year, ')') AS "vehicle",
               r.rating, r.comment, r.created_at AS "dateSubmitted"
        FROM reviews r
        INNER JOIN users u ON r.user_id = u.id
        INNER JOIN vehicles v ON r.vehicle_id = v.id
        WHERE r.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};
 
/**
 * Update a review (rating and comment)
 */
export const updateReview = async (id, rating, comment) => {
    const query = `
        UPDATE reviews
        SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id, rating, comment, updated_at AS "updatedAt"
    `;
    const result = await db.query(query, [rating, comment, id]);
    return result.rows[0] || null;
};

/**
 * Delete a review by ID
 */
export const deleteReview = async (id) => {
    const query = 'DELETE FROM reviews WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
};