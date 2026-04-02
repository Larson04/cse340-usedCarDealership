import db from '../db.js';

/**
 * Get all vehicles (optionally filtered by category)
 * with sorting by category, make, model, year, price, or mileage.
 * Each vehicle has only one image.
 * 
 * @param {number|null} categoryId - Category ID to filter by (optional)
 * @param {string} sortBy - 'category', 'make', 'model', 'year', 'price', 'mileage' (default: 'price')
 * @returns {Promise<Array>} Array of vehicle objects with single image
 */
export const getVehiclesByCategory = async (categoryId = null, sortBy = 'price') => {
    // Optional WHERE clause
    const whereClause = categoryId ? 'v.category_id = $1' : '1=1';
    const params = categoryId ? [categoryId] : [];

    // Map sortBy to SQL ORDER BY expressions
    const orderByMap = {
        category: 'c.name, v.make, v.model',
        make: 'v.make, v.model',
        model: 'v.model, v.make',
        year: 'v.year DESC',
        price: 'v.price ASC',
        mileage: 'v.mileage ASC'
    };

    const orderByClause = orderByMap[sortBy] || orderByMap.price;

    // Query vehicles with category and single image
    const query = `
        SELECT 
            v.id, v.year, v.make, v.model,
            v.price, v.mileage, v.description,
            c.name AS category_name,
            img.image_url,
            img.alt_text AS alt
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        LEFT JOIN vehicle_images img ON img.vehicle_id = v.id
        WHERE ${whereClause}
        ORDER BY ${orderByClause}, v.id
    `;

    const result = await db.query(query, params);

    // Map rows directly to vehicles
    return result.rows.map(vehicle => ({
        id: vehicle.id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        price: vehicle.price,
        mileage: vehicle.mileage,
        description: vehicle.description,
        category: vehicle.category_name,
        image: vehicle.image_url,
        alt: vehicle.alt
    }));
};

/**
 * Wrapper functions for convenience
 */
export const getInventory = (sortBy = 'price') =>
    getVehiclesByCategory(null, sortBy);

export const getVehiclesByCategoryId = (categoryId, sortBy = 'price') =>
    getVehiclesByCategory(categoryId, sortBy);