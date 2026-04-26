import React from 'react';

const MatchHistory = ({ history = [] }) => (
  <section className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
    <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">Son Karşılaşmaların</h2>
    
    {history.length === 0 ? (
      <div className="text-gray-500 text-center py-4 italic border border-dashed border-gray-700 rounded">
        Henüz bir maç geçmişin bulunmuyor.
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs uppercase bg-gray-900 text-gray-500">
            <tr>
              <th className="px-4 py-3">Rakip</th>
              <th className="px-4 py-3">Oyun</th>
              <th className="px-4 py-3">Sonuç</th>
              <th className="px-4 py-3">Kazanç</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {history.map(match => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

export default MatchHistory;