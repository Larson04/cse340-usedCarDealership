// import { allVehicles} from '../controllers/inventory/catalog.js';
// import { userReviews } from '../controllers/forms/contact.js';
// import { userServiceRequests } from '../controllers/forms/service.js';

const addDashboardSpecificStyles = (res) => {
    res.addStyle('<link rel="stylesheet" href="/css/dashboard.css">');
};
export const showDashboard = (req, res) => {
    addDashboardSpecificStyles(res);
    res.render('dashboard', {
        user: req.user,
        // vehicles: allVehicles,
        // userReviews: userReviews,
        // serviceRequests: userServiceRequests
    })
};

