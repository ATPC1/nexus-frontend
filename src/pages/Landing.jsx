import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import Galaxy from '../components/Galaxy';

const Landing = () => {
  return (
    <div className="h-screen bg-[#0f172a] text-white relative overflow-hidden flex flex-col items-center justify-center">
      {/* 3D Galaxy Background */}
      <div className="absolute inset-0 z-0 opacity-80">
        <Canvas camera={{ position: [0, 0, 8] }}>
          <Suspense fallback={null}>
            <Galaxy />
          </Suspense>
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl px-8 py-12 flex flex-col items-center bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 mb-6 drop-shadow-[0_4px_20px_rgba(255,255,255,0.2)]">
            NexusTalk <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">AI</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl md:text-2xl text-slate-200 mb-12 leading-relaxed max-w-2xl font-light"
        >
          The next generation of real-time collaboration. 
          Communicate with your team in stunning glassmorphic spaces, powered by an intelligent AI assistant.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <Link
            to="/login"
            className="px-10 py-4 bg-black/40 hover:bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] hover:-translate-y-1"
          >
            Sign Up
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
