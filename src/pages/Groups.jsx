import React, { useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import Galaxy from '../components/Galaxy';
import useGroupStore from '../store/useGroupStore';
import Sidebar from '../components/Sidebar';

const Groups = () => {
  const { groups, fetchGroups, loading } = useGroupStore();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8 relative overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <Canvas camera={{ position: [0, 0, 8] }}>
            <Suspense fallback={null}>
              <Galaxy />
            </Suspense>
          </Canvas>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10 space-y-8">
          <header className="flex justify-between items-end pb-6 border-b border-white/10">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Groups</h1>
              <p className="text-slate-400">Spaces you have joined or created.</p>
            </div>
            <div className="flex gap-4">
              <Link to="/dashboard/join" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                Join Group
              </Link>
              <Link to="/dashboard/create" className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 rounded-xl shadow-lg transition-all font-medium">
                Create Group
              </Link>
            </div>
          </header>

          {loading ? (
            <div className="text-center py-20 text-slate-400 animate-pulse">Loading groups...</div>
          ) : groups.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-12 backdrop-blur-md text-center"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">No Groups Yet</h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">You haven't joined any groups. Create your own space to invite friends, or join an existing one using an invite code.</p>
              <div className="flex justify-center gap-4">
                <Link to="/dashboard/join" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors">Join with Code</Link>
                <Link to="/dashboard/create" className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition-colors">Create New Group</Link>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {groups.map((group, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={group.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:bg-white/10 transition-colors group relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors"></div>
                  <h3 className="text-xl font-semibold mb-2 relative z-10">{group.groupName}</h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2 relative z-10">{group.description || 'No description provided.'}</p>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5 relative z-10">
                    <div className="text-xs text-slate-500 font-mono">CODE: <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">{group.groupCode}</span></div>
                    <Link to={`/chat/${group.id}`} className="text-sm text-blue-400 hover:text-blue-300 font-medium">Enter Chat →</Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;
