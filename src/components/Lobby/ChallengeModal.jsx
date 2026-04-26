import React, { useState } from 'react';

const ChallengeModal = ({ isOpen, onClose }) => {
  const [selectedGame, setSelectedGame] = useState('LoL');
  const [targetScore, setTargetScore] = useState('');
  const [betAmount, setBetAmount] = useState(100);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Yeni İddia Verileri:", { game: selectedGame, score: targetScore, amount: betAmount });
    onClose();
    setTargetScore('');
    setBetAmount(100);
  };

  if (!isOpen) return null;

  const games = [
    { id: 'LoL', name: 'LoL', color: 'text-blue-400' },
    { id: 'Valorant', name: 'Valorant', color: 'text-red-500' },
    { id: 'CSGO', name: 'CS:GO', color: 'text-yellow-500' }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      
      {/* Cam Efektli Ana Kutu - Fotoğraftaki gibi yeşil ince çerçeveli */}
      <div className="relative bg-[#111827]/80 border border-green-500/30 p-8 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(34,197,94,0.15)] overflow-hidden backdrop-blur-xl">
        
        {/* Arkadaki hafif yeşil ışıltı */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <h2 className="text-2xl font-bold text-white mb-6 relative z-10">
          Yeni İddia Oluştur
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          
          {/* 1. OYUN TÜRÜ SEÇİMİ (Fotoğraftaki gibi yan yana butonlar) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Oyun Türü</label>
            <div className="flex gap-4">
              {games.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => setSelectedGame(game.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border transition-all duration-300 ${
                    selectedGame === game.id 
                      ? 'bg-green-500/10 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] text-white' 
                      : 'bg-black/30 border-gray-600 text-gray-400 hover:border-gray-400'
                  }`}
                >
                  {/* Fotoğraftaki radyo butonu hissi için küçük nokta */}
                  <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${selectedGame === game.id ? 'border-green-500' : 'border-gray-500'}`}>
                    {selectedGame === game.id && <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
                  </div>
                  <span className={`font-bold ${game.color}`}>{game.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. HEDEF SKOR (Fotoğraftaki gibi koyu input) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Hedef Skor</label>
            <input 
              type="text" 
              placeholder="Kill sayısını giriniz..."
              value={targetScore}
              onChange={(e) => setTargetScore(e.target.value)}
              className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
            />
          </div>

          {/* 3. ORTAYA KONACAK KREDİ (Fotoğraftaki Slider) */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-300">Ortaya Konacak Kredi</label>
              <span className="text-green-400 font-bold">{betAmount} Kredi</span>
            </div>
            
            {/* Slider / Range Input */}
            <input 
              type="range" 
              min="10" 
              max="500" 
              step="10"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>10</span>
              <span>500</span>
            </div>

            {/* Bakiye Kontrolü Uyarı Metni */}
            <p className="text-xs text-gray-400 mt-4 bg-white/5 p-3 rounded border border-white/5">
              <span className="font-bold text-white">Bakiye Kontrolü:</span> 500 kredi altı daha çok konuşulur.
            </p>
          </div>

          {/* 4. BUTONLAR (Fotoğraftaki gibi Yeşil ve Kırmızı) */}
          <div className="flex gap-4 pt-4 border-t border-gray-700/50">
            <button 
              type="submit" 
              className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white py-3 rounded-lg font-bold transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            >
              İddiayı Yayınla
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 bg-[#ef4444] hover:bg-[#dc2626] text-white py-3 rounded-lg font-bold transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            >
              İptal Et
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ChallengeModal;