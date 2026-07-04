import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FaClock, FaSearch, FaUserCheck, FaRunning, FaCheckDouble, FaTimesCircle,
    FaChartBar, FaCalendarDay, FaCalendarAlt
} from 'react-icons/fa';

/* ─── tiny inline bar chart — stacked present/absent ─────────── */
const BarChart = ({ data }) => {
    const maxVal = Math.max(...data.map(d => (d.present || 0) + (d.absent || 0)), 1);
    return (
        <div className="flex items-end gap-1.5 h-24 w-full">
            {data.map((d, i) => {
                const total = (d.present || 0) + (d.absent || 0);
                const presentH = Math.round((d.present / maxVal) * 72);
                const absentH  = Math.round((d.absent  / maxVal) * 72);
                return (
                    <div key={i} className="flex flex-col items-center flex-1 gap-1">
                        <span className="text-[9px] text-slate-500 font-bold">{d.present ?? d.value ?? 0}</span>
                        <div className="flex flex-col-reverse w-full rounded-t-md overflow-hidden" style={{ height: `${Math.max(total > 0 ? presentH + absentH : 2, 2)}px` }}>
                            {d.absent > 0 && <div className="w-full" style={{ height: `${absentH}px`, background: 'rgba(248,113,113,0.5)' }} />}
                            {d.present > 0 && <div className="w-full" style={{ height: `${presentH}px`, background: 'linear-gradient(to top, #6C63FF, #22D3EE)' }} />}
                        </div>
                        <span className="text-[9px] text-slate-500 truncate w-full text-center">{d.label ?? d.day}</span>
                    </div>
                );
            })}
        </div>
    );
};

/* ─── donut segment helper ───────────────────────────────────── */
const DonutChart = ({ segments }) => {
    const total = segments.reduce((a, s) => a + s.value, 0) || 1;
    let cumulative = 0;
    const cx = 50, cy = 50, r = 38, strokeW = 14;
    const circumference = 2 * Math.PI * r;

    return (
        <svg viewBox="0 0 100 100" className="w-28 h-28">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(30,41,59,0.8)" strokeWidth={strokeW} />
            {segments.map((seg, i) => {
                const pct = seg.value / total;
                const offset = circumference * (1 - pct);
                const rotation = (cumulative / total) * 360 - 90;
                cumulative += seg.value;
                return (
                    <circle
                        key={i}
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={strokeW}
                        strokeDasharray={`${circumference * pct} ${circumference * (1 - pct)}`}
                        strokeDashoffset={circumference * 0.25}
                        transform={`rotate(${rotation} ${cx} ${cy})`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.6s ease' }}
                    />
                );
            })}
            <text x="50" y="54" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{total}</text>
            <text x="50" y="64" textAnchor="middle" fill="#94a3b8" fontSize="7">total</text>
        </svg>
    );
};

/* ─── stat card ──────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, sub, accent }) => (
    <div className="future-card p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${accent}`}>
            <Icon />
        </div>
        <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-extrabold text-white leading-tight">{value ?? '—'}</p>
            {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════ */
const AttendanceList = () => {
    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [view, setView] = useState('weekly'); // 'weekly' | 'monthly'
    const [markingAbsent, setMarkingAbsent] = useState(false);
    const [markAbsentMsg, setMarkAbsentMsg] = useState(null);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [attRes, anlRes, empRes] = await Promise.all([
                    axios.get('/api/attendance', { headers }),
                    axios.get('/api/attendance/analytics', { headers }),
                    axios.get('/api/employee', { headers }),
                ]);
                if (attRes.data.success) setRecords(attRes.data.attendance);
                if (anlRes.data.success) setAnalytics(anlRes.data.analytics);
                if (empRes.data.success) setEmployees(empRes.data.employees);
            } catch (err) {
                console.error('Fetch error', err);
            } finally {
                setLoading(false);
                setAnalyticsLoading(false);
            }
        };
        fetchAll();
    }, []);

    const handleMarkAbsent = async () => {
        setMarkingAbsent(true);
        setMarkAbsentMsg(null);
        try {
            const today = new Date().toISOString().split('T')[0];
            const res = await axios.post(
                '/api/attendance/mark-absent',
                { date: today },
                { headers }
            );
            if (res.data.success) {
                setMarkAbsentMsg({ type: 'success', text: res.data.message });
                // Reload data to reflect new absent records
                const [attRes, anlRes, empRes] = await Promise.all([
                    axios.get('/api/attendance', { headers }),
                    axios.get('/api/attendance/analytics', { headers }),
                    axios.get('/api/employee', { headers }),
                ]);
                if (attRes.data.success) setRecords(attRes.data.attendance);
                if (anlRes.data.success) setAnalytics(anlRes.data.analytics);
                if (empRes.data.success) setEmployees(empRes.data.employees);
            }
        } catch (err) {
            setMarkAbsentMsg({ type: 'error', text: err.response?.data?.error || 'Failed to mark absent' });
        } finally {
            setMarkingAbsent(false);
            setTimeout(() => setMarkAbsentMsg(null), 5000);
        }
    };

    const getEmployeeName = r => r.userId?.name || r.employeeId?.userId?.name || '—';
    const getEmployeeId   = r => r.employeeId?.employeeId || '—';
    const getDepartment   = r => r.employeeId?.department?.dep_name || '—';
    const formatTime      = d => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

    // Build merged rows: attendance records + absent employees (not punched in for the date)
    const today = new Date().toISOString().split('T')[0];
    const activeDate = filterDate || today;

    // Attendance records for the selected date
    const dateRecords = records.filter(r => r.date === activeDate);

    // Employee IDs that already have a record
    const punchedUserIds = new Set(
        dateRecords.map(r => r.userId?._id || r.userId)
    );
    const punchedEmpIds = new Set(
        dateRecords.map(r => r.employeeId?._id || r.employeeId).filter(Boolean)
    );

    // Employees with NO record for the active date → show as Absent
    const absentRows = employees
        .filter(emp => {
            const userId = emp.userId?._id || emp.userId;
            return !punchedUserIds.has(String(userId)) && !punchedEmpIds.has(String(emp._id));
        })
        .map(emp => {
            const isPast = activeDate < today;
            return {
                _id: `absent-${emp._id}`,
                isAbsent: isPast,
                isPending: !isPast,
                date: activeDate,
                employeeId: emp,          // full employee doc
                userId: emp.userId,       // populated user
            };
        });

    // Combine: attendance records + absent rows
    const allRows = [
        ...dateRecords.map(r => ({ ...r, isAbsent: r.status === 'Absent', isPending: false })),
        ...absentRows
    ];

    // Apply search filter on the combined list
    const filteredRecords = allRows.filter(r => {
        const name  = getEmployeeName(r).toLowerCase();
        const empId = getEmployeeId(r).toLowerCase();
        const term  = searchTerm.toLowerCase();
        return name.includes(term) || empId.includes(term);
    });

    /* weekly bar data */
    const weeklyData = (analytics?.weeklyTrend || []).map(d => ({ label: d.day, present: d.present, absent: d.absent }));

    /* monthly: group into 4 weeks */
    const monthlyData = (() => {
        const days = analytics?.monthlyTrend || [];
        if (!days.length) return [];
        const weeks = [];
        for (let i = 0; i < days.length; i += 7) {
            const slice = days.slice(i, i + 7);
            weeks.push({
                label: `W${Math.floor(i / 7) + 1}`,
                present: slice.reduce((a, d) => a + d.present, 0),
                absent:  slice.reduce((a, d) => a + d.absent,  0)
            });
        }
        return weeks;
    })();

    /* donut segments */
    const statusColors = { Present: '#22d3ee', Absent: '#f87171', Sick: '#fbbf24', Leave: '#818cf8' };
    const donutSegments = (analytics?.statusBreakdown || []).map(s => ({
        label: s._id,
        value: s.count,
        color: statusColors[s._id] || '#94a3b8'
    }));

    if (loading) return <div className="text-slate-400 text-center py-20 animate-pulse">Loading attendance data...</div>;

    return (
        <div className="space-y-8">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-extrabold text-white">Attendance Dashboard</h3>
                    <p className="text-slate-400 text-xs mt-1">Real-time overview of employee attendance across your company</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <button
                        onClick={handleMarkAbsent}
                        disabled={markingAbsent}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaTimesCircle className="text-xs" />
                        {markingAbsent ? 'Marking...' : 'Mark Absent Now'}
                    </button>
                    {markAbsentMsg && (
                        <span className={`text-[11px] font-medium ${
                            markAbsentMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                            {markAbsentMsg.type === 'success' ? '✓' : '✗'} {markAbsentMsg.text}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Today's KPI Cards ── */}
            {!analyticsLoading && analytics && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard
                        icon={FaUserCheck}
                        label="Total Employees"
                        value={analytics.totalEmployees}
                        sub="registered in company"
                        accent="bg-slate-700/30 text-slate-300 border border-slate-700/40"
                    />
                    <StatCard
                        icon={FaCheckDouble}
                        label="Present Today"
                        value={analytics.today.present}
                        sub={`${analytics.today.attendanceRate}% attendance rate`}
                        accent="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    />
                    <StatCard
                        icon={FaRunning}
                        label="On Duty Now"
                        value={analytics.today.onDuty}
                        sub="active shifts right now"
                        accent="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    />
                    <StatCard
                        icon={FaTimesCircle}
                        label="Not Punched In"
                        value={analytics.today.absent}
                        sub="employees not yet here"
                        accent="bg-red-500/10 text-red-400 border border-red-500/20"
                    />
                    <StatCard
                        icon={FaClock}
                        label="Avg Check-In"
                        value={analytics.today.avgCheckInTime || 'N/A'}
                        sub="average arrival time today"
                        accent="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    />
                </div>
            )}

            {/* ── Charts Row ── */}
            {!analyticsLoading && analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Trend chart */}
                    <div className="future-card p-6 space-y-4 lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FaChartBar className="text-indigo-400 text-sm" />
                                <h4 className="font-bold text-white text-sm">Attendance Trend</h4>
                            </div>
                            <div className="flex gap-1 bg-slate-900 rounded-lg p-0.5">
                                {['weekly', 'monthly'].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setView(v)}
                                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                                            view === v
                                                ? 'bg-indigo-600 text-white shadow'
                                                : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {v === 'weekly' ? '7 Days' : '30 Days'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <BarChart data={view === 'weekly' ? weeklyData : monthlyData} />
                        <div className="flex items-center gap-4 pt-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'linear-gradient(to top, #6C63FF, #22D3EE)' }} />
                                Present
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <div className="w-2.5 h-2.5 rounded-sm bg-red-400/50" />
                                Absent
                            </div>
                            <span className="ml-auto text-[10px] text-slate-600">
                                {view === 'weekly' ? 'Last 7 days' : 'Last 30 days (grouped by week)'}
                            </span>
                        </div>
                    </div>

                    {/* Status Donut */}
                    <div className="future-card p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <FaCalendarDay className="text-cyan-400 text-sm" />
                            <h4 className="font-bold text-white text-sm">Status Breakdown</h4>
                        </div>
                        {donutSegments.length > 0 ? (
                            <div className="flex flex-col items-center gap-4">
                                <DonutChart segments={donutSegments} />
                                <div className="w-full space-y-2">
                                    {donutSegments.map(seg => (
                                        <div key={seg.label} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                                                <span className="text-slate-400">{seg.label}</span>
                                            </div>
                                            <span className="font-bold text-white">{seg.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 text-center py-6">No data yet</p>
                        )}
                    </div>
                </div>
            )}

            {/* ── Log Table ── */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-slate-400 text-sm" />
                    <h4 className="font-bold text-white text-sm">Attendance Logs</h4>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                            <FaSearch className="text-xs" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Employee ID or Name..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Filter Date:</span>
                        <input
                            type="date"
                            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)}
                        />
                        {filterDate && (
                            <button
                                onClick={() => setFilterDate('')}
                                className="px-3 py-2 bg-slate-800 border border-slate-700 text-xs hover:text-white rounded-xl font-bold cursor-pointer"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {filteredRecords.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-sm text-left text-slate-300 border-collapse">
                            <thead className="text-xs uppercase bg-slate-900 border-b border-slate-800 text-slate-300">
                                <tr>
                                    <th className="px-6 py-3.5 text-center">#</th>
                                    <th className="px-6 py-3.5 text-center">Emp ID</th>
                                    <th className="px-6 py-3.5 text-left">Name</th>
                                    <th className="px-6 py-3.5 text-left">Department</th>
                                    <th className="px-6 py-3.5 text-center">Date</th>
                                    <th className="px-6 py-3.5 text-center">Check-In</th>
                                    <th className="px-6 py-3.5 text-center">Check-Out</th>
                                    <th className="px-6 py-3.5 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.map((record, idx) => (
                                    <tr
                                        key={record._id}
                                        className={`border-b border-slate-800 transition-colors ${
                                            record.isAbsent
                                                ? 'bg-red-950/10 hover:bg-red-950/20 opacity-75'
                                                : record.isPending
                                                    ? 'bg-slate-800/20 hover:bg-slate-800/30 opacity-75'
                                                    : 'bg-slate-900/30 hover:bg-slate-800/40'
                                        }`}
                                    >
                                        <td className="px-6 py-3.5 text-center font-medium text-slate-400">{idx + 1}</td>
                                        <td className="px-6 py-3.5 text-center font-semibold text-white">{getEmployeeId(record)}</td>
                                        <td className="px-6 py-3.5 text-left">{getEmployeeName(record)}</td>
                                        <td className="px-6 py-3.5 text-left text-slate-400">{getDepartment(record)}</td>
                                        <td className="px-6 py-3.5 text-center text-slate-400">{record.date}</td>
                                        <td className="px-6 py-3.5 text-center font-medium text-emerald-400">
                                            {record.isAbsent || record.isPending ? (
                                                <span className="text-slate-600">—</span>
                                            ) : (
                                                <div className="flex items-center justify-center space-x-1">
                                                    <FaClock className="text-[10px]" />
                                                    <span>{formatTime(record.checkIn)}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-3.5 text-center font-medium text-amber-400">
                                            {record.isAbsent || record.isPending ? (
                                                <span className="text-slate-600">—</span>
                                            ) : record.checkOut ? (
                                                <div className="flex items-center justify-center space-x-1">
                                                    <FaClock className="text-[10px]" />
                                                    <span>{formatTime(record.checkOut)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-emerald-500 font-semibold text-xs">● Active</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3.5 text-center">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                                                record.isAbsent
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    : record.isPending
                                                        ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                        : record.status === 'Present'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                            : record.status === 'Sick'
                                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                                : record.status === 'Leave'
                                                                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                                {record.isAbsent ? 'Absent' : record.isPending ? 'Pending' : record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="glass-panel p-10 rounded-2xl border-white/5 text-center text-slate-400">
                        No attendance logs found matching the filter criteria.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceList;
