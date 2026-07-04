import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Avatar from '../common/Avatar';
import { FaArrowLeft } from 'react-icons/fa';

const Detail = () => {
    const { id } = useParams()
    const [leave, setLeave] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchLeave = async () => {
            try {
                const response = await axios.get(`/api/leave/detail/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                })
                if (response.data.success) {
                    setLeave(response.data.leave)
                }
            } catch (error) {
                if (error.response && !error.response.data.success) {
                    alert(error.response.data.error);
                }
            }
        };
        fetchLeave();
    }, []);

    const changeStatus = async (id, status) => {
        try {
            const response = await axios.put(`/api/leave/${id}`, { status }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })
            if (response.data.success) {
                navigate('/admin-dashboard/leaves')
            }
        } catch (error) {
            if (error.response && !error.response.data.success) {
                alert(error.response.data.error);
            }
        }
    }

    return (
        <>
            {leave ? (
                <div className="max-w-3xl mx-auto glass-panel p-8 rounded-2xl border-slate-900 shadow-2xl relative overflow-hidden animate-fade-in-up mt-6">
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500" />
                    <div className="flex items-center mb-8 relative">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="absolute left-0 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white flex items-center justify-center transition-all cursor-pointer z-20 shadow-md"
                            title="Go Back"
                        >
                            <FaArrowLeft className="text-xs" />
                        </button>
                        <h2 className="text-2xl font-extrabold text-white text-center w-full">
                            Leave Request Details
                        </h2>
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                        {/* Profile Image */}
                        <div className="flex-shrink-0 relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-300" />
                            <Avatar
                                profileImage={leave.employeeId.userId.profileImage}
                                name={leave.employeeId.userId.name}
                                className="relative w-44 h-44 rounded-full object-cover border border-slate-800"
                            />
                        </div>

                        {/* Details in key-value structure */}
                        <div className="flex-1 w-full space-y-4 text-sm">
                            <div className="flex border-b border-slate-900 pb-3">
                                <span className="font-semibold w-40 text-slate-400 uppercase tracking-wider text-xs">Name</span>
                                <span className="text-white font-medium">{leave.employeeId.userId.name}</span>
                            </div>

                            <div className="flex border-b border-slate-900 pb-3">
                                <span className="font-semibold w-40 text-slate-400 uppercase tracking-wider text-xs">Employee ID</span>
                                <span className="text-white font-medium">{leave.employeeId.employeeId}</span>
                            </div>

                            <div className="flex border-b border-slate-900 pb-3">
                                <span className="font-semibold w-40 text-slate-400 uppercase tracking-wider text-xs">Leave Type</span>
                                <span className="text-indigo-400 font-semibold">{leave.leaveType}</span>
                            </div>

                            <div className="flex border-b border-slate-900 pb-3">
                                <span className="font-semibold w-40 text-slate-400 uppercase tracking-wider text-xs">Reason</span>
                                <span className="text-white font-medium">{leave.reason}</span>
                            </div>

                            <div className="flex border-b border-slate-900 pb-3">
                                <span className="font-semibold w-40 text-slate-400 uppercase tracking-wider text-xs">Department</span>
                                <span className="text-white font-medium">{leave.employeeId.department.dep_name}</span>
                            </div>

                            <div className="flex border-b border-slate-900 pb-3">
                                <span className="font-semibold w-40 text-slate-400 uppercase tracking-wider text-xs">Start Date</span>
                                <span className="text-white font-medium">{new Date(leave.startDate).toLocaleDateString()}</span>
                            </div>

                            <div className="flex border-b border-slate-900 pb-3">
                                <span className="font-semibold w-40 text-slate-400 uppercase tracking-wider text-xs">End Date</span>
                                <span className="text-white font-medium">{new Date(leave.endDate).toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center pb-1">
                                <span className="font-semibold w-40 text-slate-400 uppercase tracking-wider text-xs">
                                    {leave.status.toLowerCase() === "pending" ? "Action" : "Status"}
                                </span>
                                {leave.status.toLowerCase() === "pending" ? (
                                    <div className="flex space-x-2.5">
                                        <button
                                            className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-600 hover:text-white hover:border-transparent transition-all text-xs font-bold cursor-pointer"
                                            onClick={() => changeStatus(leave._id, "Approved")}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            className="px-4 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-600 hover:text-white hover:border-transparent transition-all text-xs font-bold cursor-pointer"
                                            onClick={() => changeStatus(leave._id, "Rejected")}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                ) : (
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${leave.status === "Approved"
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                        }`}>
                                        {leave.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-slate-400 text-center py-10">Loading leave details...</div>
            )}
        </>
    );
};

export default Detail;
