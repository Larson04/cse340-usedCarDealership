import { getFeaturedVehicles } from '../models/inventory/vehicles.js';

export const homePage = async (req, res) => {
  const featuredVehicles = await getFeaturedVehicles(5, 'year');
  console.log(featuredVehicles);

  res.render('home', {
    title: 'Welcome to Our Dealership',
    featuredVehicles
  });
};