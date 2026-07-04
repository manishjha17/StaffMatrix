import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddDepartment = () => {
    const [department,setDepartment]=useState({
        dep_name:'',
        description:''
    })
    const navigate=useNavigate()


    const handleChange=(e)=>{
        const {name,value}=e.target;
        setDepartment({...department,[name]:value})
    }

    const handleSubmit=async (e)=>{
        e.preventDefault()
        try{
            const response =await axios.post('/api/department/add', department,{
                headers:{
                    "Authorization":   `Bearer ${localStorage.getItem('token')}`
                }
            })
            if(response.data.success){
                navigate("/admin-dashboard/departments")
            }
        }catch(error){
            if(error.response && !error.response.data.success){
                alert(error.response.data.error)
            }
        }
    }

    return (
        <div className='max-w-xl mx-auto glass-panel p-8 rounded-2xl border-slate-900 shadow-2xl relative overflow-hidden animate-fade-in-up mt-6'>
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500" />
            <div className="flex items-center gap-4 mb-6">
                <button type="button" onClick={() => navigate("/admin-dashboard/departments")} className="w-8 h-8 shrink-0 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer">
                    <FaArrowLeft className="text-xs" />
                </button>
                <h2 className='text-2xl font-extrabold text-white'>Add New Department</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="dep_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Department Name</label>
                    <input 
                        type="text"   
                        name='dep_name' 
                        onChange={handleChange} 
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm" 
                        placeholder='e.g. Engineering' 
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Description</label>
                    <textarea 
                        name="description"   
                        onChange={handleChange} 
                        placeholder='Describe the department responsibilities...' 
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm" 
                        rows='5'
                    ></textarea>
                </div>
                <button 
                    type='submit' 
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg hover:shadow-indigo-600/20 text-white rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer"
                >
                    Add Department
                </button>
            </form>
        </div>
    );
};

export default AddDepartment;