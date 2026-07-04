import React, { useEffect ,useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { FaArrowLeft } from 'react-icons/fa';

const EditDepartment = () => {
    const {id}=useParams()
    const [department,setDepartment]=useState([])
    const[depLoading,setDepLoading]=useState(false)
    const navigate=useNavigate()

        useEffect(()=>{
        const fetchDepartments=async()=>{
            setDepLoading(true)
            try{
                const response=await axios.get(`/api/department/${id}`,{
                    headers:{
                        Authorization:`Bearer ${localStorage.getItem('token')}`,
                    },   
                })
                if(response.data.success){
                    setDepartment(response.data.department)
                }
            }catch(error){
                if(error.response && !error.response.data.success){
                    alert(error.response.data.error);
                }
            }finally{
                setDepLoading(false)
            }
        };
        fetchDepartments();
    },[]);

    const handleChange=(e)=>{
        const {name,value}=e.target;
        setDepartment({...department,[name]:value})
    }

    const handleSubmit=async (e)=>{
         e.preventDefault()
        try{
            const response =await axios.put(`/api/department/${id}`, department,{
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
        <>{depLoading? <div className="text-slate-400 text-center py-10">Loading department details...</div> :
        <div className='max-w-xl mx-auto glass-panel p-8 rounded-2xl border-slate-900 shadow-2xl relative overflow-hidden animate-fade-in-up mt-6'>
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500" />
            <div className="flex items-center gap-4 mb-6">
                <button type="button" onClick={() => navigate("/admin-dashboard/departments")} className="w-8 h-8 shrink-0 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer">
                    <FaArrowLeft className="text-xs" />
                </button>
                <h2 className='text-2xl font-extrabold text-white'>Edit Department</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="dep_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Department Name</label>
                    <input 
                        type="text"   
                        name='dep_name' 
                        onChange={handleChange} 
                        value={department.dep_name} 
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm" 
                        placeholder='Department Name' 
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Description</label>
                    <textarea 
                        name="description"   
                        onChange={handleChange} 
                        value={department.description} 
                        placeholder='Description' 
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm" 
                        rows='5'
                    ></textarea>
                </div>
                <button 
                    type='submit' 
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg hover:shadow-indigo-600/20 text-white rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer"
                >
                    Save Changes
                </button>
            </form>
        </div>
        }</>
    );
}

export default EditDepartment
