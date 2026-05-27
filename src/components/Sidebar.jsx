import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';

const Sidebar = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 h-screen bg-[#1e293b]/80 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between fixed top-0 left-0 z-50"
    >
      <div>
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
            NexusTalk AI
          </h1>
        </div>
        
        <nav className="p-4 space-y-2">
          <NavLink 
            to="/dashboard" 
            end
            className={({ isActive }) => 
              `block px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/dashboard/groups" 
            className={({ isActive }) => 
              `block px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`
            }
          >
            My Groups
          </NavLink>
          <NavLink 
            to="/profile" 
            className={({ isActive }) => 
              `block px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`
            }
          >
            Profile
          </NavLink>
        </nav>
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold overflow-hidden border border-white/10">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20 text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
