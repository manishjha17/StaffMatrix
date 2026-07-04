import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaIdBadge, FaBirthdayCake, FaVenusMars, FaBuilding, FaHeart, FaStar, FaStickyNote, FaEnvelope } from 'react-icons/fa';
import Avatar from '../common/Avatar';

const View = () => {
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await axios.get(`/api/employee/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (response.data.success) {
                    setEmployee(response.data.employee);
                }
            } catch (error) {
                if (error.response && !error.response.data.success) {
                    alert(error.response.data.error);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchEmployee();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold tracking-wide">Loading Profile...</p>
            </div>
        );
    }

    if (!employee) {
        return <div className="text-rose-400 text-center py-10">Employee not found.</div>;
    }

    return (
        <div className="w-full h-full animate-fade-in-up">
            
            {/* Main Profile Card */}
            <div className="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
                {/* Background Banner */}
                <div className="h-16 w-full bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                    <button 
                        onClick={() => navigate('/admin-dashboard/employees')} 
                        className="absolute top-3 left-6 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 border border-white/40 text-white flex items-center justify-center transition-all cursor-pointer z-20"
                    >
                        <FaArrowLeft className="text-xs" />
                    </button>
                </div>

                <div className="px-6 pb-4 relative bg-slate-900">
                    {/* Floating Profile Image */}
                    <div className="flex flex-col md:flex-row items-center gap-4 -mt-10 relative z-10 mb-4">
                        <div className="relative">
                            <Avatar 
                                profileImage={employee.userId.profileImage} 
                                name={employee.userId.name}
                                className="w-32 h-32 md:w-48 md:h-48 rounded-2xl object-cover border-4 border-slate-900 shadow-2xl relative z-10" 
                            />
                            <div className="absolute bottom-2 right-1 w-4 h-4 bg-green-500 border-[3px] border-slate-900 rounded-full"></div>
                        </div>
                        <div className="text-center md:text-left mt-2 md:mt-8">
                            <h2 className="text-2xl font-extrabold text-white tracking-tight">{employee.userId.name}</h2>
                            <p className="text-indigo-400 font-bold text-sm mt-0.5">{employee.designation}</p>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        
                        {/* Info Block 1 */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0">
                                    <FaIdBadge className="text-lg" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-400">Employee ID</p>
                                    <p className="text-base font-bold text-white leading-tight">{employee.employeeId}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0">
                                    <FaBuilding className="text-lg" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-400">Department</p>
                                    <p className="text-base font-bold text-white leading-tight">{employee.department.dep_name}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0">
                                    <FaBirthdayCake className="text-lg" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-400">Date of Birth</p>
                                    <p className="text-base font-bold text-white leading-tight">{new Date(employee.dob).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Info Block 2 */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0">
                                    <FaVenusMars className="text-lg" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-400">Gender</p>
                                    <p className="text-base font-bold text-white capitalize leading-tight">{employee.gender}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0">
                                    <FaHeart className="text-lg" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-400">Marital Status</p>
                                    <p className="text-base font-bold text-white capitalize leading-tight">{employee.maritalStatus}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0">
                                    <FaEnvelope className="text-lg" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-400">Email Address</p>
                                    <p className="text-base font-bold text-white truncate max-w-[180px] sm:max-w-xs leading-tight">{employee.userId.email}</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Performance Review Section */}
                    {employee.performanceRating && (
                        <div className="mt-6 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 relative overflow-hidden">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                                <span className="p-1.5 bg-amber-500 rounded-lg text-black"><FaStar className="text-xs"/></span> 
                                Performance Review
                            </h4>
                            
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 min-w-[120px]">
                                    <p className="text-[11px] font-semibold text-slate-400 mb-1">Rating</p>
                                    <div className="flex text-amber-400 text-lg">
                                        {[...Array(5)].map((star, i) => (
                                            <FaStar key={i} className={i < employee.performanceRating ? 'text-amber-400' : 'text-slate-600'} />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1 bg-slate-900 p-3 rounded-xl border border-slate-700">
                                    <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                                        <FaStickyNote /> Manager Notes
                                    </p>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        {employee.performanceNote || 'No additional notes provided.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default View;
