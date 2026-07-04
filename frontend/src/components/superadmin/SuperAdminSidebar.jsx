import React from 'react'
import {NavLink} from 'react-router-dom'
import {FaBuilding, FaTachometerAlt, FaPlusCircle, FaTools, FaHeadset, FaEnvelope} from 'react-icons/fa'
import { useTheme } from '../../context/ThemeContext'

const SuperAdminSidebar=()=>{
    const { theme } = useTheme();
    return(
        <div className="bg-slate-950 border-r border-slate-900 text-slate-300 h-screen fixed left-0 top-0 bottom-0 flex flex-col w-55 z-40">
            {/* Logotype Header */}
            <div className="h-16 border-b border-slate-900 flex items-center px-5 space-x-2.5">
                <div className="w-8 h-8 flex items-center justify-center">
                    <img src={theme === 'dark' ? '/logo1.png' : '/logo2.png'} alt="StaffMatrix Logo" className="w-full h-full object-contain drop-shadow-md" />
                </div>
                <span className="text-base font-bold tracking-tight text-white">Staff<span className="text-[#6C63FF] font-extrabold text-xs ml-0.5">Matrix</span></span>
            </div>
            
            <div className="px-3 py-4 flex-1 space-y-1.5 overflow-y-auto">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-2">Super Admin</div>
                <NavLink to="/superadmin-dashboard"
                  className={({ isActive }) => 
                       `flex items-center space-x-3 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border ${
                         isActive 
                           ? "bg-[#6C63FF]/10 text-[#22D3EE] border-[#6C63FF]/30 border-l-4 border-l-[#6C63FF] pl-3" 
                           : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 border-transparent hover:translate-x-1"
                       }`
                   }
                   end
                >
                    <FaBuilding className="text-base" />
                    <span>Companies</span>
                </NavLink>

                <NavLink to="/superadmin-dashboard/add-company"
                    className={({ isActive }) => 
                       `flex items-center space-x-3 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border ${
                         isActive 
                           ? "bg-[#6C63FF]/10 text-[#22D3EE] border-[#6C63FF]/30 border-l-4 border-l-[#6C63FF] pl-3" 
                           : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 border-transparent hover:translate-x-1"
                       }`
                   }
                >
                    <FaPlusCircle className="text-base" />
                    <span>Add Company</span>
                </NavLink>

                <NavLink to="/superadmin-dashboard/support"
                    className={({ isActive }) => 
                       `flex items-center space-x-3 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border ${
                         isActive 
                           ? "bg-[#6C63FF]/10 text-[#22D3EE] border-[#6C63FF]/30 border-l-4 border-l-[#6C63FF] pl-3" 
                           : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 border-transparent hover:translate-x-1"
                       }`
                   }
                >
                    <FaHeadset className="text-base" />
                    <span>Support Tickets</span>
                </NavLink>

                <NavLink to="/superadmin-dashboard/landing-inquiries"
                    className={({ isActive }) => 
                       `flex items-center space-x-3 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border ${
                         isActive 
                           ? "bg-[#6C63FF]/10 text-[#22D3EE] border-[#6C63FF]/30 border-l-4 border-l-[#6C63FF] pl-3" 
                           : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 border-transparent hover:translate-x-1"
                       }`
                   }
                >
                    <FaEnvelope className="text-base" />
                    <span>Landing Inquiries</span>
                </NavLink>

            </div>
        </div>
    )
}

export default SuperAdminSidebar;
