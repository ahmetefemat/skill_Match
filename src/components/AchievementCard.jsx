import React from 'react';

/**
 * AchievementCard Component
 * Displays a single achievement badge
 *
 * Props:
 *   achievement: Object - Achievement data
 */
const AchievementCard = ({ achievement }) => {
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return '#83948f';
      case 'rare':
        return '#00f5d4';
      case 'epic':
        return '#a855f7';
      case 'legendary':
        return '#fbbf24';
      default:
        return '#83948f';
    }
  };

  return (
    <div 
      className={`achievement-card achievement-${achievement.rarity}`}
      style={{ borderColor: getRarityColor(achievement.rarity) }}
      title={achievement.description}
    >
      <div className="achievement-icon">{achievement.icon}</div>
      <div className="achievement-content">
        <h4 className="achievement-name">{achievement.name}</h4>
        <p className="achievement-description">{achievement.description}</p>
        <span className="achievement-rarity">{achievement.rarity}</span>
      </div>

      {/* TODO: Connect to real achievements from Firebase */}
    </div>
  );
};

export default AchievementCard;
