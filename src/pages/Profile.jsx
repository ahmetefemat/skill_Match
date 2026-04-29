import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { checkBalance, getTransactionHistory } from "../services/walletService";
import { getUserMatchHistory } from "../services/matchService";
import {
  buildAchievements,
  buildLinkedAccounts,
  buildUserProfile,
  getUserById,
  getUsersByIds,
  resolveStatsOverrides,
} from "../services/userService";
import {
  buildMatchStats,
  buildWalletSummary,
  mapMatchesForTable,
  mapTransactions,
} from "../services/statsService";
import StatCard from "../components/StatCard";
import ProfileHeader from "../components/ProfileHeader";
import LinkedAccountCard from "../components/LinkedAccountCard";
import TransactionItem from "../components/TransactionItem";
import AchievementCard from "../components/AchievementCard";
import RecentMatchesTable from "../components/RecentMatchesTable";
import Footer from "../components/Footer.jsx";
import AppNavbar from "../components/AppNavbar.jsx";
import "./Landing.css";
import "./Profile.css";

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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState({
    username: "",
    riotId: "",
    steamId: "",
    avatarUrl: "",
    bio: "",
  });

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
    console.log("Edit Profile clicked");
    setEditDraft({
      username: userProfile.username || "",
      riotId: userProfile.riotId || "",
      steamId: userProfile.steamId || "",
      avatarUrl: userProfile.avatarUrl || "",
      bio: userProfile.bio || "",
    });
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
  };

  const handleSaveEdits = () => {
    // TODO: Persist profile changes via Firebase/API (userService) then refresh profile state
    const nextUsername = editDraft.username.trim();
    const nextRiotId = editDraft.riotId.trim();
    const nextSteamId = editDraft.steamId.trim();
    const nextAvatarUrl = editDraft.avatarUrl.trim();
    const nextBio = editDraft.bio.trim();

    setUserProfile((prev) => ({
      ...prev,
      username: nextUsername || prev.username,
      riotId: nextRiotId || null,
      steamId: nextSteamId || null,
      avatarUrl: nextAvatarUrl || null,
      bio: nextBio,
    }));

    // Keep the Linked Accounts section consistent with the edited IDs.
    // TODO: Replace with rebuildLinkedAccounts(updatedUserDataFromBackend)
    setLinkedAccounts((prev) =>
      prev.map((account) => {
        if (account.id === "riot") {
          return {
            ...account,
            username: nextRiotId || "Not connected",
            connected: Boolean(nextRiotId),
          };
        }
        if (account.id === "steam") {
          return {
            ...account,
            username: nextSteamId || "Not connected",
            connected: Boolean(nextSteamId),
          };
        }
        return account;
      })
    );

    setIsEditOpen(false);
  };

  // TODO: Connect logout to auth system
  const handleLogout = () => {
    console.log("Logout clicked");
    alert("Çıkış işlemi backend/auth entegrasyonunda bağlanacak");
  };

  // TODO: Connect to wallet/payment flow
  const handleAddCredit = () => {
    console.log("Add Credit clicked");
    alert(
      "Add Credit feature coming soon!\n\nThis will integrate with:\n- Stripe/Payment provider\n- Multiple payment methods\n- Transaction confirmation"
    );
  };

  // TODO: Connect to Riot Games OAuth
  const handleConnectRiot = (account) => {
    console.log("Connect Riot Games clicked");
    alert(
      `${account.connected ? "Manage" : "Connect"} Riot Games account.\n\nThis will redirect to Riot OAuth for authentication.`
    );
  };

  // TODO: Connect to Steam OAuth
  const handleConnectSteam = (account) => {
    console.log("Connect Steam clicked");
    alert(
      `${account.connected ? "Manage" : "Connect"} Steam account.\n\nThis will redirect to Steam OAuth for authentication.`
    );
  };

  // TODO: Navigate to match details page
  const handleViewMatchDetails = (match) => {
    console.log("View match details:", match);
    alert(
      `Match Details:\nGame: ${match.game}\nOpponent: ${match.opponent}\nResult: ${match.result}\nK/D/A: ${match.kills}/${match.deaths}/${match.assists}`
    );
  };

  // TODO: Navigate to wallet/transaction history page
  const handleViewAllTransactions = () => {
    console.log("View all transactions clicked");
    alert(
      "Transaction history page coming soon!\n\nYou will see:\n- Complete transaction list\n- Filters by type\n- Export options"
    );
  };

  // Handler for linked account actions
  const handleManageAccount = (account) => {
    if (account.platform === "Riot Games") {
      handleConnectRiot(account);
    } else if (account.platform === "Steam") {
      handleConnectSteam(account);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (authLoading || profileLoading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner">SkillMatch Profil yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="profile-wrapper profile-page">
      {/* Background */}
      <div className="profile-bg" aria-hidden="true">
        <div className="profile-orb profile-orb--a" />
        <div className="profile-orb profile-orb--b" />
        <div className="profile-orb profile-orb--c" />
      </div>

      <AppNavbar
        balance={userProfile.balance}
        username={userProfile.username}
        avatarUrl={userProfile.avatarUrl || user?.photoURL}
      />

      <main className="profile-main">
        <div className="landing-container">
          {/* PROFILE HEADER */}
          <ProfileHeader user={userProfile} onEditClick={handleEditProfile} onLogoutClick={handleLogout} />

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
      </main>

      <Footer />

      {/* EDIT PROFILE MODAL */}
      {isEditOpen && (
        <div
          className="profile-modalOverlay"
          role="dialog"
          aria-modal="true"
          aria-label="Edit Profile"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) handleCloseEdit();
          }}
        >
          <div className="profile-modalPanel">
            <div className="profile-modalHeader">
              <div>
                <div className="profile-modalKicker">ACCOUNT</div>
                <h3 className="profile-modalTitle">Profili Düzenle</h3>
                <p className="profile-modalSubtitle">Değişiklikler şimdilik sadece bu ekranda güncellenir.</p>
              </div>

              <button
                type="button"
                className="profile-modalClose"
                onClick={handleCloseEdit}
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="profile-formGrid">
              <label className="profile-field">
                <span className="profile-label">Username</span>
                <input
                  className="profile-input"
                  value={editDraft.username}
                  onChange={(e) => setEditDraft((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="Username"
                />
              </label>

              <label className="profile-field">
                <span className="profile-label">Riot ID</span>
                <input
                  className="profile-input"
                  value={editDraft.riotId}
                  onChange={(e) => setEditDraft((prev) => ({ ...prev, riotId: e.target.value }))}
                  placeholder="Example#TR1"
                />
              </label>

              <label className="profile-field">
                <span className="profile-label">Steam ID</span>
                <input
                  className="profile-input"
                  value={editDraft.steamId}
                  onChange={(e) => setEditDraft((prev) => ({ ...prev, steamId: e.target.value }))}
                  placeholder="Steam ID"
                />
              </label>

              <label className="profile-field">
                <span className="profile-label">Avatar URL</span>
                <input
                  className="profile-input"
                  value={editDraft.avatarUrl}
                  onChange={(e) => setEditDraft((prev) => ({ ...prev, avatarUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </label>

              <label className="profile-field profile-field--full">
                <span className="profile-label">Bio</span>
                <textarea
                  className="profile-textarea"
                  value={editDraft.bio}
                  onChange={(e) => setEditDraft((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  placeholder="Kısa bir bio..."
                />
              </label>
            </div>

            <div className="profile-modalActions">
              <button type="button" className="landing-btn landing-btn--ghost" onClick={handleCloseEdit}>
                İptal
              </button>
              <button type="button" className="landing-btn landing-btn--primary" onClick={handleSaveEdits}>
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
