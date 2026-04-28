import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { addCredit, checkBalance, deductCredit } from "../services/walletService";
import { useAuth } from "../hooks/useAuth";
import { logoutUser } from "../services/authService";
import { createMatch, getUserMatchHistory, updateMatchStatus, completeMatch, cancelMatch, joinMatch } from "../services/matchService";
import { seedAllUsers, seedUserProfile } from "../services/seedService";

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

  const handleSeedProfile = async () => {
    try {
      if (!user) {
        alert("Kullanici bulunamadi. Lutfen tekrar giris yapin.");
        return;
      }
      const confirmSeed = window.confirm(
        "Profil verileri (rank/level/stats/achievements) olusturulsun mu?"
      );
      if (!confirmSeed) {
        return;
      }

      await seedUserProfile(user.uid);
      alert(`✅ Profil alanlari olusturuldu! (UID: ${user.uid})`);
    } catch (err) {
      alert("Seed basarisiz: " + err.message);
    }
  };

  const handleSeedAllUsers = async () => {
    try {
      if (!user) {
        alert("Kullanici bulunamadi. Lutfen tekrar giris yapin.");
        return;
      }
      const confirmSeed = window.confirm(
        "Tum kullanicilara varsayilan profil alanlari eklensin mi?"
      );
      if (!confirmSeed) {
        return;
      }

      const result = await seedAllUsers();
      alert(
        `✅ Toplu seed tamamlandi! Guncellenen: ${result.updatedCount}, Atlanan: ${result.skippedCount}, Toplam: ${result.total}`
      );
    } catch (err) {
      alert("Toplu seed basarisiz: " + err.message);
    }
  };

  // MAÇ DURUM MAKİNESİ TEST PANELİ
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const loadMatches = async () => {
    if (!user) return;
    try {
      setLoadingMatches(true);
      const items = await getUserMatchHistory(user.uid, 20);
      setMatches(items || []);
    } catch (err) {
      alert("Maçları yüklerken hata: " + err.message);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleSetStatus = async (matchId, newStatus) => {
    try {
      await updateMatchStatus(matchId, newStatus);
      alert(`✅ Durum güncellendi: ${newStatus}`);
      loadMatches();
    } catch (err) {
      alert("Durum güncelleme hatası: " + err.message);
    }
  };

  const handleComplete = async (m) => {
    try {
      const winner = prompt(
        `Kazanan kullanıcı ID'si girin (öneri: ${m.olusturan_id} veya ${m.katilan_id}):`
      );
      if (!winner) return;
      await completeMatch(m.id, winner, m.olusturan_id, m.katilan_id, m.giris_ucreti);
      alert("✅ Maç tamamlandı ve ödül dağıtıldı.");
      loadMatches();
    } catch (err) {
      alert("Maç tamamlama hatası: " + err.message);
    }
  };

  const handleCancel = async (matchId) => {
    try {
      const ok = window.confirm("Bu maçı iptal etmek istediğinizden emin misiniz?");
      if (!ok) return;
      await cancelMatch(matchId);
      alert("✅ Maç iptal edildi ve iadeler işlendi.");
      loadMatches();
    } catch (err) {
      alert("Maç iptal hatası: " + err.message);
    }
  };

  const handleJoin = async (matchId) => {
    try {
      const asUid = prompt("Hangi kullanıcı UID ile katılmak istiyorsunuz? (mevcut kullanıcı için boş bırakın)");
      const joinUid = asUid && asUid.trim() ? asUid.trim() : user.uid;
      await joinMatch(matchId, joinUid);
      alert("✅ Başarıyla maça katıldı.");
      loadMatches();
      refreshBalance();
    } catch (err) {
      alert("Maça katılma hatası: " + err.message);
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
            onClick={handleSeedProfile}
            className="bg-amber-600 hover:bg-amber-500 px-8 py-3 rounded-xl font-bold text-lg shadow-lg transform active:scale-95 transition-all"
          >
            🧪 Profil Seed
          </button>

          <button
            onClick={handleSeedAllUsers}
            className="bg-amber-800 hover:bg-amber-700 px-8 py-3 rounded-xl font-bold text-lg shadow-lg transform active:scale-95 transition-all"
          >
            🧪 Toplu Seed
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

      {/* MAÇ DURUM MAKİNESİ TEST PANELİ */}
      <div className="mt-8 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">🧭 Maç Durum Makinesi Testleri</h3>
          <div className="flex gap-2">
            <button
              onClick={loadMatches}
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-md font-semibold"
            >
              {loadingMatches ? "Yükleniyor..." : "Maçlarımı Yükle"}
            </button>
            <button
              onClick={() => setMatches([])}
              className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-md font-semibold"
            >
              Temizle
            </button>
          </div>
        </div>

        {matches.length === 0 ? (
          <p className="text-gray-400">Henüz maç yok veya liste boş. "Maçlarımı Yükle" butonuna tıklayın.</p>
        ) : (
          <div className="space-y-4">
            {matches.map((m) => (
              <div key={m.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">ID: <span className="text-yellow-300">{m.id}</span></p>
                    <p className="text-sm text-gray-300">Oyun: {m.oyun_turu} • Ücret: {m.giris_ucreti} ₺</p>
                    <p className="text-sm text-gray-300">Durum: <span className="text-green-300">{m.durum}</span></p>
                    <p className="text-sm text-gray-400">Oluşturan: {m.olusturan_id} • Katılan: {m.katilan_id || "-"}</p>
                  </div>
                  <div className="flex gap-2">
                    {m.durum === "beklemede" && (
                      <>
                        <button onClick={() => handleJoin(m.id)} className="bg-emerald-600 px-3 py-1 rounded-md">Katıl</button>
                        <button onClick={() => handleSetStatus(m.id, "oynanıyor")} className="bg-blue-600 px-3 py-1 rounded-md">Başlat (oynanıyor)</button>
                        <button onClick={() => handleCancel(m.id)} className="bg-red-600 px-3 py-1 rounded-md">İptal Et</button>
                      </>
                    )}

                    {m.durum === "oynanıyor" && (
                      <>
                        <button onClick={() => handleComplete(m)} className="bg-amber-600 px-3 py-1 rounded-md">Tamamla</button>
                        <button onClick={() => handleCancel(m.id)} className="bg-red-600 px-3 py-1 rounded-md">İptal Et (iade)</button>
                      </>
                    )}

                    {m.durum === "tamamlandı" && (
                      <span className="text-sm text-gray-400 px-3 py-1">Tamamlandı</span>
                    )}

                    {m.durum === "iptal" && (
                      <span className="text-sm text-gray-400 px-3 py-1">İptal Edildi</span>
                    )}
                  </div>
                </div>

                <details className="mt-3 text-xs text-gray-400">
                  <summary className="cursor-pointer">Ham veri</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(m, null, 2)}</pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
