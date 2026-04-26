import React from 'react';

const OnlinePlayers = ({ players = [] }) => (
  <aside className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] h-fit">
    {/* Arkadaki hafif yeşil parlama efekti */}
    <div className="absolute -top-10 -left-10 w-32 h-32 bg-green-500/10 rounded-full blur-2xl pointer-events-none"></div>

    <h2 className="text-xl font-bold tracking-wider text-gray-100 mb-6 border-b border-white/10 pb-4 flex items-center gap-2 relative z-10">
      <span className="w-1 h-6 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
      Çevrimiçi
    </h2>
    
    <div className="relative z-10">
      {players.length === 0 ? (
        <div className="text-gray-400 text-sm italic bg-black/20 p-4 rounded-xl border border-dashed border-white/10 text-center">
          Kimse aktif değil...
        </div>
      ) : (
        <ul className="space-y-3">
          {players.map(p => (
            <li 
              key={p.id} 
              className="flex items-center justify-between bg-black/20 hover:bg-white/5 p-3 rounded-xl border border-transparent hover:border-white/10 transition-all duration-300 group cursor-pointer"
            >
              <span className="flex items-center gap-3">
                {/* Neon Çevrimiçi Noktası */}
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                </span>
                <span className="font-medium text-gray-200 group-hover:text-white transition-colors">
                  {p.name}
                </span>
              </span>
              
              {/* Rütbe Rozeti */}
              <span className="text-[10px] uppercase tracking-wider font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">
                {p.rank}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </aside>
);

export default OnlinePlayers;