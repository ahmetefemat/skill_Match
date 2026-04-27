import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * WinLossChart Component
 * Displays a doughnut chart showing win/loss ratio
 *
 * Props:
 *   wins: Number - Total wins
 *   losses: Number - Total losses
 *   title: String (optional) - Chart title override
 */
const WinLossChart = ({ wins = 0, losses = 0, title = 'Win/Loss Ratio' }) => {
  // Calculate win rate percentage
  const total = wins + losses || 1; // Avoid division by zero
  const winRatePercent = Math.round((wins / total) * 100);

  // Chart data
  const chartData = {
    labels: ['Wins', 'Losses'],
    datasets: [
      {
        data: [wins, losses],
        backgroundColor: [
          'rgba(74, 222, 128, 0.8)', // Neon green for wins
          'rgba(255, 99, 132, 0.8)', // Red/pink for losses
        ],
        borderColor: [
          'rgba(74, 222, 128, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 2,
        borderRadius: 4,
        hoverOffset: 8,
      },
    ],
  };

  // Chart options with dark mode styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#dee3e4',
          font: {
            family: "'Inter', sans-serif",
            size: 13,
            weight: '600',
          },
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(14, 20, 21, 0.9)',
        titleColor: '#00f5d4',
        bodyColor: '#dee3e4',
        borderColor: 'rgba(0, 245, 212, 0.3)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        font: {
          family: "'Inter', sans-serif",
          size: 12,
          weight: '600',
        },
        titleFont: {
          size: 13,
          weight: '700',
        },
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = Math.round((value / (wins + losses || 1)) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="win-loss-chart-container">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <div className="win-rate-badge">
          <span className="win-rate-label">Win Rate</span>
          <span className="win-rate-value">{winRatePercent}%</span>
        </div>
      </div>
      
      <div className="chart-canvas-wrapper">
        <Doughnut data={chartData} options={chartOptions} />
      </div>
      
      <div className="chart-stats">
        <div className="stat-item stat-item--win">
          <span className="stat-label">Wins</span>
          <span className="stat-number">{wins}</span>
        </div>
        <div className="stat-item stat-item--loss">
          <span className="stat-label">Losses</span>
          <span className="stat-number">{losses}</span>
        </div>
      </div>

    </div>
  );
};

export default WinLossChart;
