import React from 'react';

const StatCard = ({ title, value, icon, trend, trendUp, color = 'cyan' }) => {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {icon && <span className="stat-icon">{icon}</span>}
      </div>
      
      <div className="stat-value">{value}</div>
      
      {trend && (
        <div className={`stat-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
          <span className="trend-arrow">{trendUp ? '↑' : '↓'}</span>
          <span className="trend-text">{trend}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
