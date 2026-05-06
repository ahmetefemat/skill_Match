import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider.jsx";
import { useAuth } from "./hooks/useAuth.js";
import Login from "./pages/Login.jsx";
import Lobby from './pages/Lobby.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Landing from './pages/Landing.jsx';
import Match from './pages/Match.jsx';
import TestDashboard from './pages/TestDashboard.jsx';

// --- GÜVENLİK DUVARI ---
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-bold">
      SkillMatch Yükleniyor...
    </div>
  );

  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-bold">
      SkillMatch Hazırlanıyor...
    </div>
  );

  return (
    <Router>
      <Routes>
        {/* Root: Landing sayfası sitenin ana giriş kapısı */}
        <Route path="/" element={<div className="page-wrapper"><Landing /></div>} />
        <Route path="/landing" element={<div className="page-wrapper"><Landing /></div>} />

        {/* Login: Kullanıcı giriş yapmışsa artık Lobiye değil, Ana Sayfaya (Landing) gitsin */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <div className="page-wrapper"><Login /></div>}
        />

        {/* Hayrani'nin Lobisi - Korumalı */}
        <Route 
          path="/lobby" 
          element={
            <PrivateRoute>
              <div className="page-wrapper"><Lobby /></div>
            </PrivateRoute>
          } 
        />

        {/* Dashboard - Korumalı */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <div className="page-wrapper"><Dashboard /></div>
            </PrivateRoute>
          } 
        />

        {/* Profile - Korumalı */}
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <div className="page-wrapper"><Profile /></div>
            </PrivateRoute>
          } 
        />

        {/* Match detail - Korumalı */}
        <Route
          path="/match/:matchId"
          element={
            <PrivateRoute>
              <div className="page-wrapper"><Match /></div>
            </PrivateRoute>
          }
        />

        {/* Test Dashboard - Korumalı */}
        <Route 
          path="/test-dashboard" 
          element={
            <PrivateRoute>
              <div className="page-wrapper"><TestDashboard /></div>
            </PrivateRoute>
          } 
        />

        {/* Tanımsız yolları her zaman ana sayfaya (Landing) döndür */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}