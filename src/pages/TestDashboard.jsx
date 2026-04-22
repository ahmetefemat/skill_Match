import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { addCredit, checkBalance, deductCredit } from "../services/walletService";
import { useAuth } from "../hooks/useAuth";
import { logoutUser } from "../services/authService";
import { createMatch } from "../services/matchService";

export default function TestDashboard() {
  const navigate = useNavigate();
  const { userData, loading: authLoading } = useAuth();
  const [currentBalance, setCurrentBalance] = useState(0);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchBalance = async () => {
      if (user) {
        const bakiye = await checkBalance(user.uid);
        setCurrentBalance(bakiye);
      }
    };
    fetchBalance();
  }, [user]);

  const refreshBalance = async () => {
    if (user) {
      const bakiye = await checkBalance(user.uid);
      setCurrentBalance(bakiye);
    }
  };

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

  // HARCAMA / BAKİYE DÜŞME İŞLEMİ
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
      alert("İşlem Başarısız: " + err.message);
    }
  };

  // MAÇ AÇMA TEST İŞLEMİ
  const handleCreateMatch = async () => {
    try {
      const miktar = prompt("Kaç TL'lik maç açmak istiyorsun?");
      if (!miktar || isNaN(miktar) || Number(miktar) <= 0) return;

      await createMatch(user.uid, "Valorant", Number(miktar));

      alert(`✅ ${miktar} ₺ değerinde Valorant maçı başarıyla açıldı!`);
      refreshBalance();
    } catch (err) {
      alert("Maç Açılamadı: " + err.message);
    }
  };

  if (authLoading) return <div className="p-10 text-white">Yükleniyor...</div>;

  return (
    <div className="p-10 bg-gray-900 min-h-screen text-white relative">

      {/* ÜSTTE BUTONLAR */}
      <div className="absolute top-5 right-5 flex gap-3">
        <button
          onClick={() => navigate("/lobby")}
          className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg font-bold shadow-lg transition-all"
        >
          🎮 Lobi'ye Git
        </button>
        <button
          onClick={() => logoutUser()}
          className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-bold shadow-lg transition-all"
        >
          Güvenli Çıkış Yap
        </button>
      </div>

      <h1 className="text-3xl font-extrabold mb-8 text-blue-500">SkillMatch - Test Paneli</h1>

      <div className="bg-gray-800 p-6 rounded-xl mb-6 border border-gray-700 shadow-xl">
        <h2 className="text-xl font-semibold">
          👤 Hoş geldin, <span className="text-green-400">{userData?.kullanici_adi || "Yükleniyor..."}</span>
        </h2>
        <p className="text-gray-400 mt-1">Email: {user?.email}</p>
        <p className="text-gray-400 mt-1">Riot ID: {userData?.riot_id || "Belirtilmemiş"}</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl mb-6 border border-l-4 border-l-green-500 shadow-xl">
        <p className="text-gray-400 text-sm uppercase tracking-wider">Güncel Bakiyen</p>
        <p className="text-4xl font-mono font-bold text-green-400 mt-2">
          {currentBalance} ₺
        </p>
      </div>

      {/* TEST BUTONLARI */}
      <div className="space-y-4">
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={handleUpdate}
            className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-bold text-lg shadow-lg transform active:scale-95 transition-all"
          >
            💳 Kredi Yükle (+)
          </button>

          <button
            onClick={handleDeduct}
            className="bg-red-600 hover:bg-red-500 px-8 py-3 rounded-xl font-bold text-lg shadow-lg transform active:scale-95 transition-all"
          >
            💸 Para Harca (-)
          </button>

          <button
            onClick={handleCreateMatch}
            className="bg-purple-600 hover:bg-purple-500 px-8 py-3 rounded-xl font-bold text-lg shadow-lg transform active:scale-95 transition-all"
          >
            🎮 Maç İlanı Aç
          </button>

          <button
            onClick={refreshBalance}
            className="bg-gray-700 hover:bg-gray-600 px-8 py-3 rounded-xl font-bold text-lg shadow-lg transform active:scale-95 transition-all"
          >
            🔄 Bakiye Güncelle
          </button>
        </div>
      </div>

      {/* BİLGİ KUTUSU */}
      <div className="mt-10 bg-blue-900/30 border border-blue-500 p-6 rounded-xl">
        <h3 className="text-lg font-bold text-blue-400 mb-3">📋 Test Paneli Rehberi</h3>
        <ul className="text-gray-300 space-y-2 text-sm">
          <li>✅ <strong>Kredi Yükle:</strong> Cüzdanınıza test kredisi ekler</li>
          <li>✅ <strong>Para Harca:</strong> Cüzdanınızdan para düşer (bakiye kontrolü yapılır)</li>
          <li>✅ <strong>Maç İlanı Aç:</strong> Yeni bir maç açar ve para bloke eder</li>
          <li>✅ <strong>Bakiye Güncelle:</strong> Güncel bakiyeyi yeniden çeker</li>
          <li>⚠️ Lobi görmek için <strong>"Lobi"</strong> sayfasına git</li>
        </ul>
      </div>
    </div>
  );
}
