import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { checkBalance, getTransactionHistory } from '../services/walletService';
import { getUserMatchHistory } from '../services/matchService';
import {
  buildAchievements,
  buildLinkedAccounts,
  buildUserProfile,
  getUserById,
  getUsersByIds,
  resolveStatsOverrides,
} from '../services/userService';
import {
  buildMatchStats,
  buildWalletSummary,
  mapMatchesForTable,
  mapTransactions,
} from '../services/statsService';
import StatCard from '../components/StatCard';
import ProfileHeader from '../components/ProfileHeader';
import LinkedAccountCard from '../components/LinkedAccountCard';
import TransactionItem from '../components/TransactionItem';
import AchievementCard from '../components/AchievementCard';
import RecentMatchesTable from '../components/RecentMatchesTable';
import './Profile.css';

/**
 * Profile Component
 * User profile page with stats, linked accounts, wallet, and match history
 *
 * Architecture:
 * - All data flows through props to child components
 * - Data is fetched from Firebase services
 * - Handler functions are frontend-only (console.log, alerts, or state changes)
 */

const Profile = () => {
  const { user, userData, loading: authLoading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(buildUserProfile({}, null, 0));
  const [userStats, setUserStats] = useState(buildMatchStats([], null));
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [walletData, setWalletData] = useState({
    currentBalance: 0,
    totalEarnings: 0,
    totalWithdrawals: 0,
    pendingTransactions: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // State for user interactions
  // TODO: Implement edit modal when backend is ready
  // const [showEditModal, setShowEditModal] = useState(false);

  const loadProfileData = useCallback(async () => {
    if (!user) {
      return;
    }

    setProfileLoading(true);
    try {
      const [balanceResult, transactionResult, matchResult, userResult] =
        await Promise.allSettled([
          checkBalance(user.uid),
          getTransactionHistory(user.uid, 10),
          getUserMatchHistory(user.uid, 10),
          getUserById(user.uid),
        ]);

      const balanceValue =
        balanceResult.status === "fulfilled" ? balanceResult.value : null;
      const transactionData =
        transactionResult.status === "fulfilled" ? transactionResult.value : [];
      const matchData =
        matchResult.status === "fulfilled" ? matchResult.value : [];
      const freshUserData =
        userResult.status === "fulfilled" ? userResult.value : null;

      const mergedUserData = freshUserData || userData || {};
      const profileBalance =
        mergedUserData.balance ??
        mergedUserData.guncel_kredi ??
        mergedUserData.currentBalance ??
        mergedUserData.bakiye;
      const effectiveBalance =
        balanceValue || balanceValue === 0
          ? balanceValue
          : profileBalance || 0;

      const opponentIds = matchData
        .map((match) =>
          match.olusturan_id === user.uid
            ? match.katilan_id
            : match.olusturan_id
        )
        .filter(Boolean);
      const opponentMap = await getUsersByIds(opponentIds);

      const profile = buildUserProfile(mergedUserData, user, effectiveBalance || 0);
      setUserProfile(profile);
      setLinkedAccounts(buildLinkedAccounts(mergedUserData));

      const statsOverrides = resolveStatsOverrides(mergedUserData);
      setUserStats(buildMatchStats(matchData, user.uid, statsOverrides));
      setRecentMatches(mapMatchesForTable(matchData, user.uid, opponentMap));

      setTransactions(mapTransactions(transactionData, effectiveBalance || 0));
      setWalletData(buildWalletSummary(transactionData, effectiveBalance || 0));
      setAchievements(buildAchievements(mergedUserData));
    } catch (error) {
      console.error('Profile data load error:', error);
    } finally {
      setProfileLoading(false);
    }
  }, [user, userData]);

  useEffect(() => {
    if (!authLoading) {
      loadProfileData();
    }
  }, [authLoading, loadProfileData]);

  // ============================================
  // HANDLER FUNCTIONS FOR USER INTERACTIONS
  // ============================================

  // TODO: Open profile edit modal/form when backend is ready
  const handleEditProfile = () => {
    console.log('Edit Profile clicked');
    alert('Edit Profile feature coming soon!\n\nThis will allow you to:\n- Update username\n- Change profile picture\n- Edit bio\n- Update game preferences');
  };

  // TODO: Connect to wallet/payment flow
  const handleAddCredit = () => {
    console.log('Add Credit clicked');
    alert('Add Credit feature coming soon!\n\nThis will integrate with:\n- Stripe/Payment provider\n- Multiple payment methods\n- Transaction confirmation');
  };

  // TODO: Connect to Riot Games OAuth
  const handleConnectRiot = (account) => {
    console.log('Connect Riot Games clicked');
    alert(`${account.connected ? 'Manage' : 'Connect'} Riot Games account.\n\nThis will redirect to Riot OAuth for authentication.`);
  };

  // TODO: Connect to Steam OAuth
  const handleConnectSteam = (account) => {
    console.log('Connect Steam clicked');
    alert(`${account.connected ? 'Manage' : 'Connect'} Steam account.\n\nThis will redirect to Steam OAuth for authentication.`);
  };

  // TODO: Navigate to match details page
  const handleViewMatchDetails = (match) => {
    console.log('View match details:', match);
    alert(`Match Details:\nGame: ${match.game}\nOpponent: ${match.opponent}\nResult: ${match.result}\nK/D/A: ${match.kills}/${match.deaths}/${match.assists}`);
  };

  // TODO: Navigate to wallet/transaction history page
  const handleViewAllTransactions = () => {
    console.log('View all transactions clicked');
    alert('Transaction history page coming soon!\n\nYou will see:\n- Complete transaction list\n- Filters by type\n- Export options');
  };

  // Handler for linked account actions
  const handleManageAccount = (account) => {
    if (account.platform === 'Riot Games') {
      handleConnectRiot(account);
    } else if (account.platform === 'Steam') {
      handleConnectSteam(account);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (authLoading || profileLoading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      {/* PROFILE HEADER */}
      <ProfileHeader
        user={userProfile}
        onEditClick={handleEditProfile}
      />

      {/* STATISTICS OVERVIEW SECTION */}
      <section className="profile-section">
        <h2 className="section-title">Player Statistics</h2>
        <div className="stats-grid">
          <StatCard
            title="Total Matches"
            value={userStats.totalMatches}
            icon="🎯"
            trend={`${userStats.wins} wins`}
            trendUp={true}
            color="cyan"
          />
          <StatCard
            title="Win Rate"
            value={`${userStats.winRate}%`}
            icon="🏆"
            trend={`${userStats.wins}W - ${userStats.losses}L`}
            trendUp={true}
            color="emerald"
          />
          <StatCard
            title="Current Streak"
            value={userStats.currentStreak}
            icon="⚡"
            trend={`Best: ${userStats.longestWinStreak} wins`}
            trendUp={true}
            color="purple"
          />
          <StatCard
            title="Avg Performance"
            value={`${userStats.averageScore}/10`}
            icon="💎"
            trend={`K/D/A: ${userStats.averageKills}/${userStats.averageDeaths}/${userStats.averageAssists}`}
            trendUp={true}
            color="pink"
          />
        </div>
      </section>

      {/* LINKED ACCOUNTS SECTION */}
      <section className="profile-section">
        <h2 className="section-title">Linked Accounts</h2>
        <div className="linked-accounts-grid">
          {linkedAccounts.map((account) => (
            <LinkedAccountCard
              key={account.id}
              account={account}
              onManage={handleManageAccount}
            />
          ))}
        </div>
      </section>

      {/* WALLET SECTION */}
      <section className="profile-section">
        <h2 className="section-title">Wallet & Earnings</h2>
        <div className="wallet-grid">
          <div className="wallet-card wallet-card--primary">
            <div className="wallet-header">
              <h3 className="wallet-title">Current Balance</h3>
              <span className="wallet-icon">💰</span>
            </div>
            <p className="wallet-amount">₺{walletData.currentBalance.toLocaleString()}</p>
            <button className="btn-wallet-action" onClick={handleAddCredit}>
              + Add Credit
            </button>
          </div>

          <div className="wallet-card">
            <div className="wallet-stat">
              <span className="stat-label">Total Earned</span>
              <span className="stat-value earned">₺{walletData.totalEarnings.toLocaleString()}</span>
            </div>
          </div>

          <div className="wallet-card">
            <div className="wallet-stat">
              <span className="stat-label">Total Spent</span>
              <span className="stat-value spent">₺{walletData.totalWithdrawals.toLocaleString()}</span>
            </div>
          </div>

          <div className="wallet-card">
            <div className="wallet-stat">
              <span className="stat-label">Pending</span>
              <span className="stat-value pending">
                {walletData.pendingTransactions === 0
                  ? 'None'
                  : `₺${walletData.pendingTransactions}`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT TRANSACTIONS SECTION */}
      <section className="profile-section">
        <div className="section-header">
          <h2 className="section-title">Recent Transactions</h2>
          <button
            className="btn-view-all"
            onClick={handleViewAllTransactions}
          >
            View All →
          </button>
        </div>
        <div className="transactions-list">
          {transactions.slice(0, 5).map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </section>

      {/* RECENT MATCHES SECTION */}
      <section className="profile-section">
        <div className="section-header">
          <h2 className="section-title">Recent Matches</h2>
        </div>
        <RecentMatchesTable
          matches={recentMatches.slice(0, 5)}
          onViewDetails={handleViewMatchDetails}
        />
      </section>

      {/* ACHIEVEMENTS SECTION */}
      <section className="profile-section">
        <h2 className="section-title">Achievements ({achievements.length})</h2>
        {achievements.length === 0 ? (
          <p className="empty-state">No achievements yet.</p>
        ) : (
          <div className="achievements-grid">
            {achievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
              />
            ))}
          </div>
        )}
      </section>

      {/* TODO: Connect all sections to real Firebase data */}
    </div>
  );
};

export default Profile;
