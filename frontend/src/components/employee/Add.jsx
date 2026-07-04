import React, { useEffect, useState } from 'react'
import { fetchDepartments } from '../../utils/EmployeeHelper'
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa';




const Add = () => {
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({});
    const navigate = useNavigate()

    useEffect(() => {
        const getDepartments = async () => {
            const departments = await fetchDepartments()
            setDepartments(departments)
        }
        getDepartments();

    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target
        if (name === "image") {
            setFormData((prevData) => ({ ...prevData, [name]: files[0] }))
        } else {
            setFormData((prevData) => ({ ...prevData, [name]: value }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataObj = new FormData()
        Object.keys(formData).forEach((key) => {
            formDataObj.append(key, formData[key])
        })
        // Hardcode role since admins can only add employees
        formDataObj.append('role', 'employee')

        try {
            const response = await axios.post('/api/employee/add', formDataObj, {
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

    }



    return (
        <div className='max-w-4xl mx-auto glass-panel p-8 rounded-2xl border-slate-900 shadow-2xl relative overflow-hidden animate-fade-in-up mt-6'>
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500" />
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => navigate('/admin-dashboard/employees')} 
                    className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer"
                >
                    <FaArrowLeft className="text-sm" />
                </button>
                <h2 className='text-2xl font-extrabold text-white'>Add New Employee</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    {/*Name*/}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Name
                        </label>
                        <input type="text" name='name' onChange={handleChange} placeholder='Insert Name' className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm" required />
                    </div>

                    {/*Email*/}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Email
                        </label>
                        <input type="text" name="email" onChange={handleChange} placeholder="Insert Email" className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm" required />
                    </div>

                    {/*Employee ID*/}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Employee ID</label>
                        <input type="text" name="employeeId" onChange={handleChange} placeholder="Employee ID" className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm" required />
                    </div>

                    {/*Date of birth*/}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">DOB</label>
                        <input type="date" name="dob" onChange={handleChange} placeholder="DOB" className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm" required />
                    </div>

                    {/*Gender*/}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Gender</label>
                        <select name="gender" onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm [&>option]:bg-slate-950 [&>option]:text-white" required>
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/*Marital Status*/}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Marital Status</label>
                        <select name="maritalStatus" onChange={handleChange} placeholder="Marital Status" className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm [&>option]:bg-slate-950 [&>option]:text-white" required>
                            <option value="">Select Status</option>
                            <option value="single">Single</option>
                            <option value="married">Married</option>
                        </select>
                    </div>

                    {/*Designation*/}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Designation</label>
                        <input type="text" name="designation" onChange={handleChange} placeholder="Designation" className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm" required />
                    </div>

                    {/*Department*/}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Department</label>
                        <select name="department" onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm [&>option]:bg-slate-950 [&>option]:text-white" required>
                            <option value="">Select Department</option>
                            {departments.map(dep => (
                                <option value={dep._id} key={dep._id}>{dep.dep_name}</option>
                            ))}
                        </select>
                    </div>

                    {/*Salary*/}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Salary</label>
                        <input type="number" name="salary" onChange={handleChange} placeholder="Salary" className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm" required />
                    </div>

                    {/*Password*/}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
                        <input type="password" name="password" onChange={handleChange} placeholder="******" className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm" required />
                    </div>



                    {/*Image Upload*/}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Upload Image</label>
                        <input
                            type="file"
                            name="image"
                            onChange={handleChange}
                            accept="image/*"
                            className="w-full px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 file:cursor-pointer"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg hover:shadow-indigo-600/20 text-white rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer"
                >
                    Add Employee
                </button>
            </form>
        </div>
    )
}

export default Add;
