import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';

/**
 * Marks absent records for all employees who did not punch in on a given date.
 * Called by the scheduler at end-of-day (23:59) for the previous/current date.
 */
const markAbsentEmployees = async (dateStr) => {
    try {
        // Get all unique company IDs from the Employee collection
        const companyIds = await Employee.distinct('companyId');

        let totalMarked = 0;

        for (const companyId of companyIds) {
            // All employees in this company
            const employees = await Employee.find({ companyId });

            for (const emp of employees) {
                // Check if a record already exists for this employee+date
                const existing = await Attendance.findOne({
                    companyId,
                    date: dateStr,
                    $or: [
                        { userId: emp.userId },
                        { employeeId: emp._id }
                    ]
                });

                if (!existing) {
                    // No punch record — create Absent record
                    await Attendance.create({
                        companyId,
                        userId: emp.userId,
                        employeeId: emp._id,
                        date: dateStr,
                        checkIn: null,
                        status: 'Absent'
                    });
                    totalMarked++;
                }
            }
        }

        console.log(`[Attendance Cron] Marked ${totalMarked} employee(s) as Absent for ${dateStr}`);
        return totalMarked;
    } catch (error) {
        console.error('[Attendance Cron] Error marking absent employees:', error);
        throw error;
    }
};

/**
 * Simple scheduler: runs markAbsentEmployees every day at 23:59 local time.
 * Uses native setTimeout — no external dependencies needed.
 */
const startAttendanceCron = () => {
    const scheduleNextRun = () => {
        const now = new Date();

        // Next 23:59:00 today
        const nextRun = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23, 59, 0, 0
        );

        // If 23:59 already passed today, schedule for tomorrow
        if (now >= nextRun) {
            nextRun.setDate(nextRun.getDate() + 1);
        }

        const msUntilRun = nextRun - now;

        console.log(`[Attendance Cron] Next absent-marking run scheduled at ${nextRun.toLocaleString()} (in ${Math.round(msUntilRun / 60000)} minutes)`);

        setTimeout(async () => {
            // Mark for today's date
            const dateStr = new Date().toISOString().split('T')[0];
            await markAbsentEmployees(dateStr);

            // Schedule the next day's run
            scheduleNextRun();
        }, msUntilRun);
    };

    scheduleNextRun();
};

export { startAttendanceCron, markAbsentEmployees };
