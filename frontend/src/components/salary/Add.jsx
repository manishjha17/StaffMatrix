import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { fetchDepartments, getEmployees } from '../../utils/EmployeeHelper';
import {
    FaMoneyBillWave, FaUsers, FaChartLine, FaTrophy,
    FaPlusCircle, FaHistory, FaArrowUp, FaArrowDown,
    FaCalendarAlt, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';

/* ─────────────────── tiny helpers ─────────────────── */
const fmt = (n) =>
    n >= 1_00_00_000 ? `₹${(n / 1_00_00_000).toFixed(1)}Cr`
        : n >= 1_00_000 ? `₹${(n / 1_00_000).toFixed(1)}L`
            : n >= 1_000 ? `₹${(n / 1_000).toFixed(1)}K`
                : `₹${n || 0}`;

const BarChart = ({ data, valueKey = 'net', label = 'Net Pay' }) => {
    const max = Math.max(...data.map(d => d[valueKey] || 0), 1);
    return (
        <div className="flex items-end gap-2 h-32 w-full">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full flex items-end justify-center" style={{ height: '96px' }}>
                        <div
                            className="w-full rounded-t-lg transition-all duration-700 bg-gradient-to-t from-violet-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-cyan-400"
                            style={{ height: `${Math.max(4, ((d[valueKey] || 0) / max) * 96)}px` }}
                        />
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-1 rounded">
                            {fmt(d[valueKey])}
                        </div>
                    </div>
                    <span className="text-[9px] text-slate-500 text-center leading-tight">{d.label}</span>
                </div>
            ))}
        </div>
    );
};

const KPICard = ({ icon: Icon, label, value, sub, accent = 'indigo', trend }) => {
    const colors = {
        indigo: 'from-indigo-600/20 to-indigo-500/5 border-indigo-500/20 text-indigo-400',
        violet: 'from-violet-600/20 to-violet-500/5 border-violet-500/20 text-violet-400',
        emerald: 'from-emerald-600/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
        amber: 'from-amber-600/20 to-amber-500/5 border-amber-500/20 text-amber-400',
        rose: 'from-rose-600/20 to-rose-500/5 border-rose-500/20 text-rose-400',
        cyan: 'from-cyan-600/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
    };
    const cls = colors[accent] || colors.indigo;
    return (
        <div className={`rounded-2xl border bg-gradient-to-br ${cls} p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${cls} border shrink-0`}>
                <Icon className="text-lg" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold truncate">{label}</p>
                <p className="text-lg font-extrabold text-white truncate">{value}</p>
                {sub && <p className="text-[10px] text-slate-500 mt-0.5 truncate">{sub}</p>}
            </div>
        </div>
    );
};

/* ─────────────────── main component ─────────────────── */
const SalaryDashboard = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    // Analytics state
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    // Add-salary form state
    const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'add'
    const [departments, setDepartments] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [salary, setSalary] = useState({
        employeeId: '', basicSalary: '', allowances: '', deductions: '', payDate: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitMsg, setSubmitMsg] = useState(null);

    // Net preview
    const netPreview =
        (parseInt(salary.basicSalary) || 0)
        + (parseInt(salary.allowances) || 0)
        - (parseInt(salary.deductions) || 0);

    const fetchAnalytics = async () => {
        try {
            setAnalyticsLoading(true);
            const res = await axios.get('/api/salary/analytics', { headers });
            if (res.data.success) setAnalytics(res.data.analytics);
        } catch { /* silently */ }
        finally { setAnalyticsLoading(false); }
    };

    useEffect(() => {
        fetchAnalytics();
        fetchDepartments().then(setDepartments);
    }, []);

    const handleDepartment = async (e) => {
        const emps = await getEmployees(e.target.value);
        setEmployees(emps);
        setSalary(p => ({ ...p, employeeId: '' }));
    };

    const handleChange = (e) => {
        if (e.target.name === 'employeeId') {
            const selectedEmp = employees.find(emp => emp._id === e.target.value);
            setSalary(p => ({
                ...p,
                employeeId: e.target.value,
                basicSalary: selectedEmp ? selectedEmp.salary : p.basicSalary
            }));
        } else {
            setSalary(p => ({ ...p, [e.target.name]: e.target.value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitMsg(null);
        try {
            const res = await axios.post('/api/salary/add', salary, { headers });
            if (res.data.success) {
                setSubmitMsg({ type: 'success', text: 'Salary record added successfully!' });
                setSalary({ employeeId: '', basicSalary: '', allowances: '', deductions: '', payDate: '' });
                setEmployees([]);
                fetchAnalytics();
                setTimeout(() => setActiveTab('analytics'), 1500);
            }
        } catch (err) {
            setSubmitMsg({ type: 'error', text: err.response?.data?.error || 'Failed to add salary.' });
        } finally {
            setSubmitting(false);
            setTimeout(() => setSubmitMsg(null), 4000);
        }
    };

    /* ─── render ─── */
    return (
        <div className="space-y-6 animate-fade-in-up">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Salary Dashboard</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage payroll, disbursements & compensation analytics</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${activeTab === 'analytics'
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/25'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'}`}
                    >
                        <FaChartLine /> Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('add')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${activeTab === 'add'
                            ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-600/25'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'}`}
                    >
                        <FaPlusCircle /> Add Salary
                    </button>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <KPICard
                    icon={FaMoneyBillWave}
                    label="Total Disbursed"
                    value={analyticsLoading ? '—' : fmt(analytics?.totalDisbursed)}
                    sub="all time net pay"
                    accent="violet"
                />
                <KPICard
                    icon={FaChartLine}
                    label="Avg Salary"
                    value={analyticsLoading ? '—' : fmt(analytics?.avgSalary)}
                    sub="per record"
                    accent="indigo"
                />
                <KPICard
                    icon={FaTrophy}
                    label="Highest Pay"
                    value={analyticsLoading ? '—' : fmt(analytics?.highestSalary)}
                    sub="single disbursement"
                    accent="amber"
                />
                <KPICard
                    icon={FaArrowUp}
                    label="Total Allowances"
                    value={analyticsLoading ? '—' : fmt(analytics?.totalAllowances)}
                    sub="cumulative"
                    accent="emerald"
                />
                <KPICard
                    icon={FaArrowDown}
                    label="Total Deductions"
                    value={analyticsLoading ? '—' : fmt(analytics?.totalDeductions)}
                    sub="cumulative"
                    accent="rose"
                />
                <KPICard
                    icon={FaHistory}
                    label="Total Records"
                    value={analyticsLoading ? '—' : (analytics?.totalRecords ?? 0)}
                    sub="salary entries"
                    accent="cyan"
                />
            </div>

            {/* ── Analytics Tab ── */}
            {activeTab === 'analytics' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Monthly trend chart */}
                    <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-white text-base">Monthly Payroll Trend</h3>
                                <p className="text-xs text-slate-400">Net pay disbursed — last 6 months</p>
                            </div>
                            <FaChartLine className="text-indigo-400 text-xl" />
                        </div>
                        {analyticsLoading ? (
                            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
                        ) : analytics?.monthlyTrend?.length > 0 ? (
                            <BarChart data={analytics.monthlyTrend} valueKey="net" />
                        ) : (
                            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">No payroll data yet</div>
                        )}

                        {/* Allowances vs Deductions mini bars */}
                        {!analyticsLoading && analytics?.monthlyTrend?.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Allowances / mo</p>
                                    <div className="flex items-end gap-1 h-8">
                                        {analytics.monthlyTrend.map((d, i) => {
                                            const maxA = Math.max(...analytics.monthlyTrend.map(x => x.allowances || 0), 1);
                                            return (
                                                <div key={i} className="flex-1 rounded-sm bg-emerald-500/30 hover:bg-emerald-500/60 transition-all"
                                                    style={{ height: `${Math.max(3, ((d.allowances || 0) / maxA) * 32)}px` }} />
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Deductions / mo</p>
                                    <div className="flex items-end gap-1 h-8">
                                        {analytics.monthlyTrend.map((d, i) => {
                                            const maxD = Math.max(...analytics.monthlyTrend.map(x => x.deductions || 0), 1);
                                            return (
                                                <div key={i} className="flex-1 rounded-sm bg-rose-500/30 hover:bg-rose-500/60 transition-all"
                                                    style={{ height: `${Math.max(3, ((d.deductions || 0) / maxD) * 32)}px` }} />
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recent payouts */}
                    <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-white text-base">Recent Payouts</h3>
                                <p className="text-xs text-slate-400">Last 5 salary entries</p>
                            </div>
                            <FaHistory className="text-violet-400 text-lg" />
                        </div>
                        {analyticsLoading ? (
                            <div className="text-slate-500 text-sm text-center py-6">Loading…</div>
                        ) : analytics?.recentSalaries?.length > 0 ? (
                            <div className="space-y-3">
                                {analytics.recentSalaries.map((s, i) => (
                                    <div key={s._id || i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                                        <div>
                                            <p className="text-white text-sm font-semibold">
                                                {s.employeeId?.employeeId || '—'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {s.employeeId?.department?.dep_name || '—'} · {new Date(s.payDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-bold text-sm">{fmt(s.netSalary)}</p>
                                            <p className="text-[10px] text-emerald-400">+{fmt(s.allowances)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-slate-500 text-sm text-center py-6">No salary records found.</div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Add Salary Tab ── */}
            {activeTab === 'add' && (
                <div className="glass-panel rounded-2xl border border-slate-800 p-8 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500" />

                    <div className="flex items-center gap-3 mb-7">
                        <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                            <FaMoneyBillWave className="text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-white">Add Salary Record</h2>
                            <p className="text-xs text-slate-400">Assign a payroll entry to an employee</p>
                        </div>
                    </div>

                    {submitMsg && (
                        <div className={`flex items-center gap-2 mb-5 px-4 py-3 rounded-xl border text-sm font-medium ${submitMsg.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                            {submitMsg.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
                            {submitMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* Department */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Department</label>
                                <select
                                    name="department"
                                    onChange={handleDepartment}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm [&>option]:bg-slate-950 [&>option]:text-white"
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departments?.map(dep => (
                                        <option value={dep._id} key={dep._id}>{dep.dep_name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Employee */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Employee</label>
                                <select
                                    name="employeeId"
                                    value={salary.employeeId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm [&>option]:bg-slate-950 [&>option]:text-white"
                                    required
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.employeeId}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Basic Salary */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Basic Salary (₹)</label>
                                <input
                                    type="number" name="basicSalary" value={salary.basicSalary}
                                    onChange={handleChange} placeholder="e.g. 50000" min="0"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                                    required
                                />
                            </div>

                            {/* Allowances */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Allowances (₹)</label>
                                <input
                                    type="number" name="allowances" value={salary.allowances}
                                    onChange={handleChange} placeholder="e.g. 5000" min="0"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                                    required
                                />
                            </div>

                            {/* Deductions */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Deductions (₹)</label>
                                <input
                                    type="number" name="deductions" value={salary.deductions}
                                    onChange={handleChange} placeholder="e.g. 2000" min="0"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                                    required
                                />
                            </div>

                            {/* Pay Date */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Pay Date</label>
                                <input
                                    type="date" name="payDate" value={salary.payDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Net Salary Preview */}
                        {(salary.basicSalary || salary.allowances || salary.deductions) && (
                            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-600/10 to-violet-600/10 border border-indigo-500/20">
                                <div className="space-y-0.5">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Net Salary Preview</p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-slate-300">Base: <span className="text-white font-bold">₹{parseInt(salary.basicSalary) || 0}</span></span>
                                        <span className="text-emerald-400">+Allowances: <span className="font-bold">₹{parseInt(salary.allowances) || 0}</span></span>
                                        <span className="text-rose-400">-Deductions: <span className="font-bold">₹{parseInt(salary.deductions) || 0}</span></span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total</p>
                                    <p className="text-2xl font-extrabold text-white">₹{netPreview.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-indigo-600/30 text-white rounded-xl font-bold hover:scale-[1.01] active:scale-[0.99] transition-all text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</>
                            ) : (
                                <><FaPlusCircle /> Add Salary Record</>
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SalaryDashboard;
