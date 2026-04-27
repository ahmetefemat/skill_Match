import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * PerformanceChart Component
 * Displays a line chart showing performance trend over recent matches
 *
 * Props:
 *   data: Array - Array of performance values (e.g., kills, scores)
 *   labels: Array - Labels for x-axis (e.g., match names, dates)
 *   title: String (optional) - Chart title override
 *   yAxisLabel: String (optional) - Y-axis label (e.g., "Kills", "Score")
 *   lineColor: String (optional) - Line color (hex or rgba)
 *   fillColor: String (optional) - Fill color under line
 */
const PerformanceChart = ({
  data = [],
  labels = [],
  title = 'Performance Trend',
  yAxisLabel = 'Score',
  lineColor = 'rgba(0, 245, 212, 1)',
  fillColor = 'rgba(0, 245, 212, 0.1)',
}) => {
  // Fallback data if none provided
  const displayData = data.length > 0 ? data : [0];
  const displayLabels =
    labels.length > 0
      ? labels
      : Array.from({ length: displayData.length }, (_, i) => `Match ${i + 1}`);

  // Calculate stats
  const maxValue = Math.max(...displayData, 1);
  const minValue = Math.min(...displayData, 0);
  const avgValue = Math.round(
    displayData.reduce((a, b) => a + b, 0) / displayData.length
  );
  const latestValue = displayData[displayData.length - 1];
  const previousValue = displayData[displayData.length - 2] || latestValue;
  const trendUp = latestValue >= previousValue;

  // Chart data
  const chartData = {
    labels: displayLabels,
    datasets: [
      {
        label: yAxisLabel,
        data: displayData,
        borderColor: lineColor,
        backgroundColor: fillColor,
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        borderJoinStyle: 'round',
        borderCapStyle: 'round',
        pointRadius: 6,
        pointBackgroundColor: lineColor,
        pointBorderColor: 'rgba(14, 20, 21, 0.8)',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: lineColor,
        pointHoverBorderWidth: 3,
      },
    ],
  };

  // Chart options with dark mode styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
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
        backgroundColor: 'rgba(14, 20, 21, 0.95)',
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
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
      filler: {
        propagate: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: yAxisLabel,
          color: '#83948f',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '600',
          },
        },
        ticks: {
          color: '#83948f',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '500',
          },
          stepSize: undefined, // Auto-calculate
          padding: 8,
        },
        grid: {
          color: 'rgba(131, 148, 143, 0.1)',
          drawBorder: false,
          lineWidth: 1,
        },
      },
      x: {
        ticks: {
          color: '#83948f',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '500',
          },
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          display: false,
          drawBorder: false,
        },
      },
    },
  };

  return (
    <div className="performance-chart-container">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <div className="performance-stats">
          <div className="stat-box stat-box--latest">
            <span className="stat-label">Latest</span>
            <span className="stat-value">{latestValue}</span>
          </div>
          <div className="stat-box stat-box--avg">
            <span className="stat-label">Avg</span>
            <span className="stat-value">{avgValue}</span>
          </div>
          <div className={`stat-box stat-box--trend ${trendUp ? 'up' : 'down'}`}>
            <span className="stat-label">Trend</span>
            <span className="stat-value">{trendUp ? '↑' : '↓'}</span>
          </div>
        </div>
      </div>

      <div className="chart-canvas-wrapper">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="chart-footer">
        <div className="footer-stat">
          <span className="footer-label">Highest:</span>
          <span className="footer-value">{maxValue}</span>
        </div>
        <div className="footer-stat">
          <span className="footer-label">Lowest:</span>
          <span className="footer-value">{minValue}</span>
        </div>
        <div className="footer-stat">
          <span className="footer-label">Total Matches:</span>
          <span className="footer-value">{displayData.length}</span>
        </div>
      </div>

    </div>
  );
};

export default PerformanceChart;
