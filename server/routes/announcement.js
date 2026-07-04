import express from 'express';
import verifyUser, { authorizeRole } from '../middleware/authMiddleware.js';
import { getAnnouncements, addAnnouncement, deleteAnnouncement } from '../controllers/announcementController.js';

const router = express.Router();

router.get('/', verifyUser, getAnnouncements); // Admins and Employees can view
router.post('/add', verifyUser, authorizeRole('admin'), addAnnouncement); // Only admins can add
router.delete('/:id', verifyUser, authorizeRole('admin'), deleteAnnouncement); // Only admins can delete

export default router;
