import React, { useState, useEffect } from 'react';
import OnlinePlayers from '../components/Lobby/OnlinePlayers';
import MatchHistory from '../components/Lobby/MatchHistory';
import ChallengeModal from '../components/Lobby/ChallengeModal';

const LiveLobby = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('odalar');

  /* AHMET İÇİN NOT: Kanka Firebase'den odaları çektiğinde setActiveRooms içine şu yapıda atmalısın ki tasarım bozulmasın:
    { 
      id: doc.id, 
      game: 'Valorant', // (veya 'LoL', 'CS:GO')
      creator: 'Kullanıcı Adı', 
      bet: 100, 
      target: 'En az 20 Kill', 
      avatar: 'Profil_Foto_URL', // Yoksa UI Avatars API kullanabilirsin
      isHighStakes: bet >= 200 // Bahis yüksekse true yap, kart altın rengi parlar 
    }
  */
  const [activeRooms] = useState([]); 
  const [onlinePlayers] = useState([]);
  const [matchHistory] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // AHMET İÇİN NOT: Firebase fetch/onSnapshot kodlarını buraya yaz.
    // Şimdilik sadece sistemi test etmek için 1 saniyelik sahte yüklenme süresi var.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-[#0b1120] min-h-screen text-white font-sans selection:bg-green-500 selection:text-black pb-10">
      
      {/* ÜST BAR (Header) */}
      <header className="bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.5)]">
              <span className="font-black text-white text-xl">S</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
              SkillMatch <span className="text-green-500 text-sm font-bold uppercase tracking-widest ml-2 bg-green-500/10 px-2 py-1 rounded">Lobi</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs text-gray-300 font-medium">Sunucu Aktif</span>
          </div>
        </div>

        {/* SEKME MENÜSÜ */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-6 overflow-x-auto no-scrollbar">
          {['odalar', 'oyuncular', 'gecmis'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-bold tracking-wider transition-all duration-300 whitespace-nowrap border-b-2 uppercase ${
                activeTab === tab 
                  ? 'border-green-500 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]' 
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              }`}
            >
              {tab === 'odalar' ? 'Açık Odalar' : tab === 'oyuncular' ? 'Aktif Oyuncular' : 'Maç Geçmişi'}
            </button>
          ))}
        </div>
      </header>

      {/* ANA İÇERİK ALANI */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        
        {/* 1. SAYFA: AÇIK ODALAR */}
        {activeTab === 'odalar' && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <p className="text-gray-400 text-sm">Mevcut meydan okumalara katıl veya yenisini oluştur.</p>
              <button 
                onClick={() => setIsFormOpen(true)} 
                className="mt-4 sm:mt-0 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black px-6 py-2.5 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-300 transform hover:scale-105"
              >
                + Yeni Meydan Okuma
              </button>
            </div>

            <section className="relative min-h-[400px]">
              {isLoading ? (
                // Yükleniyor Durumu UI
                <div className="flex flex-col items-center justify-center h-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
                  <div className="relative w-16 h-16 flex items-center justify-center mb-4">
                    <div className="absolute inset-0 border-4 border-green-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-green-500/80 font-bold tracking-widest animate-pulse uppercase text-sm">Sunucu Taranıyor...</p>
                </div>
              ) : activeRooms.length === 0 ? (
                // Odalar Boş (Empty State) UI - Çok daha elit yapıldı
                <div className="flex flex-col items-center justify-center h-64 bg-[#0f172a]/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-700 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mb-4 shadow-inner relative z-10">
                    <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-300 mb-1 relative z-10">Radar Temiz</h3>
                  <p className="text-gray-500 text-sm relative z-10">Şu an aktif bir maç odası bulunamadı.</p>
                  <button onClick={() => setIsFormOpen(true)} className="mt-4 text-green-500 font-bold text-sm hover:text-green-400 transition-colors relative z-10 underline underline-offset-4">
                    İlk odayı sen kur
                  </button>
                </div>
              ) : (
                // ODA KARTLARI (Gerçek veri geldiğinde burası çalışacak)
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {activeRooms.map((room) => (
                    <div 
                      key={room.id} 
                      className={`relative overflow-hidden bg-[#111827]/80 backdrop-blur-xl p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
                        room.isHighStakes 
                          ? 'border border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.15)]' 
                          : 'border border-white/10 shadow-lg hover:border-green-500/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]'
                      }`}
                    >
                      {room.isHighStakes && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
                      )}

                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                            room.game === 'Valorant' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            room.game === 'LoL' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {room.game}
                          </span>
                          {room.isHighStakes && <span className="text-xs font-bold text-yellow-500 flex items-center gap-1">🔥 Yüksek Bahis</span>}
                        </div>
                        <span className="text-gray-400 text-xs text-right max-w-[120px] truncate">{room.target}</span>
                      </div>

                      <div className="flex items-center justify-between mb-8 px-2 relative z-10">
                        <div className="flex flex-col items-center gap-2">
                          {room.avatar ? (
                             <img src={room.avatar} alt={room.creator} className="w-14 h-14 rounded-full border-2 border-gray-600 shadow-md object-cover" />
                          ) : (
                             <div className="w-14 h-14 rounded-full border-2 border-gray-600 bg-gray-800 flex items-center justify-center text-lg font-bold">{room.creator.charAt(0)}</div>
                          )}
                          <span className="text-sm font-bold text-gray-200">{room.creator}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center">
                          <span className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-gray-300 to-gray-600 drop-shadow-lg">VS</span>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                          <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-600 bg-gray-800/50 flex items-center justify-center shadow-inner">
                            <span className="text-xl text-gray-500 font-bold">?</span>
                          </div>
                          <span className="text-sm font-medium text-gray-500 italic">Bekleniyor</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Ortadaki Kredi</span>
                          <span className={`text-xl font-black ${room.isHighStakes ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`}>
                            {room.bet} ₺
                          </span>
                        </div>
                        
                        <button className="bg-transparent border border-green-500 text-green-400 hover:bg-green-500 hover:text-black px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-[0_0_10px_rgba(34,197,94,0.2)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]">
                          Eşleşmeyi Kabul Et
                        </button>
                      </div>
                      
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* 2. SAYFA: AKTİF OYUNCULAR (Şimdilik bileşen çağrılı) */}
        {activeTab === 'oyuncular' && (
          <div className="animate-fade-in max-w-xl mx-auto">
            <p className="text-gray-400 text-sm mb-6 text-center">Şu an sunucuda çevrimiçi olan oyuncular.</p>
            <OnlinePlayers players={onlinePlayers} />
          </div>
        )}

        {/* 3. SAYFA: MAÇ GEÇMİŞİ (Şimdilik bileşen çağrılı) */}
        {activeTab === 'gecmis' && (
          <div className="animate-fade-in">
            <p className="text-gray-400 text-sm mb-6">Önceki karşılaşmaların ve bakiye hareketlerin.</p>
            <MatchHistory history={matchHistory} />
          </div>
        )}

      </main>

      <ChallengeModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
};

export default LiveLobby;