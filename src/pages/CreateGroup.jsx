import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import Galaxy from '../components/Galaxy';
import useGroupStore from '../store/useGroupStore';
import Sidebar from '../components/Sidebar';

const CreateGroup = () => {
  const [formData, setFormData] = useState({ groupName: '', description: '' });
  const { createGroup, loading, error, clearError } = useGroupStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const success = await createGroup(formData);
    if (success) {
      navigate('/dashboard/groups');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8 relative overflow-hidden flex items-center justify-center">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <Canvas camera={{ position: [0, 0, 8] }}>
            <Suspense fallback={null}>
              <Galaxy />
            </Suspense>
          </Canvas>
        </div>
        
        <div className="w-full max-w-md relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">
                Create Group
              </h1>
              <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">✕</Link>
            </div>

            {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Group Name</label>
                <input type="text" required value={formData.groupName} onChange={(e) => setFormData({...formData, groupName: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 text-white outline-none transition-all" placeholder="E.g. Development Team" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 text-white outline-none transition-all" placeholder="What is this group about?" rows="3"></textarea>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg transition-all">
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
