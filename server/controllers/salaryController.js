import Salary from '../models/Salary.js'
import Employee from "../models/Employee.js"

const addSalary = async (req, res) => {
    try {
        const { employeeId, basicSalary, allowances, deductions, payDate } = req.body

        const totalSalary = parseInt(basicSalary) + parseInt(allowances) - parseInt(deductions)

        const newSalary = await Salary({
            companyId: req.user.companyId,
            employeeId,
            basicSalary,
            allowances,
            deductions,
            netSalary: totalSalary,
            payDate
        })

        await newSalary.save()

        return res.status(200).json({ success: true })
    } catch (error) {
        return res.status(500).json({ success: false, error: "salary add server error" })
    }
}

const getSalary = async (req, res) => {
    try {
        const { id } = req.params;
        let salary = await Salary.find({ employeeId: id, companyId: req.user.companyId }).populate('employeeId', 'employeeId')
        if (!salary || salary.length < 1) {
            const employee = await Employee.findOne({ userId: id, companyId: req.user.companyId })
            if (employee) {
                salary = await Salary.find({ employeeId: employee._id, companyId: req.user.companyId }).populate('employeeId', 'employeeId')
            }
        }
        return res.status(200).json({ success: true, salary })
    } catch (error) {
        return res.status(500).json({ success: false, error: "salary get server error" })
    }
}

const getSalaryAnalytics = async (req, res) => {
    try {
        const companyId = req.user.companyId;

        // Total employees
        const totalEmployees = await Employee.countDocuments({ companyId });

        // All salary records for this company
        const allSalaries = await Salary.find({ companyId }).populate('employeeId', 'employeeId department');

        // Total payroll disbursed (sum of all net salaries ever paid)
        const totalDisbursed = allSalaries.reduce((sum, s) => sum + (s.netSalary || 0), 0);

        // Average net salary across all records
        const avgSalary = allSalaries.length > 0
            ? Math.round(totalDisbursed / allSalaries.length)
            : 0;

        // Highest single net salary
        const highestSalary = allSalaries.length > 0
            ? Math.max(...allSalaries.map(s => s.netSalary || 0))
            : 0;

        // Total allowances and deductions
        const totalAllowances = allSalaries.reduce((sum, s) => sum + (s.allowances || 0), 0);
        const totalDeductions = allSalaries.reduce((sum, s) => sum + (s.deductions || 0), 0);

        // Monthly trend: last 6 months (group by month)
        const monthlyTrend = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setDate(1);
            d.setMonth(d.getMonth() - i);
            const year = d.getFullYear();
            const month = d.getMonth(); // 0-indexed

            const monthStart = new Date(year, month, 1);
            const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

            const monthRecords = allSalaries.filter(s => {
                const pd = new Date(s.payDate);
                return pd >= monthStart && pd <= monthEnd;
            });

            const monthNet = monthRecords.reduce((sum, s) => sum + (s.netSalary || 0), 0);
            const monthAllowances = monthRecords.reduce((sum, s) => sum + (s.allowances || 0), 0);
            const monthDeductions = monthRecords.reduce((sum, s) => sum + (s.deductions || 0), 0);

            monthlyTrend.push({
                label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                net: monthNet,
                allowances: monthAllowances,
                deductions: monthDeductions,
                count: monthRecords.length
            });
        }

        // Recent 5 salary records
        const recentSalaries = await Salary.find({ companyId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({ path: 'employeeId', select: 'employeeId department', populate: { path: 'department', select: 'dep_name' } });

        return res.status(200).json({
            success: true,
            analytics: {
                totalEmployees,
                totalDisbursed,
                avgSalary,
                highestSalary,
                totalAllowances,
                totalDeductions,
                totalRecords: allSalaries.length,
                monthlyTrend,
                recentSalaries
            }
        });
    } catch (error) {
        console.error('Salary analytics error:', error);
        return res.status(500).json({ success: false, error: "salary analytics server error" });
    }
}

export { addSalary, getSalary, getSalaryAnalytics }