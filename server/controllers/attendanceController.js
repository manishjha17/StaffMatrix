import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

const getAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ companyId: req.user.companyId })
            .populate({
                path: "userId",
                select: "-password"
            })
            .populate({
                path: "employeeId",
                populate: {
                    path: "department"
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, attendance });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Error fetching attendance" });
    }
};

const getAttendanceStatus = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id, companyId: req.user.companyId });
        
        const today = new Date().toISOString().split('T')[0];
        
        const query = { date: today, companyId: req.user.companyId };
        if (employee) {
            query.$or = [{ userId: req.user._id }, { employeeId: employee._id }];
        } else {
            query.userId = req.user._id;
        }
        
        const record = await Attendance.findOne(query);

        if (!record) {
            return res.status(200).json({ success: true, checkedIn: false, checkedOut: false });
        }

        return res.status(200).json({
            success: true,
            checkedIn: true,
            checkedOut: record.checkOut ? true : false,
            checkInTime: record.checkIn,
            checkOutTime: record.checkOut
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Error checking status" });
    }
};

const checkIn = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id, companyId: req.user.companyId });
        
        const today = new Date().toISOString().split('T')[0];
        
        const query = { date: today, companyId: req.user.companyId };
        if (employee) {
            query.$or = [{ userId: req.user._id }, { employeeId: employee._id }];
        } else {
            query.userId = req.user._id;
        }

        let record = await Attendance.findOne(query);

        if (record) {
            return res.status(400).json({ success: false, error: "Already checked in today" });
        }

        const attendanceData = {
            companyId: req.user.companyId,
            userId: req.user._id,
            date: today,
            checkIn: new Date(),
            status: "Present"
        };
        
        if (employee) {
            attendanceData.employeeId = employee._id;
        }

        record = new Attendance(attendanceData);

        await record.save();
        return res.status(200).json({ success: true, message: "Checked in successfully", record });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Error on check-in" });
    }
};

const checkOut = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id, companyId: req.user.companyId });
        const today = new Date().toISOString().split('T')[0];
        
        const query = { date: today, companyId: req.user.companyId };
        if (employee) {
            query.$or = [{ userId: req.user._id }, { employeeId: employee._id }];
        } else {
            query.userId = req.user._id;
        }

        const record = await Attendance.findOne(query);

        if (!record) {
            return res.status(400).json({ success: false, error: "Must check in first" });
        }

        if (record.checkOut) {
            return res.status(400).json({ success: false, error: "Already checked out today" });
        }

        record.checkOut = new Date();
        await record.save();
        return res.status(200).json({ success: true, message: "Checked out successfully", record });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Error on check-out" });
    }
};

const getAttendanceAnalytics = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // --- Total employee headcount for the company ---
        const totalEmployees = await Employee.countDocuments({ companyId: req.user.companyId });

        // --- Today's stats ---
        const todayRecords = await Attendance.find({ companyId: req.user.companyId, date: today });
        const presentToday = todayRecords.filter(r => r.status === 'Present').length;
        const onDuty = todayRecords.filter(r => r.checkIn && !r.checkOut && r.status === 'Present').length;
        const completedToday = todayRecords.filter(r => r.checkIn && r.checkOut && r.status === 'Present').length;
        const absentToday = Math.max(0, totalEmployees - presentToday);
        const attendanceRate = totalEmployees > 0
            ? Math.round((presentToday / totalEmployees) * 100)
            : 0;

        // Average check-in time today (in minutes from midnight)
        const checkInMinutes = todayRecords
            .filter(r => r.checkIn && r.status === 'Present')
            .map(r => {
                const d = new Date(r.checkIn);
                return d.getHours() * 60 + d.getMinutes();
            });
        const avgCheckInMin = checkInMinutes.length
            ? Math.round(checkInMinutes.reduce((a, b) => a + b, 0) / checkInMinutes.length)
            : null;
        const avgCheckInTime = avgCheckInMin !== null
            ? `${String(Math.floor(avgCheckInMin / 60)).padStart(2, '0')}:${String(avgCheckInMin % 60).padStart(2, '0')}`
            : null;

        // --- Weekly trend (last 7 days) ---
        const weeklyTrend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const present = await Attendance.countDocuments({ companyId: req.user.companyId, date: dateStr, status: 'Present' });
            const absent = Math.max(0, totalEmployees - present);
            weeklyTrend.push({
                date: dateStr,
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                present,
                absent,
                rate: totalEmployees > 0 ? Math.round((present / totalEmployees) * 100) : 0
            });
        }

        // --- Monthly trend (last 30 days) ---
        const monthlyTrend = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const present = await Attendance.countDocuments({ companyId: req.user.companyId, date: dateStr, status: 'Present' });
            const absent = Math.max(0, totalEmployees - present);
            monthlyTrend.push({ date: dateStr, present, absent });
        }

        // --- Status breakdown (for today) ---
        const sickToday = todayRecords.filter(r => r.status === 'Sick').length;
        const leaveToday = todayRecords.filter(r => r.status === 'Leave').length;
        const explicitlyAbsentToday = todayRecords.filter(r => r.status === 'Absent').length;
        
        const totalAccountedFor = presentToday + sickToday + leaveToday + explicitlyAbsentToday;
        const missing = Math.max(0, totalEmployees - totalAccountedFor);
        const totalAbsentToday = explicitlyAbsentToday + missing;

        const statusBreakdown = [];
        if (presentToday > 0) statusBreakdown.push({ _id: 'Present', count: presentToday });
        if (totalAbsentToday > 0) statusBreakdown.push({ _id: 'Absent', count: totalAbsentToday });
        if (sickToday > 0) statusBreakdown.push({ _id: 'Sick', count: sickToday });
        if (leaveToday > 0) statusBreakdown.push({ _id: 'Leave', count: leaveToday });

        return res.status(200).json({
            success: true,
            analytics: {
                totalEmployees,
                today: {
                    present: presentToday,
                    onDuty,
                    completed: completedToday,
                    absent: absentToday,
                    attendanceRate,
                    avgCheckInTime
                },
                weeklyTrend,
                monthlyTrend,
                statusBreakdown
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Error fetching analytics" });
    }
};

export { getAttendance, getAttendanceStatus, checkIn, checkOut, getAttendanceAnalytics };
