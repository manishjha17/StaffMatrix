import React from "react";
import Sidebar from "../components/EmployeeDahsboard/sidebar";
import {Outlet } from 'react-router-dom'
import Navbar from '../components/dashboard/Navbar'

const  EmployeeDashboard=()=>{
    return (
        <div className='flex min-h-screen bg-slate-950 text-slate-100 font-sans'>
            <Sidebar />
            <div className='flex-1 ml-55 flex flex-col min-h-screen relative overflow-hidden'>
                {/* Background glow effects in dashboard */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none" />
                <Navbar/>
                <div className="flex-1 p-6 z-10 animate-fade-in-up">
                    <Outlet/>
                </div>
            </div>
        </div>
    )
}

export default EmployeeDashboard;