import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Groups from './pages/Groups';
import CreateGroup from './pages/CreateGroup';
import JoinGroup from './pages/JoinGroup';
import Chat from './pages/Chat';
import useAuthStore from './store/useAuthStore';

import Landing from './pages/Landing';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/groups" 
          element={
            <ProtectedRoute>
              <Groups />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/create" 
          element={
            <ProtectedRoute>
              <CreateGroup />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/join" 
          element={
            <ProtectedRoute>
              <JoinGroup />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat/:groupId" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
