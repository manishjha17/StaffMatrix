import express from 'express';
import verifyUser, { authorizeRole } from '../middleware/authMiddleware.js';
import { getCompanies, addCompany, registerCompany, updateCompanyStatus, upgradeCompany, cancelSubscription } from '../controllers/companyController.js';

const router = express.Router();

router.get('/', verifyUser, authorizeRole('superadmin'), getCompanies);
router.post('/add', verifyUser, authorizeRole('superadmin'), addCompany);
router.post('/register', registerCompany); // Public route
router.put('/:id/status', verifyUser, authorizeRole('superadmin'), updateCompanyStatus);
router.put('/upgrade', verifyUser, authorizeRole('admin'), upgradeCompany);
router.put('/cancel-subscription', verifyUser, authorizeRole('admin'), cancelSubscription);

export default router;
