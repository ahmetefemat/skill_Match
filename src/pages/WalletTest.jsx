import { useState, useEffect } from "react";
import { auth } from "../services/firebase";
import { addCredit, checkBalance } from "../services/walletService";
import { useAuth } from "../contexts/AuthContext";
import { logoutUser } from "../services/authService"; // 1. BURANIN VARLIĞINDAN EMİN OL

export default function WalletTest() {
  const { userData, loading: authLoading } = useAuth();
  const [amount, setAmount] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const user = auth.currentUser;

  const refreshBalance = async () => {
    if (user) {
      const bakiye = await checkBalance(user.uid);
      setCurrentBalance(bakiye);
    }
  };

  useEffect(() => {
    refreshBalance();
  }, [user]);

  const handleUpdate = async () => {
    try {
      const miktar = prompt("Yüklemek istediğiniz kredi miktarını girin:");
      if (!miktar || isNaN(miktar) || Number(miktar) <= 0) {
        return alert("Lütfen geçerli bir sayı girin.");
      }
      await addCredit(user.uid, Number(miktar));
      alert(`✅ ${miktar} kredi başarıyla yüklendi!`);
      refreshBalance();
    } catch (err) {
      alert("Hata oluştu: " + err.message);
    }
  };

  if (authLoading) return <div className="p-10 text-white">Yükleniyor...</div>;

  return (
    <div className="p-10 bg-gray-900 min-h-screen text-white relative">
      
      {/* --- ÇIKIŞ BUTONU (SAĞ ÜST) --- */}
      <div className="absolute top-5 right-5">
        <button 
          onClick={() => logoutUser()} 
          className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-bold shadow-lg transition-all"
        >
          Güvenli Çıkış Yap
        </button>
      </div>

      <h1 className="text-3xl font-extrabold mb-8 text-blue-500">SkillMatch - Backend Test Sahası</h1>
      
      <div className="bg-gray-800 p-6 rounded-xl mb-6 border border-gray-700 shadow-xl">
        <h2 className="text-xl font-semibold">
          👤 Hoş geldin, <span className="text-green-400">{userData?.kullanici_adi || "Yükleniyor..."}</span>
        </h2>
        <p className="text-gray-400 mt-1">ID: {userData?.riot_id}</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl mb-6 border border-l-4 border-l-green-500 shadow-xl">
        <p className="text-gray-400 text-sm uppercase tracking-wider">Güncel Bakiyen</p>
        <p className="text-4xl font-mono font-bold text-green-400 mt-2">
          {currentBalance} ₺
        </p>
      </div>

      <button 
        onClick={handleUpdate} 
        className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-bold text-lg shadow-lg transform active:scale-95 transition-all"
      >
        Kredi Yükle (+)
      </button>
    </div>
  );
}