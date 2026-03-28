import db from '../db.js';

/**
 * Core function that gets all vehicles (optionally filtered by category)
 * with sorting by category, make, model, year, price, or mileage.
 * 
 * @param {number|null} categoryId - Category ID to filter by (optional)
 * @param {string} sortBy - 'category', 'make', 'model', 'year', 'price', 'mileage' (default: 'price')
 * @returns {Promise<Array>} Array of vehicle objects with images
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

    // Query vehicles with category and images
    const query = `
        SELECT 
            v.id, v.year, v.make, v.model,
            v.price, v.mileage, v.description,
            c.name AS category_name,
            img.image_url, img.is_primary
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        LEFT JOIN vehicle_images img ON img.vehicle_id = v.id
        WHERE ${whereClause}
        ORDER BY ${orderByClause}, v.id, img.is_primary DESC
    `;

    const result = await db.query(query, params);

    // Transform and group images per vehicle
    const vehiclesMap = new Map();

    result.rows.forEach(vehicle => {
        if (!vehiclesMap.has(vehicle.id)) {
            vehiclesMap.set(vehicle.id, {
                id: vehicle.id,
                year: vehicle.year,
                make: vehicle.make,
                model: vehicle.model,
                price: vehicle.price,
                mileage: vehicle.mileage,
                description: vehicle.description,
                category: vehicle.category_name,
                primaryImage: null,
                images: []
            });
        }

        if (vehicle.image_url) {
            const current = vehiclesMap.get(vehicle.id);

            const imageObj = {
                url: vehicle.image_url,
                alt: `${vehicle.year} ${vehicle.make} ${vehicle.model}`, // simple default alt
                isPrimary: vehicle.is_primary
            };

            current.images.push(imageObj);

            if (vehicle.is_primary) {
                current.primaryImage = imageObj;
            }
        }
    });

    return Array.from(vehiclesMap.values());
};

/**
 * Wrapper functions for convenience / backward compatibility
 */
export const getInventory = (sortBy = 'price') =>
    getVehiclesByCategory(null, sortBy);

export const getVehiclesByCategoryId = (categoryId, sortBy = 'price') =>
    getVehiclesByCategory(categoryId, sortBy);