import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx"; 
import Login from "./pages/Login.jsx";
import WalletTest from "./pages/WalletTest.jsx";
import LiveLobby from './pages/LiveLobby.jsx'; // Hayrani'nin bileşeni

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
        
        {/* Cüzdan Test Sayfası */}
        <Route 
          path="/wallet-test" 
          element={
            <PrivateRoute>
              <WalletTest />
            </PrivateRoute>
          } 
        />

        {/* Hayrani'nin Lobisi - Artık Korumalı! */}
        <Route 
          path="/lobby" 
          element={
            <PrivateRoute>
              <LiveLobby />
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