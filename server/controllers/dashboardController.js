import Department from "../models/Department.js";
import Employee from "../models/Employee.js"
import Leave from "../models/Leave.js";
const getSummary = async (req, res) => {
    try {
        const totalEmployees = await Employee.countDocuments({ companyId: req.user.companyId });
        const totalDepartments = await Department.countDocuments({ companyId: req.user.companyId });

        const totalSalaries = await Employee.aggregate([
            { $match: { companyId: req.user.companyId } },
            { $group: { _id: null, totalSalary: { $sum: "$salary" } } }
        ]);

        const employeeAppliedForLeave = await Leave.distinct('employeeId', { companyId: req.user.companyId });

        const totalLeaveApplied = await Leave.countDocuments({ companyId: req.user.companyId });

        const leaveStatus = await Leave.aggregate([
            { $match: { companyId: req.user.companyId } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const leaveSummary = {
            appliedFor: totalLeaveApplied,
            approved: leaveStatus.find(item => item._id === "Approved")?.count || 0,
            rejected: leaveStatus.find(item => item._id === "Rejected")?.count || 0,
            pending: leaveStatus.find(item => item._id === "Pending")?.count || 0,
        };

        // 1. Recent Employees
        const recentEmployees = await Employee.find({ companyId: req.user.companyId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name profileImage')
            .populate('department', 'dep_name');

        // 2. Pending Leaves
        const pendingLeaves = await Leave.find({ companyId: req.user.companyId, status: "Pending" })
            .sort({ appliedAt: -1 })
            .limit(5)
            .populate({
                path: 'employeeId',
                populate: [
                    { path: 'userId', select: 'name profileImage' },
                    { path: 'department', select: 'dep_name' }
                ]
            });

        // 3. Upcoming Birthdays (next 30 days)
        const allEmployees = await Employee.find({ companyId: req.user.companyId }).populate('userId', 'name profileImage').populate('department', 'dep_name');
        const today = new Date();
        const next30Days = new Date(today);
        next30Days.setDate(today.getDate() + 30);
        
        const upcomingBirthdays = allEmployees.filter(emp => {
            if (!emp.dob) return false;
            const dob = new Date(emp.dob);
            const thisYearBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
            if (thisYearBday >= today && thisYearBday <= next30Days) return true;
            const nextYearBday = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
            if (nextYearBday >= today && nextYearBday <= next30Days) return true;
            return false;
        }).slice(0, 5);

        return res.status(200).json({
            success: true,
            totalEmployees,
            totalDepartments,
            totalSalary: totalSalaries[0]?.totalSalary || 0,
            leaveSummary,
            recentEmployees,
            pendingLeaves,
            upcomingBirthdays
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        return res.status(500).json({ success: false, error: "dashboard summary error" });
    }
};


export  {getSummary}