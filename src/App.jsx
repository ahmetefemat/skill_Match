import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider.jsx";
import { useAuth } from "./hooks/useAuth.js";
import Login from "./pages/Login.jsx";
import Lobby from './pages/Lobby.jsx'; // SADECE BURASI DEĞİŞTİ: Yeni tasarım dosyamızı çağırdık

// --- GÜVENLİK DUVARI ---
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-bold">
      SkillMatch Yükleniyor...
    </div>
  );

  return user ? children : <Navigate to="/" />;
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
        {/* Giriş yapılmışsa direkt lobiye veya cüzdana at */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/lobby" /> : <Login />} 
        />
        

        {/* Hayrani'nin Lobisi - Artık Korumalı! */}
        <Route 
          path="/lobby" 
          element={
            <PrivateRoute>
              <Lobby /> {/* SADECE BURASI DEĞİŞTİ: Artık yeni tasarımı basıyor */}
            </PrivateRoute>
          } 
        />

        {/* Yanlış yolları ana sayfaya yönlendir */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

// ANA UYGULAMA (Tüm sistemi sarmalayan kısım)
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}