import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    FaMoneyBillWave, FaArrowUp, FaArrowDown, FaSearch,
    FaHistory, FaChartLine, FaTrophy, FaArrowLeft
} from 'react-icons/fa';

const fmt = (n) =>
    n >= 1_00_00_000 ? `₹${(n / 1_00_00_000).toFixed(1)}Cr`
        : n >= 1_00_000 ? `₹${(n / 1_00_000).toFixed(1)}L`
            : n >= 1_000 ? `₹${(n / 1_000).toFixed(1)}K`
                : `₹${n || 0}`;

const View = () => {
    const [salaries, setSalaries] = useState(null);
    const [filteredSalaries, setFilteredSalaries] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();

    const fetchSalaries = async () => {
        try {
            const response = await axios.get(`/api/salary/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.data.success) {
                setSalaries(response.data.salary);
                setFilteredSalaries(response.data.salary);
            }
        } catch (error) {
            if (error.response && !error.response.data.success) {
                alert(error.message);
            }
        }
    };

    useEffect(() => { fetchSalaries(); }, []);

    const handleFilter = (e) => {
        const q = e.target.value;
        setSearchTerm(q);
        setFilteredSalaries(
            salaries.filter(s =>
                s.employeeId.employeeId.toLowerCase().includes(q.toLowerCase())
            )
        );
    };

    // Derived stats
    const totalNet = salaries?.reduce((a, s) => a + (s.netSalary || 0), 0) || 0;
    const totalAllowances = salaries?.reduce((a, s) => a + (s.allowances || 0), 0) || 0;
    const totalDeductions = salaries?.reduce((a, s) => a + (s.deductions || 0), 0) || 0;
    const highest = salaries?.length > 0 ? Math.max(...salaries.map(s => s.netSalary || 0)) : 0;

    if (salaries === null) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">

            {/* Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)} 
                    className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer"
                >
                    <FaArrowLeft className="text-sm" />
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Salary History</h1>
                    <p className="text-slate-400 text-sm mt-1">Review historical payout sheets and disbursement records</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: FaMoneyBillWave, label: 'Total Disbursed', value: fmt(totalNet), accent: 'violet' },
                    { icon: FaArrowUp, label: 'Total Allowances', value: fmt(totalAllowances), accent: 'emerald' },
                    { icon: FaArrowDown, label: 'Total Deductions', value: fmt(totalDeductions), accent: 'rose' },
                    { icon: FaTrophy, label: 'Highest Pay', value: fmt(highest), accent: 'amber' },
                ].map(({ icon: Icon, label, value, accent }) => {
                    const colors = {
                        violet: 'from-violet-600/20 to-violet-500/5 border-violet-500/20 text-violet-400',
                        emerald: 'from-emerald-600/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
                        rose: 'from-rose-600/20 to-rose-500/5 border-rose-500/20 text-rose-400',
                        amber: 'from-amber-600/20 to-amber-500/5 border-amber-500/20 text-amber-400',
                    };
                    return (
                        <div key={label} className={`rounded-2xl border bg-gradient-to-br ${colors[accent]} p-5 flex items-center gap-4`}>
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${colors[accent]} border shrink-0`}>
                                <Icon className="text-lg" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
                                <p className="text-xl font-extrabold text-white">{value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Table */}
            <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-5">
                {/* Search */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-xs">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                        <input
                            type="text"
                            placeholder="Search by Emp ID…"
                            value={searchTerm}
                            onChange={handleFilter}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                        />
                    </div>
                    <span className="text-xs text-slate-500 ml-auto">
                        {filteredSalaries?.length || 0} record{filteredSalaries?.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {filteredSalaries && filteredSalaries.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-sm text-left text-slate-300 border-collapse">
                            <thead className="text-xs uppercase bg-slate-900 border-b border-slate-800 text-slate-400">
                                <tr>
                                    <th className="px-6 py-3.5 text-center">#</th>
                                    <th className="px-6 py-3.5 text-center">Emp ID</th>
                                    <th className="px-6 py-3.5 text-right">Basic Salary</th>
                                    <th className="px-6 py-3.5 text-right">Allowances</th>
                                    <th className="px-6 py-3.5 text-right">Deductions</th>
                                    <th className="px-6 py-3.5 text-right">Net Pay</th>
                                    <th className="px-6 py-3.5 text-center">Pay Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSalaries.map((salary, idx) => (
                                    <tr
                                        key={salary._id}
                                        className="border-b border-slate-800 bg-slate-900/30 hover:bg-slate-800/40 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-semibold text-white">{salary.employeeId.employeeId}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-300">₹{salary.basicSalary?.toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-emerald-400 font-medium">+₹{salary.allowances?.toLocaleString('en-IN')}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-rose-400 font-medium">-₹{salary.deductions?.toLocaleString('en-IN')}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-extrabold text-white text-base">₹{salary.netSalary?.toLocaleString('en-IN')}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
                                                {new Date(salary.payDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <FaHistory className="text-slate-700 text-4xl mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">No salary records found</p>
                        <p className="text-slate-600 text-sm mt-1">Salary payouts will appear here once added</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default View;
