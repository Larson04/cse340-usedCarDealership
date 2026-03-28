import { getVehiclesByCategory } from '../../models/inventory/catalog.js';
import { getVehicleById } from '../../models/inventory/vehicles.js';

/**
 * Handler for the vehicle catalog / inventory page
 */
export const vehicleCatalogPage = async (req, res, next) => {
    // Whitelist of valid sort options
    const validSortOptions = ['category', 'make', 'model', 'year', 'price', 'mileage'];
    const sortBy = validSortOptions.includes(req.query.sort) ? req.query.sort : 'category';

    // Optional category filter
    const categoryId = req.query.category ? parseInt(req.query.category) : null;

    // Fetch the sorted vehicle list
    const vehicles = await getVehiclesByCategory(categoryId, sortBy);

    res.render('inventory/list', {
        title: 'Vehicle Inventory',
        currentSort: sortBy,
        vehicles: vehicles
    });
};

/**
 * Handler for individual vehicle detail pages
 */
export const vehicleDetailPage = async (req, res, next) => {
    const vehicleId = parseInt(req.params.vehicleId);

    // Fetch single vehicle by ID
    const vehicle = await getVehicleById(vehicleId);

    // Handle case where vehicle is not found
    if (!vehicle || Object.keys(vehicle).length === 0) {
        const err = new Error(`Vehicle with ID ${vehicleId} not found`);
        err.status = 404;
        return next(err);
    }

    res.render('inventory/detail', {
        title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        vehicle: vehicle
    });
};