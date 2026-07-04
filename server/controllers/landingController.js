import LandingInquiry from '../models/LandingInquiry.js';

// @route   POST /api/landing/contact
// @desc    Submit a new contact inquiry from the landing page
// @access  Public
export const submitInquiry = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: 'Please provide all fields' });
        }
        
        const newInquiry = new LandingInquiry({ name, email, message });
        await newInquiry.save();
        
        return res.status(201).json({ success: true, message: 'Your message has been sent successfully!' });
    } catch (error) {
        console.error("submitInquiry error:", error);
        return res.status(500).json({ success: false, error: 'Server error while submitting inquiry' });
    }
};

// @route   GET /api/landing/inquiries
// @desc    Get all landing page inquiries
// @access  Private (Superadmin)
export const getInquiries = async (req, res) => {
    try {
        const inquiries = await LandingInquiry.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, inquiries });
    } catch (error) {
        console.error("getInquiries error:", error);
        return res.status(500).json({ success: false, error: 'Server error while fetching inquiries' });
    }
};

// @route   DELETE /api/landing/inquiries/:id
// @desc    Delete a specific inquiry
// @access  Private (Superadmin)
export const deleteInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedInquiry = await LandingInquiry.findByIdAndDelete(id);
        
        if (!deletedInquiry) {
            return res.status(404).json({ success: false, error: 'Inquiry not found' });
        }
        
        return res.status(200).json({ success: true, message: 'Inquiry deleted successfully' });
    } catch (error) {
        console.error("deleteInquiry error:", error);
        return res.status(500).json({ success: false, error: 'Server error while deleting inquiry' });
    }
};
