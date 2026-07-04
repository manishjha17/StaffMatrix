import express from 'express';
import verifyUser from '../middleware/authMiddleware.js';
import { createTicket, getTickets, resolveTicket, replyToTicket } from '../controllers/supportController.js';

const router = express.Router();

router.post('/add', verifyUser, createTicket);
router.get('/', verifyUser, getTickets);
router.put('/:id/resolve', verifyUser, resolveTicket);
router.post('/:id/reply', verifyUser, replyToTicket);

export default router;
