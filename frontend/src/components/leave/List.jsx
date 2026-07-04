import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/authContext';
import { FaArrowLeft, FaCalendarTimes, FaSearch } from 'react-icons/fa';

const List = () => {
    const [leaves, setLeaves] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()

    const employeeId = id || user._id;

    const fetchLeaves = async () => {
        try {
            const response = await axios.get(`/api/leave/${employeeId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            if (response.data.success) {
                setLeaves(response.data.leaves);
            }
        } catch (error) {
            if (error.response && !error.response.data.success) {
                alert(error.message);
            }
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    if (!leaves) {
        return (
            <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold tracking-wide">Loading Leaves...</p>
            </div>
        );
    }

    const filteredLeaves = leaves.filter(leave => 
        leave.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) || 
        leave.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in-up mt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    {/* Only show back button for Admin looking at specific employee */}
                    {user.role === 'admin' && (
                        <button 
                            onClick={() => navigate('/admin-dashboard/employees')} 
                            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer"
                        >
                            <FaArrowLeft className="text-sm" />
                        </button>
                    )}
                    <div>
                        <h3 className="text-2xl font-extrabold text-white tracking-tight">Leave History</h3>
                        <p className="text-slate-400 text-sm mt-1">Review active leave periods and history logs</p>
                    </div>
                </div>
                
                {user.role === "employee" && (
                    <Link
                        to="/employee-dashboard/add-leave"
                        className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm flex items-center gap-2 cursor-pointer"
                    >
                        Add New Leave
                    </Link>
                )}
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-5 border-slate-900 shadow-xl">
                <div className="relative max-w-md">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by leave type or status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                    />
                </div>
                
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                    {filteredLeaves.length > 0 ? (
                        <table className="w-full text-sm text-left text-slate-300 border-collapse">
                            <thead className="text-xs uppercase bg-slate-900 border-b border-slate-800 text-slate-400">
                                <tr>
                                    <th className="px-6 py-4 text-center font-bold">S.No</th>
                                    <th className="px-6 py-4 text-center font-bold">Leave Type</th>
                                    <th className="px-6 py-4 text-center font-bold">From</th>
                                    <th className="px-6 py-4 text-center font-bold">To</th>
                                    <th className="px-6 py-4 text-center font-bold">Description</th>
                                    <th className="px-6 py-4 text-center font-bold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeaves.map((leave, index) => {
                                    let statusColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                                    if (leave.status === "Approved") statusColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                                    else if (leave.status === "Rejected") statusColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";

                                    return (
                                        <tr key={leave._id} className="border-b border-slate-800/50 bg-slate-900/30 hover:bg-slate-800/40 text-slate-300 transition-colors">
                                            <td className="px-6 py-4 text-center font-mono text-xs">{index + 1}</td>
                                            <td className="px-6 py-4 text-center font-bold text-white">{leave.leaveType}</td>
                                            <td className="px-6 py-4 text-center">{new Date(leave.startDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-center">{new Date(leave.endDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-center max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase ${statusColor}`}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-20 text-center">
                            <FaCalendarTimes className="text-slate-700 text-5xl mx-auto mb-4" />
                            <p className="text-slate-400 font-semibold text-lg">No leaves found</p>
                            <p className="text-slate-600 text-sm mt-1">
                                {searchTerm ? `No results match "${searchTerm}"` : 'This employee has not taken any leaves.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default List;
