// import { allVehicles} from '../controllers/inventory/catalog.js';
// import { userReviews } from '../controllers/forms/contact.js';
// import { userServiceRequests } from '../controllers/forms/service.js';
export const showDashboard = (req, res) => {
    console.log('arrived');
    res.render('dashboard', {
        user: req.user,
        // vehicles: allVehicles,
        // userReviews: userReviews,
        // serviceRequests: userServiceRequests
    })
};

