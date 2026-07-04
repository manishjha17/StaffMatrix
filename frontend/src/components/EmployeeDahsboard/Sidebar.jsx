import React from 'react'
import {NavLink} from 'react-router-dom'
import {FaBuilding, FaTachometerAlt,FaUsers, FaMoneyBill, FaHospitalUser, FaTools, FaBullhorn} from 'react-icons/fa'
import { useAuth } from '../../context/authContext'
import { useTheme } from '../../context/ThemeContext'

const Sidebar=()=>{
    const {user}=useAuth()
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
                <NavLink to="/employee-dashboard"
                  className={({ isActive }) => 
                       `flex items-center space-x-3 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border ${
                         isActive 
                           ? "bg-[#6C63FF]/10 text-[#22D3EE] border-[#6C63FF]/30 border-l-4 border-l-[#6C63FF] pl-3" 
                           : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 border-transparent hover:translate-x-1"
                       }`
                   }
                   end
                >
                    <FaTachometerAlt className="text-base" />
                    <span>Dashboard</span>
                </NavLink>

                {user?.subscriptionPlan === 'pro' && (
                    <NavLink to="/employee-dashboard/announcements"
                        className={({ isActive }) => 
                           `flex items-center space-x-3 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border ${
                             isActive 
                               ? "bg-[#6C63FF]/10 text-[#22D3EE] border-[#6C63FF]/30 border-l-4 border-l-[#6C63FF] pl-3" 
                               : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 border-transparent hover:translate-x-1"
                           }`
                        }
                    >
                        <FaBullhorn className="text-base" />
                        <span>Notice Board</span>
                    </NavLink>
                )}

               <NavLink to={`/employee-dashboard/profile/${user._id}`}
                  className={({ isActive }) => 
                       `flex items-center space-x-3 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border ${
                         isActive 
                           ? "bg-[#6C63FF]/10 text-[#22D3EE] border-[#6C63FF]/30 border-l-4 border-l-[#6C63FF] pl-3" 
                           : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 border-transparent hover:translate-x-1"
                       }`
                   }
                   end
                >
                    <FaUsers className="text-base" />
                    <span>My Profile</span>
                </NavLink>

                <NavLink to={`/employee-dashboard/leaves`}
                    className={({ isActive }) => 
                       `flex items-center space-x-3 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border ${
                         isActive 
                           ? "bg-[#6C63FF]/10 text-[#22D3EE] border-[#6C63FF]/30 border-l-4 border-l-[#6C63FF] pl-3" 
                           : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 border-transparent hover:translate-x-1"
                       }`
                   }
                >
                    <FaHospitalUser className="text-base" />
                    <span>Leaves</span>
                </NavLink>

                <NavLink to={`/employee-dashboard/salary/${user._id}`}
                   className={({ isActive }) => 
                       `flex items-center space-x-3 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border ${
                         isActive 
                           ? "bg-[#6C63FF]/10 text-[#22D3EE] border-[#6C63FF]/30 border-l-4 border-l-[#6C63FF] pl-3" 
                           : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 border-transparent hover:translate-x-1"
                       }`
                   }
                >
                    <FaMoneyBill className="text-base" />
                    <span>Salary</span>
                </NavLink>
               
                <NavLink to="/employee-dashboard/setting"
                    className={({ isActive }) => 
                       `flex items-center space-x-3 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border ${
                         isActive 
                           ? "bg-[#6C63FF]/10 text-[#22D3EE] border-[#6C63FF]/30 border-l-4 border-l-[#6C63FF] pl-3" 
                           : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 border-transparent hover:translate-x-1"
                       }`
                   }
                >
                    <FaTools className="text-base" />
                    <span>Settings</span>
                </NavLink>
            </div>
        </div>
    )
}

export default Sidebar;