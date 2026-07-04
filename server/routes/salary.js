import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { addSalary, getSalary, getSalaryAnalytics } from '../controllers/salaryController.js'

const router = express.Router()

router.post('/add', authMiddleware, addSalary)
router.get('/analytics', authMiddleware, getSalaryAnalytics)
router.get('/:id', authMiddleware, getSalary)

export default router;