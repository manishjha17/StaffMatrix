import React, { useEffect, useState } from 'react'
import { fetchDepartments } from '../../utils/EmployeeHelper'
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../../context/authContext';
import { FaArrowLeft } from 'react-icons/fa';




const Edit = () => {
    const { user: currentUser } = useAuth();
    const [employee, setEmployee] = useState({
        name:'',
        maritalStatus:'',
        designation:'',
        salary:0,
        department:'',
        performanceRating: '',
        performanceNote: ''
    });
    const [departments, setDepartments] = useState(null)
    const navigate = useNavigate()
    const { id } = useParams()

    useEffect(() => {
        const getDepartments = async () => {
            const departments = await fetchDepartments()
            setDepartments(departments);
        }
        getDepartments();

    }, []);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await axios.get(`/api/employee/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                })
                if (response.data.success) {
                    const employee = response.data.employee
                    setEmployee((prev) => ({ 
                        ...prev, 
                        name: employee.userId.name, 
                        maritalStatus: employee.maritalStatus,
                        designation:employee.designation,
                        salary:employee.salary,
                        department:employee.department,
                        performanceRating: employee.performanceRating || '',
                        performanceNote: employee.performanceNote || ''
                    }))
                }
            } catch (error) {
                if (error.response && !error.response.data.success) {
                    alert(error.response.data.error);
                }
            }
        };
        fetchEmployee();

    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "image") {
            setEmployee((prevData) => ({ ...prevData, [name]: files[0] }));
        } else {
            setEmployee((prevData) => ({ ...prevData, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataObj = new FormData();
        Object.keys(employee).forEach((key) => {
            formDataObj.append(key, employee[key]);
        });

        try {
            const response = await axios.put(`/api/employee/${id}`, formDataObj, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
            });
            if (response.data.success) {
                navigate("/admin-dashboard/employees");
            }
        } catch (error) {
            if (error.response && !error.response.data.success) {
                alert(error.response.data.error)
            }
        }

    };



    return (
        <>{departments && employee? (
        <div className='max-w-4xl mx-auto glass-panel p-8 rounded-2xl border-slate-900 shadow-2xl relative overflow-hidden animate-fade-in-up mt-6'>
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500" />
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => navigate('/admin-dashboard/employees')} 
                    className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer"
                >
                    <FaArrowLeft className="text-sm" />
                </button>
                <h2 className='text-2xl font-extrabold text-white'>Edit Employee</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>

                    {/*Name*/}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Name
                        </label>
                        <input type="text" name='name' value={employee.name} onChange={handleChange} placeholder='Insert Name' className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm" required />
                    </div>

                    {/*Marital Status*/}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Marital Status</label>
                        <select name="maritalStatus" onChange={handleChange} value={employee.maritalStatus} className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm [&>option]:bg-slate-950 [&>option]:text-white" required>
                            <option value="">Select Status</option>
                            <option value="single">Single</option>
                            <option value="married">Married</option>
                        </select>
                    </div>

                    {/*Designation*/}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Designation</label>
                        <input type="text" name="designation" onChange={handleChange} value={employee.designation} placeholder="Designation" className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm" required />
                    </div>

                    {/*Salary*/}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Salary</label>
                        <input type="number" name="salary" onChange={handleChange} value={employee.salary} placeholder="Salary" className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm" required />
                    </div>

                    {/*Department*/}
                    <div className="col-span-1 md:col-span-1" >
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Department</label>
                        <select name="department" onChange={handleChange} value={employee.department} className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm [&>option]:bg-slate-950 [&>option]:text-white" required>
                            <option value="">Select Department</option>
                            {departments.map(dep => (
                                <option value={dep._id} key={dep._id}>{dep.dep_name}</option>
                            ))}
                        </select>
                    </div>

                    {/*Image Upload*/}
                    <div className="col-span-1 md:col-span-1">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Update Profile Image</label>
                        <input 
                            type="file"  
                            name="image" 
                            onChange={handleChange} 
                            accept="image/*" 
                            className="w-full px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 file:cursor-pointer"
                        />
                    </div>

                    {/* Performance Section (Pro Only) */}
                    {currentUser?.subscriptionPlan === 'pro' && (
                        <div className="md:col-span-2 space-y-4 pt-6 border-t border-slate-800">
                            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                                <span>Performance Review</span>
                                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded text-[10px] tracking-wider">PRO</span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rating (1-5)</label>
                                    <input
                                        type="number"
                                        name="performanceRating"
                                        min="1"
                                        max="5"
                                        value={employee.performanceRating || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 text-sm transition-all focus:bg-slate-950"
                                        placeholder="e.g. 4"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Performance Note</label>
                                    <textarea
                                        name="performanceNote"
                                        value={employee.performanceNote || ''}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 text-sm transition-all focus:bg-slate-950"
                                        placeholder="Brief note about employee's performance..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
                <button 
                    type="submit" 
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg hover:shadow-indigo-600/20 text-white rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer"
                >
                    Save Changes
                </button>
            </form>
        </div>
        ): <div className="text-slate-400 text-center py-10">Loading employee details...</div>}</>
    )
}

export default Edit;
