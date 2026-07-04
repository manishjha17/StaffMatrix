import Employee from '../models/Employee.js'
import Leave from '../models/Leave.js'
const addLeave = async (req, res) => {
    try {
        const { userId, leaveType, startDate, endDate, reason } = req.body
        const employee = await Employee.findOne({ userId, companyId: req.user.companyId })

        const newLeave = await Leave({
            companyId: req.user.companyId,
            employeeId: employee._id,
            leaveType,
            startDate,
            endDate,
            reason
        })

        await newLeave.save()

        return res.status(200).json({ success: true })
    } catch (error) {
        return res.status(500).json({ success: false, error: "Leave add server error" })
    }
}

const getLeave = async (req, res) => {
    try {
        const { id } = req.params;

        let leaves = await Leave.find({ employeeId: id, companyId: req.user.companyId });
        
        if (leaves.length === 0) {
            const employee = await Employee.findOne({ userId: id, companyId: req.user.companyId });
            if (employee) {
                leaves = await Leave.find({ employeeId: employee._id, companyId: req.user.companyId });
            }
        }

        return res.status(200).json({ success: true, leaves });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, error: 'leave get server error' });
    }
};


const getLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ companyId: req.user.companyId }).populate({
            path: "employeeId",
            populate: [
                {
                    path: 'department',
                    select: 'dep_name'
                },
                {
                    path: 'userId',
                    select: 'name'
                }
            ]
        })

        return res.status(200).json({ success: true, leaves })
    } catch (error) {
        console.log(error.maeesage)
        return res.status(500).json({ success: false, error: "leave get server error" })
    }
}

const getLeaveDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const leave = await Leave.findOne({ _id: id, companyId: req.user.companyId }).populate({
            path: "employeeId",
            populate: [
                {
                    path: 'department',
                    select: 'dep_name'
                },
                {
                    path: 'userId',
                    select: 'name profileImage'
                }
            ]
        })

        return res.status(200).json({ success: true, leave })
    } catch (error) {
        console.log(error.maeesage)
        return res.status(500).json({ success: false, error: "leave get server error" })
    }
}

const updateLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const leave = await Leave.findOneAndUpdate({ _id: id, companyId: req.user.companyId }, { status: req.body.status })
        if (!leave) {
            return res.status(404).json({ success: false, error: "leave not founded" })
        }

        return res.status(200).json({ success: true })

    } catch (error) {
        console.log(error.maeesage)
        return res.status(500).json({ success: false, error: "leave update server error" })
    }
}



export { addLeave, getLeave, getLeaves, getLeaveDetail, updateLeave }