import React from 'react';
import { useAuth } from '../../context/authContext';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import Avatar from '../common/Avatar';

const Navbar=()=>{
    const {user,logout}=useAuth()
    const {theme,toggleTheme}=useTheme()
    return(
        <div className='flex items-center justify-between h-16 glass-panel border-x-0 border-t-0 bg-slate-950/40 px-6 sticky top-0 z-50 backdrop-blur-md'>
            <div className="flex items-center space-x-2">
                <span className="text-slate-400 text-sm">Portal:</span>
                <span className="text-slate-100 font-bold text-sm bg-slate-900/60 border border-slate-800/80 px-3 py-1 rounded-xl flex items-center space-x-2">
                    <Avatar profileImage={user?.profileImage} name={user?.name} className="w-6 h-6 rounded-full object-cover border border-slate-700" />
                    <span>Welcome, {user.name}</span>
                </span>
            </div>
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/50 hover:border-indigo-500/35 text-indigo-400 hover:text-indigo-300 hover:scale-[1.05] transition-all cursor-pointer flex items-center justify-center shadow-sm"
                    aria-label="Toggle Theme"
                >
                    {theme === 'dark' ? <FaSun className="text-sm" /> : <FaMoon className="text-sm" />}
                </button>
                <button 
                    className='text-rose-400 px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-600 hover:text-white hover:border-transparent transition-all text-xs font-semibold shadow-sm cursor-pointer' 
                    onClick={logout}
                >
                    Logout
                </button>
            </div>
        </div>
    )
}

export default Navbar;