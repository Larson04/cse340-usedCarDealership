import { homePage } from './index.js';
import { Router } from 'express';

// Create a new router instance
const router = Router();

// Home and basic pages
router.get('/', homePage);

export default router;