import express from 'express';
import verifyUser, { authorizeRole } from '../middleware/authMiddleware.js';
import { submitInquiry, getInquiries, deleteInquiry } from '../controllers/landingController.js';

const router = express.Router();

// Public route for landing page form
router.post('/contact', submitInquiry);

// Protected routes for super admin
router.get('/inquiries', verifyUser, authorizeRole('superadmin'), getInquiries);
router.delete('/inquiries/:id', verifyUser, authorizeRole('superadmin'), deleteInquiry);

export default router;
