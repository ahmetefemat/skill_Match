import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/StatCard';
import ProfileHeader from '../components/ProfileHeader';
import LinkedAccountCard from '../components/LinkedAccountCard';
import TransactionItem from '../components/TransactionItem';
import AchievementCard from '../components/AchievementCard';
import RecentMatchesTable from '../components/RecentMatchesTable';
import {
  mockUserProfile,
  mockProfileStats,
  mockLinkedAccounts,
  mockWalletData,
  mockTransactionHistory,
  mockProfileMatches,
  mockAchievements,
} from '../mockData/profileMockData';
import './Profile.css';

/**
 * Profile Component
 * User profile page with stats, linked accounts, wallet, and match history
 *
 * Architecture:
 * - All data flows through props to child components
 * - Mock data is structured like backend API responses
 * - TODO: Backend developer can replace mockData with Firebase/API calls
 * - Handler functions are frontend-only (console.log, alerts, or state changes)
 */

const Profile = () => {
  const { loading: authLoading } = useAuth();

  // TODO: Replace mock data with real user data from Firebase
  const [userProfile] = useState(mockUserProfile);
  const [userStats] = useState(mockProfileStats);
  const [linkedAccounts] = useState(mockLinkedAccounts);
  const [walletData] = useState(mockWalletData);
  const [transactions] = useState(mockTransactionHistory);
  const [recentMatches] = useState(mockProfileMatches);
  const [achievements] = useState(mockAchievements);

  // State for user interactions
  // TODO: Implement edit modal when backend is ready
  // const [showEditModal, setShowEditModal] = useState(false);

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

  if (authLoading) {
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
        <div className="achievements-grid">
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
            />
          ))}
        </div>
      </section>

      {/* TODO: Connect all sections to real Firebase data */}
    </div>
  );
};

export default Profile;
