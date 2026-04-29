import React from 'react';

/**
 * ProfileHeader Component
 * Displays user profile card with avatar, name, rank, and IDs
 *
 * Props:
 *   user: Object - User profile data
 *   onEditClick: Function - Edit profile handler
 *   onLogoutClick: Function - Logout handler (placeholder)
 */
const ProfileHeader = ({ user, onEditClick, onLogoutClick }) => {
  return (
    <div className="profile-header-card">
      <div className="profile-header-content">
        <div className="profile-avatar-section">
          <div className="profile-avatar" aria-label="Avatar">
            {user.avatarUrl ? (
              <img
                className="profile-avatarImg"
                src={user.avatarUrl}
                alt="User avatar"
              />
            ) : (
              <span className="profile-avatarInitial">
                {user.username?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          {user.isVerified && <div className="verified-badge">✓</div>}
        </div>

        <div className="profile-info">
          <h1 className="profile-username">{user.username}</h1>
          <p className="profile-rank">
            <span className="rank-badge">{user.rank}</span>
            <span className="rank-level">Level {user.level}</span>
          </p>

          <div className="profile-ids">
            <div className="id-item">
              <span className="id-label">Riot ID:</span>
              <span className="id-value">{user.riotId || 'Not connected'}</span>
            </div>
            <div className="id-item">
              <span className="id-label">Steam ID:</span>
              <span className="id-value">{user.steamId || 'Not connected'}</span>
            </div>
          </div>

          {user.bio && <p className="profile-bio">{user.bio}</p>}

          <div className="profile-meta">
            <span className="meta-item">
              Member since {new Date(user.joinDate).toLocaleDateString()}
            </span>
            <span className="meta-item">Last active {user.lastActive}</span>
          </div>
        </div>

        <div className="profile-actions">
          <button className="landing-btn landing-btn--primary profile-actionBtn" onClick={onEditClick} type="button">
            ✎ Profili Düzenle
          </button>
          <button
            className="landing-btn landing-btn--ghost profile-actionBtn profile-actionBtn--danger"
            onClick={onLogoutClick}
            type="button"
            title="Logout"
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      <div className="profile-balance-section">
        <div className="balance-card">
          <span className="balance-label">Current Balance</span>
          <span className="balance-amount">₺{user.balance?.toLocaleString()}</span>
        </div>
      </div>

    </div>
  );
};

export default ProfileHeader;
