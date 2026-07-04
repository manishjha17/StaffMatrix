import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authMiddleware.js';
import { getAttendance, getAttendanceStatus, checkIn, checkOut, getAttendanceAnalytics } from '../controllers/attendanceController.js';
import { markAbsentEmployees } from '../tasks/attendanceTask.js';

const router = express.Router();

router.get('/', authMiddleware, getAttendance);
router.get('/analytics', authMiddleware, getAttendanceAnalytics);
router.get('/status', authMiddleware, getAttendanceStatus);
router.post('/check-in', authMiddleware, checkIn);
router.post('/check-out', authMiddleware, checkOut);

// Admin-only: manually trigger absent marking for a specific date (defaults to today)
router.post('/mark-absent', authMiddleware, authorizeRole('admin'), async (req, res) => {
    try {
        const dateStr = req.body.date || new Date().toISOString().split('T')[0];
        const count = await markAbsentEmployees(dateStr);
        return res.status(200).json({ success: true, message: `Marked ${count} employee(s) as Absent for ${dateStr}` });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Failed to mark absent employees' });
    }
});

export default router;
