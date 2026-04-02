import { getFeaturedVehicles } from '../models/inventory/vehicles.js';

const homePage = async (req, res) => {
  const featuredVehicles = await getFeaturedVehicles(5, 'year');

  res.render('home', {
    title: 'Welcome to Our Dealership',
    featuredVehicles
  });
};

export { homePage };