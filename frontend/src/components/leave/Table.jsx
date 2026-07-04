import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FaSearch, FaArrowLeft, FaEye, FaRegCalendarMinus } from 'react-icons/fa'

const Table = () => {
    const [leaves, setLeaves] = useState(null)
    const [filteredLeaves, setFilteredLeaves] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const navigate = useNavigate()

    const fetchLeaves = async () => {
        try {
            const response = await axios.get('/api/leave', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.data.success) {
                setLeaves(response.data.leaves);
                setFilteredLeaves(response.data.leaves);
            }
        } catch (error) {
            if (error.response && !error.response.data.success) {
                alert(error.response.data.error);
            }
        }
    }

    useEffect(() => {
        fetchLeaves()
    }, []);

    const handleSearch = (e) => {
        const text = e.target.value;
        setSearchTerm(text);
        if(text) {
            const data = leaves.filter((leave) => 
                leave.employeeId.employeeId.toLowerCase().includes(text.toLowerCase()) ||
                leave.employeeId.userId.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredLeaves(data);
        } else {
            setFilteredLeaves(leaves);
        }
    }

    const filterByButton = (status) => {
        if(status === 'All') {
            setFilteredLeaves(leaves);
            return;
        }
        const data = leaves.filter((leave) => leave.status === status);
        setFilteredLeaves(data);
    }

    if (!filteredLeaves) {
        return (
            <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold tracking-wide">Loading Leaves Data...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/admin-dashboard')} 
                        className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer"
                    >
                        <FaArrowLeft className="text-sm" />
                    </button>
                    <div>
                        <h3 className="text-3xl font-extrabold text-white tracking-tight">Manage Leaves</h3>
                        <p className="text-slate-400 text-sm mt-1">Audit, approve or reject staff leave applications</p>
                    </div>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-6 border-slate-800 shadow-xl">
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div className="relative max-w-md w-full">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by Employee ID or Name..."
                            value={searchTerm}
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm shadow-inner"
                            onChange={handleSearch}
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold mr-2 uppercase tracking-wider">Filter Status:</span>
                        <button 
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white transition-all rounded-xl text-xs font-bold cursor-pointer"
                            onClick={() => filterByButton("All")}
                        >
                            All
                        </button>
                        <button 
                            className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 text-amber-400 hover:text-white transition-all rounded-xl text-xs font-bold cursor-pointer"
                            onClick={() => filterByButton("Pending")}
                        >
                            Pending
                        </button>
                        <button 
                            className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 text-emerald-400 hover:text-white transition-all rounded-xl text-xs font-bold cursor-pointer"
                            onClick={() => filterByButton("Approved")}
                        >
                            Approved
                        </button>
                        <button 
                            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-400 hover:text-white transition-all rounded-xl text-xs font-bold cursor-pointer"
                            onClick={() => filterByButton("Rejected")}
                        >
                            Rejected
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                    {filteredLeaves.length > 0 ? (
                        <table className="w-full text-sm text-left text-slate-300 border-collapse">
                            <thead className="text-xs uppercase bg-slate-900 border-b border-slate-700 text-slate-400">
                                <tr>
                                    <th className="px-6 py-4 font-extrabold tracking-wider">S.No</th>
                                    <th className="px-6 py-4 font-extrabold tracking-wider">Employee</th>
                                    <th className="px-6 py-4 font-extrabold tracking-wider">Leave Type</th>
                                    <th className="px-6 py-4 font-extrabold tracking-wider">Duration</th>
                                    <th className="px-6 py-4 font-extrabold tracking-wider text-center">Status</th>
                                    <th className="px-6 py-4 font-extrabold tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredLeaves.map((leave, index) => {
                                    const days = Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                                    
                                    let statusColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                                    if (leave.status === "Approved") statusColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                                    else if (leave.status === "Rejected") statusColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";

                                    return (
                                        <tr key={leave._id} className="bg-slate-900/30 hover:bg-slate-800/50 text-slate-300 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-xs">{index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white">{leave.employeeId.userId.name}</span>
                                                    <span className="text-xs text-slate-500 font-mono mt-0.5">ID: {leave.employeeId.employeeId}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-200">{leave.leaveType}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-semibold">
                                                    {days} {days === 1 ? 'Day' : 'Days'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColor}`}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/admin-dashboard/leaves/${leave._id}`)}
                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-500 hover:text-white hover:border-transparent transition-all text-xs font-bold cursor-pointer opacity-70 group-hover:opacity-100"
                                                >
                                                    <FaEye /> View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-24 text-center bg-slate-900/30">
                            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
                                <FaRegCalendarMinus className="text-slate-500 text-2xl" />
                            </div>
                            <p className="text-white font-bold text-lg">No leave applications found</p>
                            <p className="text-slate-500 text-sm mt-1">
                                {searchTerm ? `No results match your search.` : 'There are currently no active leave requests.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Table
