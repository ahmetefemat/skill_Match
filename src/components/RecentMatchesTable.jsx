import React from 'react';

/**
 * RecentMatchesTable Component
 * Displays recent match history with interactive row actions
 * 
 * Props:
 *   matches: Array of match objects with id, game, opponent, result, creditAmount, date, status
 *   onMatchClick: Callback function when a match row is clicked
 *   onViewDetails: Callback function for "View Details" action
 */
const RecentMatchesTable = ({ matches = [], onMatchClick, onViewDetails }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'won':
        return 'status-badge status-badge--won';
      case 'lost':
        return 'status-badge status-badge--lost';
      case 'pending':
        return 'status-badge status-badge--pending';
      case 'completed':
        return 'status-badge status-badge--completed';
      default:
        return 'status-badge status-badge--pending';
    }
  };

  const handleRowClick = (match) => {
    // TODO: Connect to match details page / modal when backend is ready
    if (onMatchClick) {
      onMatchClick(match);
    } else {
      console.log('Match clicked:', match);
    }
  };

  const handleViewDetails = (e, match) => {
    e.stopPropagation();
    // TODO: Open match details modal or navigate to match page
    if (onViewDetails) {
      onViewDetails(match);
    } else {
      console.log('View details for match:', match);
    }
  };

  return (
    <div className="recent-matches-container">
      <div className="matches-table-wrapper">
        <table className="matches-table">
          <thead>
            <tr>
              <th>Game</th>
              <th>Opponent</th>
              <th>Result</th>
              <th>Credit</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {matches && matches.length > 0 ? (
              matches.map((match) => (
                <tr 
                  key={match.id || `${match.game}-${match.date}`}
                  className="match-row"
                  onClick={() => handleRowClick(match)}
                >
                  <td className="game-cell">
                    <span className="game-badge">{match.game}</span>
                  </td>
                  <td className="opponent-cell">{match.opponent}</td>
                  <td className="result-cell">
                    <span className={`result-text ${match.result === 'won' ? 'won' : 'lost'}`}>
                      {match.result === 'won' ? '✓ Won' : '✗ Lost'}
                    </span>
                  </td>
                  <td className="credit-cell">
                    <span className={`credit-amount ${match.creditChange >= 0 ? 'positive' : 'negative'}`}>
                      {match.creditChange >= 0 ? '+' : ''}{match.creditChange}
                    </span>
                  </td>
                  <td className="date-cell">{match.date}</td>
                  <td className="status-cell">
                    <span className={getStatusBadgeClass(match.status)}>
                      {match.status}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button
                      className="btn-view-details"
                      onClick={(e) => handleViewDetails(e, match)}
                      title="View match details"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-state">
                  No matches yet. Start playing to see your history!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentMatchesTable;
