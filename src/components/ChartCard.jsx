import React from 'react';

const ChartCard = ({ title, children, subtitle }) => {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title-section">
          <h3 className="chart-title">{title}</h3>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
      </div>
      
      <div className="chart-content">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
