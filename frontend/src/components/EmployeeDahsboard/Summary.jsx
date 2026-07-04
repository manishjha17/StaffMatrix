import React, { useState, useEffect } from 'react'
import { FaUser, FaClock, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa'
import { useAuth } from '../../context/authContext'
import axios from 'axios'
import PunchCard from '../attendance/PunchCard'

const Summary = () => {
    const { user } = useAuth()
    return (
        <div className='space-y-6'>
            {/* Header profile welcome */}
            <div className="glass-panel flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl border-white/5 bg-slate-900/15 gap-4">
                <div className="flex items-center">
                    <div className="text-2xl w-14 h-14 rounded-2xl flex justify-center items-center bg-[#6C63FF]/15 text-[#6C63FF] mr-5 border border-[#6C63FF]/25">
                        <FaUser/>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Dashboard Portal</p>
                        <p className="text-2xl font-extrabold text-white mt-1">Welcome Back, {user.name}</p>
                    </div>
                </div>

                <div className="text-left sm:text-right space-y-1">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center sm:justify-end space-x-1.5">
                        <FaCalendarAlt className="text-[10px] text-[#22D3EE]" />
                        <span>Today's Date</span>
                    </p>
                    <p className="text-sm font-semibold text-white">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Attendance punch card panel */}
            <PunchCard />

        </div>
    )
}

export default Summary;
