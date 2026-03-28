import db from '../db.js';

/**
 * Create a new service request
 * @param {number} userId - ID of the user submitting the request
 * @param {number} vehicleId - ID of the vehicle
 * @param {string} type - Type of service (oil change, inspection, etc.)
 * @param {string} notes - Additional notes from the user
 * @returns {Promise<Object>} The newly created service request
 */
export const createServiceRequest = async (userId, vehicleId, type, notes) => {
    const query = `
        INSERT INTO service_requests (user_id, vehicle_id, service_type, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id AS "userId", vehicle_id AS "vehicleId", service_type AS "serviceType",
                  notes, status, created_at AS "dateSubmitted"
    `;
    const result = await db.query(query, [userId, vehicleId, type, notes]);
    return result.rows[0];
};

/**
 * Get service requests with optional filtering
 * Admin/employee can see all, users see only their own
 * @param {Object} options - { userId, status, date }
 * @returns {Promise<Array>} Array of service request records with vehicle info
 */
export const getServiceRequests = async ({ userId = null, status = null, date = null } = {}) => {
    let query = `
        SELECT sr.id, sr.user_id AS "userId", u.name AS "userName",
               sr.vehicle_id AS "vehicleId", CONCAT(v.make, ' ', v.model, ' (', v.year, ')') AS "vehicle",
               sr.service_type AS "serviceType", sr.notes, sr.status, sr.created_at AS "dateSubmitted"
        FROM service_requests sr
        INNER JOIN users u ON sr.user_id = u.id
        INNER JOIN vehicles v ON sr.vehicle_id = v.id
    `;
    const conditions = [];
    const params = [];

    if (userId) {
        params.push(userId);
        conditions.push(`sr.user_id = $${params.length}`);
    }
    if (status) {
        params.push(status);
        conditions.push(`sr.status = $${params.length}`);
    }
    if (date) {
        params.push(date);
        conditions.push(`DATE(sr.created_at) = $${params.length}`);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY sr.created_at DESC';
    const result = await db.query(query, params);
    return result.rows;
};

/**
 * Get a single service request by ID
 */
export const getServiceRequestById = async (id) => {
    const query = `
        SELECT sr.id, sr.user_id AS "userId", u.name AS "userName",
               sr.vehicle_id AS "vehicleId", CONCAT(v.make, ' ', v.model, ' (', v.year, ')') AS "vehicle",
               sr.service_type AS "serviceType", sr.notes, sr.status, sr.created_at AS "dateSubmitted"
        FROM service_requests sr
        INNER JOIN users u ON sr.user_id = u.id
        INNER JOIN vehicles v ON sr.vehicle_id = v.id
        WHERE sr.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Update a service request (type, notes, or status)
 */
export const updateServiceRequest = async (id, type, notes, status) => {
    const query = `
        UPDATE service_requests
        SET service_type = $1,
            notes = $2,
            status = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING id, service_type AS "serviceType", notes, status, updated_at AS "updatedAt"
    `;
    const result = await db.query(query, [type, notes, status, id]);
    return result.rows[0] || null;
};

/**
 * Delete a service request
 */
export const deleteServiceRequest = async (id) => {
    const query = 'DELETE FROM service_requests WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
};