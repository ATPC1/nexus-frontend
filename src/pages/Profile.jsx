import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import Galaxy from '../components/Galaxy';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import Sidebar from '../components/Sidebar';

const Profile = () => {
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    dob: '',
    bio: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/me');
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        gender: response.data.gender || '',
        dob: response.data.dob || '',
        bio: response.data.bio || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/me', formData);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile.');
    }
  };

  if (!profile) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Loading...</div>;

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
        
        <div className="max-w-3xl mx-auto relative z-10 pt-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl"
        >
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              User Profile
            </h1>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors border border-blue-500/30"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-lg mb-6 text-sm ${message.includes('successfully') ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/50' : 'bg-red-500/20 text-red-200 border border-red-500/50'}`}>
              {message}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="w-40 h-40 rounded-full bg-slate-700 mb-4 border-4 border-white/10 overflow-hidden flex items-center justify-center">
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl text-slate-400 font-bold">{profile.name.charAt(0)}</span>
                )}
              </div>
              <p className="text-emerald-400 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
              </p>
            </div>

            <div className="w-full md:w-2/3">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 text-white [&>option]:bg-slate-800">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Date of Birth</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Bio</label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"></textarea>
                  </div>
                  <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 rounded-xl font-medium shadow-lg transition-all">Save Changes</button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="text-lg text-white font-medium">{profile.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <p className="text-sm text-slate-400">Gender</p>
                      <p className="text-lg text-white font-medium">{profile.gender || 'Not specified'}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <p className="text-sm text-slate-400">Date of Birth</p>
                      <p className="text-lg text-white font-medium">{profile.dob || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-sm text-slate-400">Bio</p>
                    <p className="text-white">{profile.bio || 'No bio provided yet.'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
