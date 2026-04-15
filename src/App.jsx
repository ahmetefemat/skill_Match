import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx"; 
import Login from "./pages/Login.jsx";
import WalletTest from "./pages/WalletTest.jsx";

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

  // AppContent içinde de loading beklemesi ekleyerek beyaz ekranı engelliyoruz
  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      SkillMatch Hazırlanıyor...
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/wallet-test" /> : <Login />} 
        />
        
        <Route 
          path="/wallet-test" 
          element={
            <PrivateRoute>
              <WalletTest />
            </PrivateRoute>
          } 
        />

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