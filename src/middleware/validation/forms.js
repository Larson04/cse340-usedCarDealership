import { body } from 'express-validator';

/**
 * POST /contact - Handle contact form submission with validation
 */
export const contactValidation = [
    body('subject')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Subject must be between 2 and 255 characters')
        .matches(/^[a-zA-Z0-9\s\-.,!?]+$/)
        .withMessage('Subject contains invalid characters'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Message must be between 10 and 2000 characters')
        .custom((value) => {
            // Check for spam patterns (excessive repetition)
            const words = value.split(/\s+/);
            const uniqueWords = new Set(words);
            if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
                throw new Error('Message appears to be spam');
            }
            return true;
        })
];

/**
 * Validation rules for login form
 */
export const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .isLength({ max: 255 })
        .withMessage('Email address is too long')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        
];

/**
 * Validation rules for user registration
 */
export const registrationValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name must contain only letters, spaces, hyphens, and apostrophes'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address')
        .isLength({ max: 255 })
        .withMessage('Email address is too  long'),
    body('emailConfirm')
        .trim()
        .custom((value, { req }) => value === req.body.email)
        .withMessage('Email addresses must match'),
    body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
        .withMessage('Password must contain at least one special character'),
    body('passwordConfirm')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords must match')
];

/**
 * Validation rules for editing user accounts
 */
export const editValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address')
        .isLength({ max: 255 })
        .withMessage('Email address is too long')
];

/**
 * Validation rules for submitting a vehicle review
 */
export const reviewValidation = [
    body('make')
        .trim()
        .notEmpty()
        .withMessage('Vehicle make is required')
        .isLength({ min: 2 })
        .withMessage('Make must be at least 2 characters'),

    body('model')
        .trim()
        .notEmpty()
        .withMessage('Vehicle model is required')
        .isLength({ min: 2 })
        .withMessage('Model must be at least 2 characters'),

    body('year')
        .notEmpty()
        .withMessage('Year is required')
        .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
        .withMessage('Enter a valid year'),

    body('comment')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Comment must be between 10 and 2000 characters')
        .matches(/^[a-zA-Z0-9\s.,!?'"-]+$/)
        .withMessage('Comment contains invalid characters')
        .custom((value) => {
            const words = value.split(/\s+/);
            const uniqueWords = new Set(words);
            if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
                throw new Error('Comment appears to be spam');
            }
            return true;
        }),

    body('rating')
        .notEmpty()
        .withMessage('Rating is required')
        .isInt({ min: 1, max: 5 }) // ⭐ fixed range
        .withMessage('Rating must be between 1 and 5')
];

/**
 * Validation rules for submitting a service request
 */
export const requestValidation = [
    body('vehicleId')
        .notEmpty()
        .withMessage('Vehicle selection is required')
        .isInt({ min: 1 })
        .withMessage('Invalid vehicle selected'),

    body('serviceType')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Service type must be between 3 and 100 characters')
        .matches(/^[a-zA-Z0-9\s-]+$/)
        .withMessage('Service type contains invalid characters'),

    body('notes')
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Notes cannot exceed 2000 characters')
        .custom((value) => {
            if (value) {
                const words = value.split(/\s+/);
                const uniqueWords = new Set(words);
                if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
                    throw new Error('Notes appear to be spam');
                }
            }
            return true;
        }),

    body('status')
        .optional()
        .isIn(['pending', 'in_progress', 'completed'])
        .withMessage('Invalid status value')
];