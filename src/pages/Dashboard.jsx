import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { checkBalance } from "../services/walletService";
import { getUserMatchHistory } from "../services/matchService";
import { getUserById, getUsersByIds } from "../services/userService";
import {
  buildMatchStats,
  buildPerformanceTrend,
  mapMatchesForTable,
} from "../services/statsService";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import RecentMatchesTable from "../components/RecentMatchesTable";
import WinLossChart from "../components/WinLossChart";
import PerformanceChart from "../components/PerformanceChart";
import Footer from "../components/Footer.jsx";
import AppNavbar from "../components/AppNavbar.jsx";
import "./Landing.css";
import "./Dashboard.css";

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

  const hasMatchData = recentMatches?.length > 0;
  const hasTrendData = chartData?.labels?.length > 0 && chartData?.data?.length > 0;

  const creditKpis = useMemo(() => {
    const kpis = {
      totalEarned: 0,
      totalSpent: 0,
      netChange: 0,
    };

    if (!recentMatches || recentMatches.length === 0) return kpis;

    recentMatches.forEach((match) => {
      const raw = Number(match?.creditChange);
      if (Number.isNaN(raw) || raw === 0) return;
      if (raw > 0) kpis.totalEarned += raw;
      if (raw < 0) kpis.totalSpent += Math.abs(raw);
      kpis.netChange += raw;
    });

    return kpis;
  }, [recentMatches]);

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
        <div className="loading-spinner">SkillMatch Dashboard yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper dashboard-page">
      {/* Background */}
      <div className="dashboard-bg" aria-hidden="true">
        <div className="dashboard-orb dashboard-orb--a" />
        <div className="dashboard-orb dashboard-orb--b" />
        <div className="dashboard-orb dashboard-orb--c" />
      </div>

      <AppNavbar
        balance={balance}
        username={dashboardUser.username}
        avatarUrl={profileData?.avatarUrl || user?.photoURL}
      />

      <main className="dashboard-main">
        <div className="landing-container">
          {/* Hero header (glass) */}
          <section className="dashboard-heroCard">
            <div className="dashboard-heroLeft">
              <button
                type="button"
                className="user-avatar"
                onClick={handleViewProfile}
                title="View profile"
              >
                {dashboardUser.username?.[0]?.toUpperCase() || "U"}
              </button>

              <div className="user-info">
                <div className="dashboard-kicker">PERFORMANCE CENTER</div>
                <h2 className="user-name">{dashboardUser.username || "Player"}</h2>
                <p className="user-status">Rank: {dashboardUser.rank}</p>
              </div>
            </div>

            <div className="dashboard-heroRight">
              <button
                type="button"
                className="balance-card"
                onClick={handleOpenWallet}
                title="Open wallet"
              >
                <span className="balance-label">Wallet Balance</span>
                <span className="balance-amount">₺{balance.toLocaleString()}</span>
              </button>

              <button
                className="landing-btn landing-btn--primary"
                onClick={handleAddCredit}
                type="button"
              >
                Kredi Yükle <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>

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

        <StatCard
          title="Current Streak"
          value={`${userStats.currentStreak}`}
          icon="🔥"
          trend={`${userStats.longestWinStreak} best`}
          trendUp={true}
          color="cyan"
        />
      </div>

      {/* CLAIM / CREDIT KPIs */}
      <div className="dashboard-kpiStrip">
        <div className="dashboard-kpiCard">
          <div className="dashboard-kpiLabel">Completed Claims</div>
          <div className="dashboard-kpiValue">{userStats.totalMatches}</div>
          <div className="dashboard-kpiHint">Based on match history</div>
        </div>

        <div className="dashboard-kpiCard">
          <div className="dashboard-kpiLabel">Active Claims</div>
          <div className="dashboard-kpiValue">0</div>
          <div className="dashboard-kpiHint">TODO: real-time active claims</div>
        </div>

        <div className="dashboard-kpiCard">
          <div className="dashboard-kpiLabel">Total Earned</div>
          <div className="dashboard-kpiValue">₺{creditKpis.totalEarned.toLocaleString()}</div>
          <div className="dashboard-kpiHint">Last {recentMatches.length} matches</div>
        </div>

        <div className="dashboard-kpiCard">
          <div className="dashboard-kpiLabel">Total Spent</div>
          <div className="dashboard-kpiValue">₺{creditKpis.totalSpent.toLocaleString()}</div>
          <div className="dashboard-kpiHint">Last {recentMatches.length} matches</div>
        </div>

        <div className="dashboard-kpiCard">
          <div className="dashboard-kpiLabel">Success Rate</div>
          <div className="dashboard-kpiValue">{userStats.winRate}%</div>
          <div className="dashboard-kpiHint">Wins vs losses</div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="charts-section">
        <div className="chart-col chart-col--small">
          <ChartCard title="Match Statistics">
            {hasMatchData ? (
              <WinLossChart
                wins={userStats.wins}
                losses={userStats.losses}
                title="Win/Loss Ratio"
              />
            ) : (
              <div className="dashboard-emptyState">
                <div className="dashboard-emptyIcon" aria-hidden="true">📊</div>
                <div className="dashboard-emptyTitle">Henüz istatistik yok</div>
                <div className="dashboard-emptyDesc">İlk iddianı oyna, performans grafikleri burada görünsün.</div>
              </div>
            )}
          </ChartCard>
        </div>

        <div className="chart-col chart-col--large">
          <ChartCard title="Performance Trend">
            {hasTrendData ? (
              <PerformanceChart
                data={chartData.data}
                labels={chartData.labels}
                title="Score Progression"
                yAxisLabel="Score"
                lineColor="rgba(0, 245, 212, 1)"
                fillColor="rgba(0, 245, 212, 0.1)"
              />
            ) : (
              <div className="dashboard-emptyState">
                <div className="dashboard-emptyIcon" aria-hidden="true">📈</div>
                <div className="dashboard-emptyTitle">Trend verisi hazır değil</div>
                <div className="dashboard-emptyDesc">Maç geçmişin arttıkça performans trendin otomatik oluşacak.</div>
              </div>
            )}
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
            type="button"
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
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
