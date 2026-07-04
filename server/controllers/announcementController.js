import Announcement from '../models/Announcement.js';

const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({ companyId: req.user.companyId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, announcements });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server Error" });
    }
};

const addAnnouncement = async (req, res) => {
    try {
        const { title, description, priority } = req.body;
        
        // Ensure only Pro plans can create announcements
        if (req.user.subscriptionPlan !== 'pro') {
            return res.status(403).json({ success: false, error: "Announcements are only available on the Pro Plan." });
        }

        const newAnnouncement = new Announcement({
            companyId: req.user.companyId,
            title,
            description,
            priority
        });

        await newAnnouncement.save();
        return res.status(200).json({ success: true, message: "Announcement posted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server Error" });
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        await Announcement.findOneAndDelete({ _id: id, companyId: req.user.companyId });
        return res.status(200).json({ success: true, message: "Announcement deleted" });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server Error" });
    }
}

export { getAnnouncements, addAnnouncement, deleteAnnouncement };
