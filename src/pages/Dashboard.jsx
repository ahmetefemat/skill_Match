import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../services/firebase';
import { checkBalance } from '../services/walletService';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import RecentMatchesTable from '../components/RecentMatchesTable';
import WinLossChart from '../components/WinLossChart';
import PerformanceChart from '../components/PerformanceChart';
import {
  mockUser,
  mockStats,
  mockChartData,
  mockRecentMatches,
} from '../mockData/dashboardMockData';
import './Dashboard.css';

/**
 * Dashboard Component
 * Main user dashboard with stats, charts, and recent match history
 *
 * Architecture:
 * - All data flows through props to child components
 * - Mock data is structured like backend API responses
 * - TODO: Backend developer can replace mockData with Firebase/API calls
 * - Handler functions are frontend-only (console.log, alerts, or state changes)
 */

// TODO: Create async function to fetch real dashboard data from Firebase
// async function fetchDashboardData(userId) {
//   // TODO: Implement Firebase Firestore queries to fetch:
//   // - User profile from /users/{userId}
//   // - User stats from /userStats/{userId}
//   // - Recent matches from /matches with userId filter
//   // - Wallet balance from /wallets/{userId}
//   console.log('TODO: Fetch dashboard data for user:', userId);
//   // return { user: realUser, stats: realStats, matches: realMatches };
// }

const Dashboard = () => {
  const { loading: authLoading } = useAuth();
  const user = auth.currentUser;

  // TODO: Replace mockUser with real user data from Firebase
  const [dashboardUser] = useState(mockUser);

  // TODO: Replace mockStats with real stats from Firebase
  const [userStats] = useState(mockStats);

  // TODO: Replace mockRecentMatches with real match history from Firebase
  const [recentMatches] = useState(mockRecentMatches);

  // State for balance (currently fetching from Firebase)
  // TODO: Later integrate balance into main fetchDashboardData
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);

  // State for user interactions (prepared for future modal/nav features)
  // eslint-disable-next-line no-unused-vars
  const [showAddCreditModal, setShowAddCreditModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selectedMatchDetail, setSelectedMatchDetail] = useState(null);

  // Fetch current balance from Firebase wallet service
  useEffect(() => {
    const fetchBalance = async () => {
      if (user && !authLoading) {
        setBalanceLoading(true);
        try {
          const bal = await checkBalance(user.uid);
          setBalance(bal);
        } catch (error) {
          console.error('Error fetching balance:', error);
          setBalance(mockUser.balance);
        }
        setBalanceLoading(false);
      }
    };
    fetchBalance();
  }, [user, authLoading]);

  // ============================================
  // HANDLER FUNCTIONS FOR USER INTERACTIONS
  // ============================================

  // TODO: Connect to wallet/payment flow when backend is ready
  const handleAddCredit = () => {
    console.log('Add Credit button clicked');
    alert(
      'Add Credit feature coming soon!\n\nThis will integrate with:\n- Stripe/Payment provider\n- Wallet system\n- Transaction history'
    );
    setShowAddCreditModal(true);
  };

  // TODO: Navigate to user profile page when routing is ready
  const handleViewProfile = () => {
    console.log('View Profile clicked');
    alert('User profile page coming soon!');
    // navigate('/profile');
  };

  // TODO: Open match details modal or navigate to match page
  const handleMatchClick = (match) => {
    console.log('Match clicked:', match);
    setSelectedMatchDetail(match);
    // TODO: Replace alert with modal or navigation
    alert(`Match Details: ${match.opponent} - ${match.result}`);
  };

  // TODO: Open match details page with full statistics
  const handleViewMatchDetails = (match) => {
    console.log('View Details clicked for match:', match);
    setSelectedMatchDetail(match);
    // TODO: Open modal or navigate to /matches/{matchId}
    alert(
      `Match Details:\nGame: ${match.game}\nOpponent: ${match.opponent}\nResult: ${match.result}\nK/D/A: ${match.kills}/${match.deaths}/${match.assists}`
    );
  };

  // TODO: Implement real refresh function with Firebase data
  const handleRefreshStats = () => {
    console.log('Refresh Stats clicked');
    alert('Stats will refresh with latest data from backend!');
    // TODO: Call fetchDashboardData(user.uid)
  };

  // TODO: Navigate to wallet/transaction history page
  const handleOpenWallet = () => {
    console.log('Open Wallet clicked');
    alert('Wallet page coming soon! You will see:\n- Transaction history\n- Deposit/Withdrawal options\n- Pending transactions');
    // navigate('/wallet');
  };

  // ============================================
  // RENDER
  // ============================================

  if (authLoading || balanceLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {/* DASHBOARD HEADER with User Info and Balance */}
      <div className="dashboard-header">
        <div className="header-left">
          <div
            className="user-avatar"
            onClick={handleViewProfile}
            style={{ cursor: 'pointer' }}
            title="Click to view profile"
          >
            {dashboardUser.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <h2 className="user-name">{dashboardUser.username || 'Player'}</h2>
            <p className="user-status">Rank: {dashboardUser.rank}</p>
          </div>
        </div>

        <div className="header-right">
          <div
            className="balance-card"
            onClick={handleOpenWallet}
            style={{ cursor: 'pointer' }}
            title="Click to open wallet"
          >
            <span className="balance-label">Current Balance</span>
            <span className="balance-amount">
              ₺{balanceLoading ? '...' : balance.toLocaleString()}
            </span>
          </div>
          <button
            className="btn-add-credit"
            onClick={handleAddCredit}
            title="Add credits to your account"
          >
            + Add Credit
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW GRID */}
      <div className="stats-grid">
        <StatCard
          title="Total Matches"
          value={userStats.totalMatches}
          icon="🎯"
          trend={`↑ ${userStats.totalMatches - (userStats.totalMatches - 5)} this week`}
          trendUp={true}
          color="cyan"
        />
        <StatCard
          title="Win Rate"
          value={`${userStats.winRate}%`}
          icon="🏆"
          trend="↑ 3% vs last week"
          trendUp={true}
          color="emerald"
        />
        <StatCard
          title="Current Balance"
          value={`₺${balance.toLocaleString()}`}
          icon="💰"
          trend="↑ 12% growth"
          trendUp={true}
          color="purple"
        />
        <StatCard
          title="Avg. Performance"
          value={`${userStats.averagePerformanceRating}/10`}
          icon="⚡"
          trend="↑ Excellent"
          trendUp={true}
          color="pink"
        />
      </div>

      {/* CHARTS SECTION */}
      <div className="charts-section">
        <div className="chart-col chart-col--small">
          <ChartCard title="Match Statistics">
            <WinLossChart
              wins={userStats.wins}
              losses={userStats.losses}
              title="Win/Loss Ratio"
            />
          </ChartCard>
        </div>

        <div className="chart-col chart-col--large">
          <ChartCard title="Performance Trend">
            <PerformanceChart
              data={mockChartData.performanceTrend.data}
              labels={mockChartData.performanceTrend.labels}
              title="Score Progression"
              yAxisLabel="Score"
              lineColor="rgba(0, 245, 212, 1)"
              fillColor="rgba(0, 245, 212, 0.1)"
            />
          </ChartCard>
        </div>
      </div>

      {/* RECENT MATCHES TABLE */}
      <div className="recent-matches-section">
        <div className="recent-matches-header">
          <h3 className="section-title">Recent Matches</h3>
          <button
            className="btn-refresh"
            onClick={handleRefreshStats}
            title="Refresh match history"
          >
            🔄 Refresh
          </button>
        </div>
        <RecentMatchesTable
          matches={recentMatches}
          onMatchClick={handleMatchClick}
          onViewDetails={handleViewMatchDetails}
        />
      </div>
    </div>
  );
};

export default Dashboard;
