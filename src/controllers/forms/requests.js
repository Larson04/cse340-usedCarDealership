import { Router } from 'express';
import { validationResult } from 'express-validator';
import { createServiceRequest, getServiceRequests, getServiceRequestById, 
    updateServiceRequest, deleteServiceRequest } from '../../models/forms/requests.js';
import { requireLogin } from '../../middleware/auth.js';
import { requestValidation } from '../../middleware/validation/forms.js';

const router = Router();

/**
 * Display form to submit a new service request
 */
const showServiceRequestForm = (req, res) => {
    res.render('forms/serviceRequests/form', {
        title: 'Submit Service Request',
        vehicles: req.vehicles || [] // loaded from middleware or route
    });
};

/**
 * Handle creating a new service request
 */
const processServiceRequest = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect('/requests/new');
    }

    const { vehicleId, serviceType, notes } = req.body;
    const userId = req.session.user.id;

    try {
        await createServiceRequest(userId, vehicleId, serviceType, notes);
        req.flash('success', 'Service request submitted successfully.');
        res.redirect('/requests');
    } catch (error) {
        console.error('Error creating service request:', error);
        req.flash('error', 'Unable to submit service request.');
        res.redirect('/requests/new');
    }
};

/**
 * Display all service requests
 * Admin/Employee: all requests
 * User: only their own
 */
const showAllServiceRequests = async (req, res) => {
    const currentUser = req.session.user;
    const filterUserId = (currentUser.roleName === 'user') ? currentUser.id : req.query.userId;
    const filterStatus = req.query.status || null;
    const filterDate = req.query.date || null;

    try {
        const requests = await getServiceRequests({ userId: filterUserId, status: filterStatus, date: filterDate });
        const allUsers = (currentUser.roleName !== 'user') ? await getUsersList() : []; // helper function for admin filters

        res.render('forms/serviceRequests/list', {
            title: 'Service Requests',
            user: currentUser,
            requests,
            allUsers,
            filter: { userId: filterUserId, status: filterStatus, date: filterDate }
        });
    } catch (error) {
        console.error('Error fetching service requests:', error);
        req.flash('error', 'Unable to retrieve service requests.');
        res.redirect('/');
    }
};

/**
 * Show edit service request form
 */
const showEditServiceRequestForm = async (req, res) => {
    const requestId = parseInt(req.params.id);
    const currentUser = req.session.user;

    const request = await getServiceRequestById(requestId);
    if (!request) {
        req.flash('error', 'Service request not found.');
        return res.redirect('/requests');
    }

    // Permissions: user can edit their own, admins/employees can edit any
    if (request.userId !== currentUser.id && !['admin', 'employee'].includes(currentUser.roleName)) {
        req.flash('error', 'You do not have permission to edit this request.');
        return res.redirect('/requests');
    }

    res.render('forms/serviceRequests/edit', {
        title: 'Edit Service Request',
        request
    });
};

/**
 * Handle editing a service request
 */
const processEditServiceRequest = async (req, res) => {
    const errors = validationResult(req);
    const requestId = parseInt(req.params.id);
    const currentUser = req.session.user;

    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect(`/requests/${requestId}/edit`);
    }

    const { serviceType, notes, status } = req.body;

    try {
        const request = await getServiceRequestById(requestId);
        if (!request) {
            req.flash('error', 'Service request not found.');
            return res.redirect('/requests');
        }

        if (request.userId !== currentUser.id && !['admin', 'employee'].includes(currentUser.roleName)) {
            req.flash('error', 'You do not have permission to edit this request.');
            return res.redirect('/requests');
        }

        await updateServiceRequest(requestId, serviceType, notes, status);
        req.flash('success', 'Service request updated successfully.');
        res.redirect('/requests');
    } catch (error) {
        console.error('Error updating service request:', error);
        req.flash('error', 'Unable to update service request.');
        res.redirect(`/requests/${requestId}/edit`);
    }
};

/**
 * Handle deleting a service request
 */
const processDeleteServiceRequest = async (req, res) => {
    const requestId = parseInt(req.params.id);
    const currentUser = req.session.user;

    try {
        const request = await getServiceRequestById(requestId);
        if (!request) {
            req.flash('error', 'Service request not found.');
            return res.redirect('/requests');
        }

        if (request.userId !== currentUser.id && !['admin', 'employee'].includes(currentUser.roleName)) {
            req.flash('error', 'You do not have permission to delete this request.');
            return res.redirect('/requests');
        }

        await deleteServiceRequest(requestId);
        req.flash('success', 'Service request deleted successfully.');
    } catch (error) {
        console.error('Error deleting service request:', error);
        req.flash('error', 'Unable to delete service request.');
    }

    res.redirect('/requests');
};

// Routes
router.get('/new', requireLogin, showServiceRequestForm);
router.post('/new', requireLogin, requestValidation, processServiceRequest);

router.get('/', requireLogin, showAllServiceRequests);

router.get('/:id/edit', requireLogin, showEditServiceRequestForm);
router.post('/:id/edit', requireLogin, requestValidation, processEditServiceRequest);

router.post('/:id/delete', requireLogin, processDeleteServiceRequest);

export default router;