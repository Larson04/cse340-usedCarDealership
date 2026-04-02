import { Router } from 'express';
import { validationResult } from 'express-validator';
import { getAllVehicles } from '../../models/inventory/vehicles.js';
import { createReview, getReviews, getReviewById, updateReview, deleteReview } from '../../models/forms/reviews.js';
import { requireLogin } from '../../middleware/auth.js';
import { reviewValidation } from '../../middleware/validation/forms.js';

const router = Router();

const addReviewSpecificStyles = (res) => {
    res.addStyle('<link rel="stylesheet" href="/css/reviews.css">');
};

/**
 * Display form to create a new review
 */
const showReviewForm = async (req, res) => {
    addReviewSpecificStyles(res);
    try {
        const vehicles = await getAllVehicles(); // fetch all vehicles from DB
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        req.flash('error', 'Unable to load vehicles.');
        res.redirect('/dashboard');
    }
    res.render('forms/reviews/form', {
        title: 'Leave a Review',
        vehicles
    });
};

/**
 * Handle creating a new review
 */
const processReview = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect('/reviews/new');
    }

    const { vehicleId, rating, comment } = req.body;
    const userId = req.session.user.id;

    try {
        await createReview(userId, vehicleId, rating, comment);
        req.flash('success', 'Review submitted successfully.');
        res.redirect('/reviews');
    } catch (error) {
        console.error('Error creating review:', error);
        req.flash('error', 'Unable to submit review.');
        res.redirect('/reviews/new');
    }
};

/**
 * Display all reviews
 * Admin/Employee: all reviews with optional filters
 * User: only their own reviews
 */
const showAllReviews = async (req, res) => {
    const currentUser = req.session.user;
    const filterUserId = (currentUser.roleName === 'user') ? currentUser.id : req.query.userId;
    const filterDate = req.query.date || null;

    try {
        const reviews = await getReviews({ userId: filterUserId, date: filterDate });
        const allUsers = (currentUser.roleName !== 'user') ? await getUsersList() : []; // helper function for admin filter

        res.render('forms/reviews/list', {
            title: 'Reviews',
            user: currentUser,
            reviews,
            allUsers,
            filter: { userId: filterUserId, date: filterDate }
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        req.flash('error', 'Unable to retrieve reviews.');
        res.redirect('/');
    }
};

/**
 * Display edit review form
 */
const showEditReviewForm = async (req, res) => {
    const reviewId = parseInt(req.params.id);
    const currentUser = req.session.user;

    const review = await getReviewById(reviewId);
    if (!review) {
        req.flash('error', 'Review not found.');
        return res.redirect('/reviews');
    }

    // Permission: user can edit their own, admins/employees can edit any
    if (review.userId !== currentUser.id && !['admin', 'employee'].includes(currentUser.roleName)) {
        req.flash('error', 'You do not have permission to edit this review.');
        return res.redirect('/reviews');
    }

    res.render('forms/reviews/edit', {
        title: 'Edit Review',
        review
    });
};

/**
 * Handle editing a review
 */
const processEditReview = async (req, res) => {
    const errors = validationResult(req);
    const reviewId = parseInt(req.params.id);
    const currentUser = req.session.user;

    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect(`/reviews/${reviewId}/edit`);
    }

    const { rating, comment } = req.body;

    try {
        const review = await getReviewById(reviewId);
        if (!review) {
            req.flash('error', 'Review not found.');
            return res.redirect('/reviews');
        }

        if (review.userId !== currentUser.id && !['admin', 'employee'].includes(currentUser.roleName)) {
            req.flash('error', 'You do not have permission to edit this review.');
            return res.redirect('/reviews');
        }

        await updateReview(reviewId, rating, comment);
        req.flash('success', 'Review updated successfully.');
        res.redirect('/reviews');
    } catch (error) {
        console.error('Error updating review:', error);
        req.flash('error', 'Unable to update review.');
        res.redirect(`/reviews/${reviewId}/edit`);
    }
};

/**
 * Handle deleting a review
 */
const processDeleteReview = async (req, res) => {
    const reviewId = parseInt(req.params.id);
    const currentUser = req.session.user;

    try {
        const review = await getReviewById(reviewId);
        if (!review) {
            req.flash('error', 'Review not found.');
            return res.redirect('/reviews');
        }

        if (review.userId !== currentUser.id && !['admin', 'employee'].includes(currentUser.roleName)) {
            req.flash('error', 'You do not have permission to delete this review.');
            return res.redirect('/reviews');
        }

        await deleteReview(reviewId);
        req.flash('success', 'Review deleted successfully.');
    } catch (error) {
        console.error('Error deleting review:', error);
        req.flash('error', 'Unable to delete review.');
    }

    res.redirect('/reviews');
};

// Routes
router.get('/new', requireLogin, showReviewForm);
router.post('/new', requireLogin, reviewValidation, processReview);

router.get('/', requireLogin, showAllReviews);

router.get('/:id/edit', requireLogin, showEditReviewForm);
router.post('/:id/edit', requireLogin, reviewValidation, processEditReview);

router.post('/:id/delete', requireLogin, processDeleteReview);

export default router;