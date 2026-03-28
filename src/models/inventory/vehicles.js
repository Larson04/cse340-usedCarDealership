import db from '../db.js';

/**
 * Core function to get a single vehicle by ID.
 * Includes all images for the vehicle.
 * 
 * @param {number} vehicleId
 * @returns {Promise<Object>} Vehicle object with category info and images
 */
const getVehicleByIdCore = async (vehicleId) => {
    const vehicleQuery = `
        SELECT v.id, v.make, v.model, v.year, v.price, v.mileage, v.description,
               c.name as category_name, c.description as category_description
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        WHERE v.id = $1
    `;

    const vehicleResult = await db.query(vehicleQuery, [vehicleId]);
    if (vehicleResult.rows.length === 0) return {};

    const vehicle = vehicleResult.rows[0];

    // Get all images for this vehicle
    const imagesQuery = `
        SELECT id, image_url, alt_text, is_primary
        FROM vehicle_images
        WHERE vehicle_id = $1
        ORDER BY is_primary DESC, id ASC
    `;
    const imagesResult = await db.query(imagesQuery, [vehicleId]);
    // Determine primary image
    const primaryImage = imagesResult.rows.find(img => img.is_primary)?.image_url || null;

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
        primaryImage,
        images: imagesResult.rows.map(img => img.image_url)
    };
};

/**
 * Get all vehicles with optional sorting.
 * 
 * @param {string} sortBy - 'category' (default), 'make', 'price', 'year', 'mileage'
 * @returns {Promise<Array>} Array of vehicle objects with primary image
 */
export const getAllVehicles = async (sortBy = 'category') => {
    const orderByClause =
        sortBy === 'make' ? 'v.make, v.model' :
        sortBy === 'price' ? 'v.price ASC' :
        sortBy === 'year' ? 'v.year DESC' :
        sortBy === 'mileage' ? 'v.mileage ASC' :
        'c.name, v.make, v.model';

    const query = `
        SELECT v.id, v.make, v.model, v.year, v.price, v.mileage, v.description,
               c.name as category_name, c.description as category_description,
               vi.image_url as primary_image, vi.alt_text
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        LEFT JOIN vehicle_images vi 
            ON vi.vehicle_id = v.id AND vi.is_primary = TRUE
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
        primaryImage: vehicle.primary_image,
        alt: vehicle.alt_text
    }));
};

/**
 * Get featured vehicles for homepage.
 * 
 * @param {number} limit - Number of vehicles to fetch (default: 5)
 * @param {string} sortBy - Sort option: 'price', 'year', 'mileage' (default: 'year')
 * @returns {Promise<Array>} Array of vehicles with primary image and basic info
 */
export const getFeaturedVehicles = async (limit = 5, sortBy = 'year') => {
  const orderByClause =
    sortBy === 'price' ? 'v.price ASC' :
    sortBy === 'mileage' ? 'v.mileage ASC' :
    'v.year DESC'; // default: newest first

  const query = `
    SELECT 
      v.id, v.make, v.model, v.year, v.price, v.mileage, v.description,
      c.name as category_name,
      vi.image_url as primary_image
    FROM vehicles v
    JOIN categories c ON v.category_id = c.id
    LEFT JOIN vehicle_images vi 
      ON vi.vehicle_id = v.id AND vi.is_primary = TRUE
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
    primaryImage: vehicle.primary_image
  }));
};

/**
 * Wrapper functions for clean API
 */
export const getVehicleById = (vehicleId) => getVehicleByIdCore(vehicleId);
// Placeholder if you add slug later
export const getVehicleBySlug = (slug) => getVehicleByIdCore(slug);