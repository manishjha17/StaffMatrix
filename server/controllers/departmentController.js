import Department from "../models/Department.js";
import Employee from "../models/Employee.js";

const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ companyId: req.user.companyId }).lean();
        
        const depIds = departments.map(d => d._id);
        const empCounts = await Employee.aggregate([
            { $match: { companyId: req.user.companyId, department: { $in: depIds } } },
            { $group: { _id: "$department", count: { $sum: 1 } } }
        ]);
        
        const countMap = empCounts.reduce((acc, curr) => {
            acc[curr._id.toString()] = curr.count;
            return acc;
        }, {});
        
        const enhancedDeps = departments.map(dep => ({
            ...dep,
            employeeCount: countMap[dep._id.toString()] || 0
        }));

        return res.status(200).json({ success: true, departments: enhancedDeps });
    } catch (error) {
        console.error("get department error:", error);
        return res.status(500).json({ success: false, error: "get department server error" });
    }
}

const addDepartment = async (req, res) => {
    try {
        const { dep_name, description } = req.body;
        const newDep = new Department({
            companyId: req.user.companyId,
            dep_name,
            description
        })
        await newDep.save()
        return res.status(200).json({ success: true, department: newDep })
    } catch (error) {
        return res.status(500).json({ success: false, error: "add department server error" })
    }
}

const getDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const department = await Department.findOne({ _id: id, companyId: req.user.companyId })
        return res.status(200).json({ success: true, department })
    } catch (error) {
        return res.status(500).json({ success: false, error: "get department server error" })
    }
}

const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { dep_name, description } = req.body;
        const updateDep = await Department.findOneAndUpdate({ _id: id, companyId: req.user.companyId }, {
            dep_name,
            description
        })
        return res.status(200).json({ success: true, updateDep })
    } catch (error) {
        return res.status(500).json({ success: false, error: "edit department server error" })
    }
}

const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await Department.findOne({ _id: id, companyId: req.user.companyId });
        if (!department) {
            return res.status(404).json({ success: false, error: "Department not found" });
        }

        await department.deleteOne();

        return res.status(200).json({ success: true, message: "Department deleted successfully" });
    } catch (error) {
        console.error("Delete department error:", error);
        return res.status(500).json({ success: false, error: "Delete department server error" });
    }
};

export { addDepartment, getDepartments, getDepartment, updateDepartment, deleteDepartment }