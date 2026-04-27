import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { checkBalance } from '../services/walletService';
import { getUserMatchHistory } from '../services/matchService';
import { getUserById, getUsersByIds } from '../services/userService';
import {
  buildMatchStats,
  buildPerformanceTrend,
  mapMatchesForTable,
} from '../services/statsService';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import RecentMatchesTable from '../components/RecentMatchesTable';
import WinLossChart from '../components/WinLossChart';
import PerformanceChart from '../components/PerformanceChart';
import './Dashboard.css';

/**
 * Dashboard Component
 * Main user dashboard with stats, charts, and recent match history
 *
 * Architecture:
 * - All data flows through props to child components
 * - Data is fetched from Firebase services
 * - Handler functions are frontend-only (console.log, alerts, or state changes)
 */

const Dashboard = () => {
  const { user, userData, loading: authLoading } = useAuth();
  const [userStats, setUserStats] = useState(buildMatchStats([], null));
  const [recentMatches, setRecentMatches] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], data: [] });
  const [dataLoading, setDataLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  const dashboardUser = {
    username:
      profileData?.kullanici_adi ||
      profileData?.username ||
      userData?.kullanici_adi ||
      user?.displayName ||
      'Player',
    rank: profileData?.rank || userData?.rank || 'Unranked',
  };

  // State for balance
  const [balance, setBalance] = useState(0);

  // State for user interactions (prepared for future modal/nav features)
  // eslint-disable-next-line no-unused-vars
  const [showAddCreditModal, setShowAddCreditModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selectedMatchDetail, setSelectedMatchDetail] = useState(null);

  const loadDashboardData = useCallback(async () => {
    if (!user) {
      return;
    }

    setDataLoading(true);
    try {
      const [balanceResult, matchResult, userResult] =
        await Promise.allSettled([
          checkBalance(user.uid),
          getUserMatchHistory(user.uid, 10),
          getUserById(user.uid),
        ]);

      const balanceValue =
        balanceResult.status === "fulfilled" ? balanceResult.value : null;
      const matches =
        matchResult.status === "fulfilled" ? matchResult.value : [];
      const freshUserData =
        userResult.status === "fulfilled" ? userResult.value : null;

      const opponentIds = matches
        .map((match) =>
          match.olusturan_id === user.uid
            ? match.katilan_id
            : match.olusturan_id
        )
        .filter(Boolean);
      const opponentMap = await getUsersByIds(opponentIds);

      const profileBalance =
        freshUserData?.balance ??
        freshUserData?.guncel_kredi ??
        freshUserData?.currentBalance ??
        freshUserData?.bakiye;
      const effectiveBalance =
        balanceValue || balanceValue === 0
          ? balanceValue
          : profileBalance || 0;

      setProfileData(freshUserData || null);
      setBalance(effectiveBalance || 0);
      setUserStats(buildMatchStats(matches, user.uid));
      setChartData(buildPerformanceTrend(matches));
      setRecentMatches(mapMatchesForTable(matches, user.uid, opponentMap));
    } catch (error) {
      console.error('Dashboard data load error:', error);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadDashboardData();
    }
  }, [authLoading, loadDashboardData]);

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
      `Match Details:\nGame: ${match.game}\nOpponent: ${match.opponent}\nResult: ${match.result}`
    );
  };

  const handleRefreshStats = () => {
    console.log('Refresh Stats clicked');
    loadDashboardData();
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

  if (authLoading || dataLoading) {
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
              ₺{dataLoading ? '...' : balance.toLocaleString()}
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
              data={chartData.data}
              labels={chartData.labels}
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
