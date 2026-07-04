import Company from '../models/Company.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

// Get all companies
const getCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        return res.status(200).json({ success: true, companies });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server Error" });
    }
};

// Add a new company and its root admin
const addCompany = async (req, res) => {
    try {
        const { name, email, phone, address, subscriptionPlan, adminName, adminPassword } = req.body;
        
        // Check if company already exists
        const existingCompany = await Company.findOne({ email });
        if (existingCompany) {
            return res.status(400).json({ success: false, error: "Company with this email already exists" });
        }

        // Create the company
        const newCompany = new Company({
            name, email, phone, address, subscriptionPlan
        });
        await newCompany.save();

        // Create the root admin for this company
        const hashPassword = await bcrypt.hash(adminPassword, 10);
        const newAdmin = new User({
            companyId: newCompany._id,
            name: adminName,
            email: email, // use same email for the root admin login
            password: hashPassword,
            role: "admin"
        });
        await newAdmin.save();

        return res.status(200).json({ success: true, message: "Company and root admin created successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server Error" });
    }
};

// Public route for companies to self-register
const registerCompany = async (req, res) => {
    try {
        const { name, email, phone, address, subscriptionPlan, adminName, adminPassword } = req.body;
        
        // Check if company already exists
        const existingCompany = await Company.findOne({ email });
        if (existingCompany) {
            return res.status(400).json({ success: false, error: "Company with this email already exists" });
        }

        // Create the company with pending status
        const newCompany = new Company({
            name, email, phone, address, subscriptionPlan, status: "pending"
        });
        await newCompany.save();

        // Create the root admin for this company
        const hashPassword = await bcrypt.hash(adminPassword, 10);
        const newAdmin = new User({
            companyId: newCompany._id,
            name: adminName,
            email: email, 
            password: hashPassword,
            role: "admin"
        });
        await newAdmin.save();

        return res.status(200).json({ success: true, message: "Registration successful. Please wait for Superadmin verification." });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server Error" });
    }
};

// Update company status (Approve/Reject)
const updateCompanyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const company = await Company.findByIdAndUpdate(id, { status }, { new: true });
        if (!company) {
            return res.status(404).json({ success: false, error: "Company not found" });
        }

        return res.status(200).json({ success: true, message: `Company status updated to ${status}`, company });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server Error" });
    }
};

// Upgrade company subscription plan to Pro
const upgradeCompany = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const company = await Company.findByIdAndUpdate(companyId, { subscriptionPlan: 'pro' }, { new: true });
        if (!company) {
            return res.status(404).json({ success: false, error: "Company not found" });
        }
        return res.status(200).json({ success: true, message: "Subscription upgraded to Pro plan successfully!", company });
    } catch (error) {
        console.error("upgradeCompany error:", error);
        return res.status(500).json({ success: false, error: "Server Error", details: error.message });
    }
};

// Cancel company subscription (downgrade to basic)
const cancelSubscription = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const company = await Company.findByIdAndUpdate(companyId, { subscriptionPlan: 'basic' }, { new: true });
        if (!company) {
            return res.status(404).json({ success: false, error: "Company not found" });
        }
        return res.status(200).json({ success: true, message: "Subscription cancelled successfully. You are now on the Basic Plan.", company });
    } catch (error) {
        console.error("cancelSubscription error:", error);
        return res.status(500).json({ success: false, error: "Server Error", details: error.message });
    }
};

export { getCompanies, addCompany, registerCompany, updateCompanyStatus, upgradeCompany, cancelSubscription };
