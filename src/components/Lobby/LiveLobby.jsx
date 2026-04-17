import React, { useState } from 'react';

const LiveLobby = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Sahte Veriler (Mock Data)
  const [onlinePlayers] = useState([
    { id: 1, name: 'Ahmet Efe', rank: 'Elmas', status: 'online' },
    { id: 3, name: 'Hayrani Er', rank: 'Şampiyon', status: 'online' },
  ]);

  const [activeRooms] = useState([
    { id: 101, game: 'Valorant', creator: 'Ahmet Efe', amount: '50 ₺', mode: '1v1', status: 'Rakip Bekleniyor' },
  ]);

  // Yeni: Maç Geçmişi Verisi
  const [matchHistory] = useState([
    { id: 1, opponent: 'Mustafa Tür', game: 'Valorant', result: 'Win', amount: '+45 ₺', date: '15.04.2026' },
    { id: 2, opponent: 'Beson', game: 'CS:GO 2', result: 'Loss', amount: '-25 ₺', date: '14.04.2026' },
    { id: 3, opponent: 'KaranlıkKılıç', game: 'EA FC 24', result: 'Win', amount: '+180 ₺', date: '12.04.2026' },
  ]);

  return (
    <div className="bg-gray-900 min-h-screen p-4 md:p-8 text-white font-sans relative">
      <header className="mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-yellow-500">SkillMatch Canlı Lobi</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sol Menü: Aktif Oyuncular */}
        <aside className="bg-gray-800 p-4 rounded-lg shadow-lg lg:col-span-1 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-gray-200 border-b border-gray-700 pb-2">Çevrimiçi</h2>
          <ul className="space-y-3">
            {onlinePlayers.map(p => (
              <li key={p.id} className="flex items-center justify-between bg-gray-700 p-2 rounded text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>{p.name}
                </span>
                <span className="text-gray-400 text-xs">{p.rank}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Orta Alan: Açık Odalar ve Maç Geçmişi */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* AÇIK ODALAR SEKSİYONU */}
          <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
              <h2 className="text-xl font-semibold text-gray-100">Açık Odalar</h2>
              <button onClick={() => setIsFormOpen(true)} className="bg-green-600 hover:bg-green-500 px-4 py-1 rounded text-sm font-bold">
                + Yeni Meydan Okuma
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRooms.map(room => (
                <div key={room.id} className="bg-gray-700 p-4 rounded-lg border border-gray-600 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{room.game}</h3>
                    <p className="text-xs text-gray-400">{room.creator} • {room.mode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold">{room.amount}</p>
                    <button className="mt-2 bg-yellow-600 px-3 py-1 rounded text-xs font-bold">Katıl</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* MAÇ GEÇMİŞİ SEKSİYONU (YENİ) */}
          <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">Son Karşılaşmaların</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="text-xs uppercase bg-gray-900 text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Rakip</th>
                    <th className="px-4 py-3">Oyun</th>
                    <th className="px-4 py-3">Sonuç</th>
                    <th className="px-4 py-3">Kazanç</th>
                    <th className="px-4 py-3 text-right">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {matchHistory.map(match => (
                    <tr key={match.id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-4 font-medium text-white">{match.opponent}</td>
                      <td className="px-4 py-4">{match.game}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${match.result === 'Win' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                          {match.result === 'Win' ? 'ZAFER' : 'BOZGUN'}
                        </span>
                      </td>
                      <td className={`px-4 py-4 font-bold ${match.result === 'Win' ? 'text-green-400' : 'text-red-400'}`}>
                        {match.amount}
                      </td>
                      <td className="px-4 py-4 text-right text-gray-500">{match.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>

      {/* FORM MODAL (Önceki kodla aynı) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md border border-gray-700">
            <h2 className="text-2xl font-bold text-yellow-500 mb-4">Meydan Okuma Oluştur</h2>
            <button onClick={() => setIsFormOpen(false)} className="bg-yellow-600 w-full py-2 rounded font-bold">Kapat</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveLobby;