import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import Galaxy from '../components/Galaxy';

const Dashboard = () => {
  const { user } = useAuthStore();

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

        {/* Background Orbs */}
        <div className="absolute top-[-10%] right-[10%] w-[30rem] h-[30rem] bg-emerald-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob z-0"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[25rem] h-[25rem] bg-blue-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob animation-delay-2000 z-0"></div>

        <div className="max-w-6xl mx-auto relative z-10 space-y-8">
          <header className="flex justify-between items-end pb-6 border-b border-white/10">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}</h1>
              <p className="text-slate-400">Here's what's happening in your groups today.</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
              >
                <div className="text-center py-12 text-slate-400">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <span className="text-2xl">👋</span>
                  </div>
                  <p>You haven't joined any groups yet.</p>
                  <p className="text-sm mt-2">Create a new group or join an existing one to start collaborating.</p>
                </div>
              </motion.div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">AI Assistant</h2>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
                
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/40">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-300">Meet TOM</h3>
                    <p className="text-xs text-blue-200/60">Your AI Copilot</p>
                  </div>
                </div>
                
                <p className="text-sm text-slate-300 relative z-10">
                  TOM is integrated into all your group chats. Just type <code className="bg-black/30 px-1.5 py-0.5 rounded text-emerald-400">@TOM</code> to ask questions, summarize meetings, or get coding help in real-time.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
