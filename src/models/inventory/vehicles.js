import db from '../db.js';

/**
 * Get a single vehicle by ID, including its single image.
 * 
 * @param {number} vehicleId
 * @returns {Promise<Object|null>} Vehicle object with category info and image
 */
const getVehicleByIdCore = async (vehicleId) => {
    const query = `
        SELECT 
            v.id, v.make, v.model, v.year, 
            v.price, v.mileage, v.description,
            c.name AS category_name, 
            c.description AS category_description,
            vi.image_url AS image_url,
            vi.alt_text AS alt
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        LEFT JOIN vehicle_images vi ON vi.vehicle_id = v.id
        WHERE v.id = $1
    `;

    const result = await db.query(query, [vehicleId]);
    if (result.rows.length === 0) return null;

    const vehicle = result.rows[0];
    return {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        mileage: vehicle.mileage,
        description: vehicle.description,
        category: vehicle.category_name,
        categoryDescription: vehicle.category_description,
        image: vehicle.image_url,
        alt: vehicle.alt
    };
};

/**
 * Get all vehicles with optional sorting.
 * 
 * @param {string} sortBy - 'category' (default), 'make', 'price', 'year', 'mileage'
 * @returns {Promise<Array>} Array of vehicle objects with image
 */
export const getAllVehicles = async (sortBy = 'category') => {
    const orderByClause =
        sortBy === 'make' ? 'v.make, v.model' :
        sortBy === 'price' ? 'v.price ASC' :
        sortBy === 'year' ? 'v.year DESC' :
        sortBy === 'mileage' ? 'v.mileage ASC' :
        'c.name, v.make, v.model';

    const query = `
        SELECT 
            v.id, v.make, v.model, v.year, v.price, v.mileage, v.description,
            c.name AS category_name, c.description AS category_description,
            vi.image_url AS image_url,
            vi.alt_text AS alt
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        LEFT JOIN vehicle_images vi ON vi.vehicle_id = v.id
        ORDER BY ${orderByClause}
    `;

    const result = await db.query(query);
    return result.rows.map(vehicle => ({
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        mileage: vehicle.mileage,
        description: vehicle.description,
        category: vehicle.category_name,
        categoryDescription: vehicle.category_description,
        image: vehicle.image_url,
        alt: vehicle.alt
    }));
};

/**
 * Get featured vehicles for homepage.
 * 
 * @param {number} limit - Number of vehicles to fetch (default: 5)
 * @param {string} sortBy - Sort option: 'price', 'year', 'mileage' (default: 'year')
 * @returns {Promise<Array>} Array of vehicles with image
 */
export const getFeaturedVehicles = async (limit = 5, sortBy = 'year') => {
    const orderByClause =
        sortBy === 'price' ? 'v.price ASC' :
        sortBy === 'mileage' ? 'v.mileage ASC' :
        'v.year DESC'; // default: newest first

    const query = `
        SELECT 
            v.id, v.make, v.model, v.year, v.price, v.mileage, v.description,
            c.name AS category_name,
            vi.image_url AS image_url,
            vi.alt_text AS alt
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        LEFT JOIN vehicle_images vi ON vi.vehicle_id = v.id
        ORDER BY ${orderByClause}
        LIMIT $1
    `;

    const result = await db.query(query, [limit]);
    return result.rows.map(vehicle => ({
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        mileage: vehicle.mileage,
        description: vehicle.description,
        category: vehicle.category_name,
        image: vehicle.image_url,
        alt: vehicle.alt
    }));
};

/**
 * Wrapper functions for clean API
 */
export const getVehicleById = (vehicleId) => getVehicleByIdCore(vehicleId);
export const getVehicleBySlug = (slug) => getVehicleByIdCore(slug); // placeholder