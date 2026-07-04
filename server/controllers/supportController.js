import SupportTicket from '../models/SupportTicket.js';

export const createTicket = async (req, res) => {
    try {
        const { subject, message } = req.body;
        
        if (req.user.subscriptionPlan !== 'pro') {
            return res.status(403).json({ success: false, error: "Support tickets are a Pro feature." });
        }

        const newTicket = new SupportTicket({
            companyId: req.user.companyId,
            userId: req.user._id,
            subject,
            messages: [{
                senderRole: 'admin',
                text: message
            }]
        });

        await newTicket.save();
        return res.status(200).json({ success: true, ticket: newTicket });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to create support ticket." });
    }
};

export const getTickets = async (req, res) => {
    try {
        let tickets;
        
        if (req.user.role === 'superadmin') {
            tickets = await SupportTicket.find()
                .populate('companyId', 'name email phone')
                .populate('userId', 'name email')
                .sort({ updatedAt: -1 }); // sort by latest activity
        } else if (req.user.role === 'admin') {
            tickets = await SupportTicket.find({ companyId: req.user.companyId })
                .populate('userId', 'name')
                .sort({ updatedAt: -1 });
        } else {
            return res.status(403).json({ success: false, error: "Unauthorized access." });
        }

        return res.status(200).json({ success: true, tickets });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch support tickets." });
    }
};

export const resolveTicket = async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({ success: false, error: "Unauthorized access." });
        }

        const { id } = req.params;
        const ticket = await SupportTicket.findByIdAndUpdate(id, {
            status: 'resolved',
            updatedAt: Date.now()
        }, { new: true });

        if (!ticket) {
            return res.status(404).json({ success: false, error: "Ticket not found." });
        }

        return res.status(200).json({ success: true, ticket });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to resolve support ticket." });
    }
};

export const replyToTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        
        const ticket = await SupportTicket.findById(id);
        
        if (!ticket) {
            return res.status(404).json({ success: false, error: "Ticket not found." });
        }
        
        if (req.user.role !== 'superadmin' && ticket.companyId.toString() !== req.user.companyId.toString()) {
            return res.status(403).json({ success: false, error: "Unauthorized." });
        }
        
        if (ticket.status === 'resolved') {
             return res.status(400).json({ success: false, error: "Cannot reply to a resolved ticket." });
        }

        ticket.messages.push({
            senderRole: req.user.role,
            text: message
        });
        ticket.updatedAt = Date.now();
        
        await ticket.save();
        
        return res.status(200).json({ success: true, ticket });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to reply." });
    }
};
