import { useState, useEffect, useCallback } from "react";
import { auth } from "../services/firebase";
import { addCredit, checkBalance, deductCredit } from "../services/walletService";
import { useAuth } from "../hooks/useAuth.js";
import { logoutUser } from "../services/authService";
import { createMatch } from "../services/matchService";

export default function WalletTest() {
  const { userData, loading: authLoading } = useAuth();
  const [currentBalance, setCurrentBalance] = useState(0);
  const user = auth.currentUser;

  const refreshBalance = useCallback(async () => {
    if (user) {
      const bakiye = await checkBalance(user.uid);
      setCurrentBalance(bakiye);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshBalance();
  }, [refreshBalance]);

  // YÜKLEME İŞLEMİ
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

  // HARCAMA / BAKİYE DÜŞME İŞLEMİ (YENİ)
  const handleDeduct = async () => {
    try {
      const miktar = prompt("Harcamak (düşmek) istediğiniz miktarı girin:");
      if (!miktar || isNaN(miktar) || Number(miktar) <= 0) {
        return alert("Lütfen geçerli bir sayı girin.");
      }
      
      await deductCredit(user.uid, Number(miktar), "Test Harcaması (Manuel)");
      alert(`✅ ${miktar} ₺ cüzdanınızdan başarıyla düşüldü!`);
      refreshBalance();
    } catch (err) {
      // Yetersiz bakiye uyarısı buraya düşecek
      alert("İşlem Başarısız: " + err.message); 
    }
  };

  // MAÇ AÇMA TEST İŞLEMİ
  const handleCreateMatch = async () => {
    try {
      const miktar = prompt("Kaç TL'lik maç açmak istiyorsun?");
      if (!miktar || isNaN(miktar) || Number(miktar) <= 0) return;

      // Şimdilik test için oyunu 'Valorant' olarak sabit verelim
      await createMatch(user.uid, "Valorant", Number(miktar));
      
      alert(`✅ ${miktar} ₺ değerinde Valorant maçı başarıyla açıldı!`);
      refreshBalance(); // Bakiyenin düştüğünü ekranda görelim
    } catch (err) {
      alert("Maç Açılamadı: " + err.message);
    }
  };

  if (authLoading) return <div className="p-10 text-white">Yükleniyor...</div>;

  return (
    <div className="p-10 bg-gray-900 min-h-screen text-white relative">
      
      {/* ÇIKIŞ BUTONU */}
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

      {/* BUTONLAR */}
      <div className="flex gap-4">
        <button 
          onClick={handleUpdate} 
          className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-bold text-lg shadow-lg transform active:scale-95 transition-all"
        >
          Kredi Yükle (+)
        </button>
        
        {/* HARCAMA BUTONU (YENİ) */}
        <button 
          onClick={handleDeduct} 
          className="bg-red-600 hover:bg-red-500 px-8 py-3 rounded-xl font-bold text-lg shadow-lg transform active:scale-95 transition-all"
        >
          Para Harca (-)
        </button>

        {/* MAÇ AÇMA BUTONU */}
        <button 
          onClick={handleCreateMatch} 
          className="bg-purple-600 hover:bg-purple-500 px-8 py-3 rounded-xl font-bold text-lg shadow-lg transform active:scale-95 transition-all"
        >
          Maç İlanı Aç (🎮)
        </button>
      </div>
      
    </div>
  );
}