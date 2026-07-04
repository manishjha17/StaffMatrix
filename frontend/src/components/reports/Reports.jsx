import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFileCsv, FaChartPie, FaDownload, FaUsers, FaMoneyBill, FaCalendarTimes, FaBuilding } from 'react-icons/fa';

const Reports = () => {
    const [employees, setEmployees] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'export'

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
                
                // Fetch datasets
                const [empRes, salRes, leaveRes, depRes] = await Promise.all([
                    axios.get('/api/employee', { headers }),
                    axios.get('/api/salary/add', { headers }).catch(() => ({ data: { success: true, salaries: [] } })), // fallback if route is specific or fails
                    axios.get('/api/leave', { headers }),
                    axios.get('/api/department', { headers })
                ]);

                if (empRes.data.success) setEmployees(empRes.data.employees);
                if (leaveRes.data.success) setLeaves(leaveRes.data.leaves || []);
                if (depRes.data.success) setDepartments(depRes.data.departments);

                // Fetching individual salaries if list is not globally available, or compile from employee list
                const allSalaries = [];
                // Some projects save salaries inside employee records or require individual fetch
                // We'll fallback to compile salary details from employee records
                if (empRes.data.success) {
                    empRes.data.employees.forEach(emp => {
                        allSalaries.push({
                            employeeId: emp.employeeId,
                            name: emp.userId.name,
                            department: emp.department.dep_name,
                            designation: emp.designation,
                            salary: emp.salary,
                            payDate: emp.createdAt
                        });
                    });
                }
                setSalaries(allSalaries);

            } catch (error) {
                console.error("Error loading reports data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, []);

    // CSV generation helpers
    const downloadCSV = (headers, data, filename) => {
        const csvRows = [];
        csvRows.push(headers.join(','));

        data.forEach(row => {
            const values = row.map(val => {
                const escaped = ('' + val).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportEmployees = () => {
        const headers = ["Employee ID", "Name", "Department", "Designation", "Gender", "Marital Status", "Basic Salary"];
        const data = employees.map(emp => [
            emp.employeeId,
            emp.userId.name,
            emp.department.dep_name,
            emp.designation,
            emp.gender || 'N/A',
            emp.maritalStatus || 'N/A',
            emp.salary
        ]);
        downloadCSV(headers, data, 'employees_report');
    };

    const exportPayroll = () => {
        const headers = ["Employee ID", "Name", "Department", "Designation", "Monthly Salary"];
        const data = salaries.map(sal => [
            sal.employeeId,
            sal.name,
            sal.department,
            sal.designation,
            sal.salary
        ]);
        downloadCSV(headers, data, 'payroll_cost_report');
    };

    const exportLeaves = () => {
        const headers = ["Employee Name", "Leave Type", "Start Date", "End Date", "Reason", "Status"];
        const data = leaves.map(lv => [
            lv.employeeId?.userId?.name || 'Unknown',
            lv.leaveType,
            new Date(lv.startDate).toLocaleDateString(),
            new Date(lv.endDate).toLocaleDateString(),
            lv.reason,
            lv.status
        ]);
        downloadCSV(headers, data, 'leaves_summary_report');
    };

    // Computations for Analytics
    const totalDepartments = departments.length;
    const totalEmployees = employees.length;
    const totalSalaryExpense = employees.reduce((acc, curr) => acc + (curr.salary || 0), 0);
    
    const leaveStats = {
        applied: leaves.length,
        approved: leaves.filter(l => l.status === 'Approved').length,
        pending: leaves.filter(l => l.status === 'Pending').length,
        rejected: leaves.filter(l => l.status === 'Rejected').length,
    };

    // Calculate department headcount distribution
    const depHeadcounts = {};
    departments.forEach(d => { depHeadcounts[d.dep_name] = 0; });
    employees.forEach(emp => {
        const depName = emp.department?.dep_name;
        if (depName && depHeadcounts[depName] !== undefined) {
            depHeadcounts[depName]++;
        }
    });

    if (loading) {
        return <div className="text-slate-400 text-center py-10">Compiling analytical databases...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-extrabold text-white">Reports & PDF Data Center</h3>
                <p className="text-slate-400 text-xs mt-1">Export spreadsheets and inspect real-time workforce metrics</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800">
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
                        activeTab === 'analytics'
                            ? 'border-[#6C63FF] text-[#6C63FF]'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    <FaChartPie className="text-xs" />
                    <span>Visual Analytics</span>
                </button>
                <button
                    onClick={() => setActiveTab('export')}
                    className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
                        activeTab === 'export'
                            ? 'border-[#6C63FF] text-[#6C63FF]'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    <FaFileCsv className="text-xs" />
                    <span>Spreadsheet Exports (CSV)</span>
                </button>
            </div>

            {/* TAB CONTENT: ANALYTICS */}
            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    {/* Top Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="glass-panel p-5 rounded-2xl border-white/5 bg-slate-900/20 flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Headcount</span>
                                <div className="text-2xl font-extrabold text-white">{totalEmployees}</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                                <FaUsers className="text-lg" />
                            </div>
                        </div>

                        <div className="glass-panel p-5 rounded-2xl border-white/5 bg-slate-900/20 flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Monthly Salary Cap</span>
                                <div className="text-2xl font-extrabold text-white">₹{totalSalaryExpense.toLocaleString('en-IN')}</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                <FaMoneyBill className="text-lg" />
                            </div>
                        </div>

                        <div className="glass-panel p-5 rounded-2xl border-white/5 bg-slate-900/20 flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Departments</span>
                                <div className="text-2xl font-extrabold text-white">{totalDepartments}</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                                <FaBuilding className="text-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Chart Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Department Distribution headcounts */}
                        <div className="glass-panel p-6 rounded-2xl border-white/5 bg-slate-900/10 space-y-4">
                            <h4 className="font-bold text-slate-200">Department Headcount Distribution</h4>
                            
                            <div className="space-y-4 pt-2">
                                {Object.keys(depHeadcounts).length > 0 ? (
                                    Object.keys(depHeadcounts).map(dep => {
                                        const count = depHeadcounts[dep];
                                        const percent = totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0;
                                        return (
                                            <div key={dep} className="space-y-1">
                                                <div className="flex justify-between text-xs font-semibold">
                                                    <span className="text-slate-300">{dep}</span>
                                                    <span className="text-slate-400">{count} staff ({percent}%)</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-[#6C63FF] to-[#4F46E5] rounded-full" 
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-slate-500 text-xs text-center py-6">No department data to map.</div>
                                )}
                            </div>
                        </div>

                        {/* Leave statistics distribution */}
                        <div className="glass-panel p-6 rounded-2xl border-white/5 bg-slate-900/10 space-y-4">
                            <h4 className="font-bold text-slate-200">Leave Activity Ratios</h4>
                            
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center space-x-3.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#6C63FF]" />
                                    <div>
                                        <div className="text-xs text-slate-500 font-bold uppercase">Leave Applied</div>
                                        <div className="text-xl font-extrabold text-white mt-0.5">{leaveStats.applied}</div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center space-x-3.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                    <div>
                                        <div className="text-xs text-slate-500 font-bold uppercase">Leave Approved</div>
                                        <div className="text-xl font-extrabold text-white mt-0.5">{leaveStats.approved}</div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center space-x-3.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                    <div>
                                        <div className="text-xs text-slate-500 font-bold uppercase">Leave Pending</div>
                                        <div className="text-xl font-extrabold text-white mt-0.5">{leaveStats.pending}</div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center space-x-3.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                    <div>
                                        <div className="text-xs text-slate-500 font-bold uppercase">Leave Rejected</div>
                                        <div className="text-xl font-extrabold text-white mt-0.5">{leaveStats.rejected}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* TAB CONTENT: EXPORTS */}
            {activeTab === 'export' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Employee Card */}
                    <div className="glass-panel p-6 rounded-2xl border-white/5 bg-slate-900/15 flex flex-col justify-between space-y-6">
                        <div className="space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                                <FaUsers className="text-lg" />
                            </div>
                            <h4 className="font-bold text-white text-base">Active Headcount Report</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Compiles all active worker records, job titles, department mappings, and profiles.
                            </p>
                        </div>
                        <button
                            onClick={exportEmployees}
                            className="w-full py-2.5 bg-gradient-to-r from-[#6C63FF] to-[#4F46E5] text-white hover:scale-[1.02] transition-all rounded-xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                        >
                            <FaDownload className="text-[10px]" />
                            <span>Export Employees CSV</span>
                        </button>
                    </div>

                    {/* Payroll Card */}
                    <div className="glass-panel p-6 rounded-2xl border-white/5 bg-slate-900/15 flex flex-col justify-between space-y-6">
                        <div className="space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                <FaMoneyBill className="text-lg" />
                            </div>
                            <h4 className="font-bold text-white text-base">Payroll Cost Report</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Compiles monthly salary allocations, gross pay configurations, and department budgets.
                            </p>
                        </div>
                        <button
                            onClick={exportPayroll}
                            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:scale-[1.02] transition-all rounded-xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                        >
                            <FaDownload className="text-[10px]" />
                            <span>Export Payroll CSV</span>
                        </button>
                    </div>

                    {/* Leave Card */}
                    <div className="glass-panel p-6 rounded-2xl border-white/5 bg-slate-900/15 flex flex-col justify-between space-y-6">
                        <div className="space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                                <FaCalendarTimes className="text-lg" />
                            </div>
                            <h4 className="font-bold text-white text-base">Leave Activity logs</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Compiles leaves applied, types of leaves taken, dates, and administrative status decisions.
                            </p>
                        </div>
                        <button
                            onClick={exportLeaves}
                            className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 text-white hover:scale-[1.02] transition-all rounded-xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                        >
                            <FaDownload className="text-[10px]" />
                            <span>Export Leaves CSV</span>
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};

export default Reports;
