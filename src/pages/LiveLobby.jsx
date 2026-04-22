import React, { useState, useEffect } from 'react';
import { listenToActiveMatches, joinMatch } from '../services/matchService'; 
import { useAuth } from '../hooks/useAuth'; 

export default function LiveLobby() {
  // Hem 'user' (ID için) hem 'userData' (Arayüz bilgileri için) alıyoruz
  const { user, userData } = useAuth();
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const unsubscribe = listenToActiveMatches((gelenMaclar) => {
      setMatches(gelenMaclar);
    });
    return () => unsubscribe();
  }, []);

  const handleJoin = async (matchId, miktar, olusturanId) => {
    // --- GÜVENLİK KONTROLÜ (UI) ---
    if (user?.uid === olusturanId) {
      alert("Kendi ilanınıza katılamazsınız!");
      return;
    }

    const onay = window.confirm(`${miktar} ₺ karşılığında bu maça katılmak istiyor musun?`);
    if (!onay) return;

    try {
      // userData.uid yerine Firebase Auth'tan gelen garanti user.uid kullanıyoruz
      await joinMatch(matchId, user.uid, miktar);
      alert("✅ Maça başarıyla katıldın! Rakipler eşleşti.");
    } catch (error) {
      console.error("Katılma Hatası:", error);
      alert("Katılma Başarısız: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-500">🎮 SkillMatch Canlı Lobi</h1>
          <div className="text-right">
             <p className="text-gray-400">Aktif Oyuncu: <span className="text-green-400">{userData?.kullanici_adi || "Yükleniyor..."}</span></p>
             <p className="text-xs text-gray-500 font-mono">{user?.uid}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
          <table className="w-full text-left">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="px-6 py-4">Oyun Türü</th>
                <th className="px-6 py-4">Giriş Ücreti</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              
              {matches.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">
                    Şu an aktif bir maç ilanı bulunmuyor.
                  </td>
                </tr>
              ) : (
                matches.map((match) => (
                  <tr key={match.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-400">{match.oyun_turu}</td>
                    <td className="px-6 py-4 text-green-400 font-mono font-bold">{match.giris_ucreti} ₺</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold uppercase tracking-wider">
                        {match.durum}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* KARŞILAŞTIRMA: Mevcut user ID'si ile ilanı açan ID aynı mı? */}
                      {user && match.olusturan_id === user.uid ? (
                        <span className="text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded-md italic">
                          Senin İlanın
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleJoin(match.id, match.giris_ucreti, match.olusturan_id)}
                          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded font-bold shadow-lg transition-all active:scale-95"
                        >
                          Katıl
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}