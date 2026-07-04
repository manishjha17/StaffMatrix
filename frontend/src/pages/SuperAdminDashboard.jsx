import React from 'react'
import { useAuth } from '../context/authContext'
import SuperAdminSidebar from '../components/superadmin/SuperAdminSidebar'
import Navbar from '../components/dashboard/Navbar'
import { Outlet } from 'react-router-dom'

const SuperAdminDashboard = () => {
    const { user } = useAuth()

    return (
        <div className='flex min-h-screen bg-slate-950 text-slate-100 font-sans'>
            <SuperAdminSidebar />
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

export default SuperAdminDashboard;
