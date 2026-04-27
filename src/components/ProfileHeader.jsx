import React from 'react';

/**
 * ProfileHeader Component
 * Displays user profile card with avatar, name, rank, and IDs
 *
 * Props:
 *   user: Object - User profile data
 *   onEditClick: Function - Edit profile handler
 */
const ProfileHeader = ({ user, onEditClick }) => {
  return (
    <div className="profile-header-card">
      <div className="profile-header-content">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {user.username?.[0]?.toUpperCase() || 'U'}
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
              <span className="id-value">{user.steamId ? '***' : 'Not connected'}</span>
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
          <button className="btn-primary btn-edit" onClick={onEditClick}>
            ✎ Edit Profile
          </button>
        </div>
      </div>

      <div className="profile-balance-section">
        <div className="balance-card">
          <span className="balance-label">Current Balance</span>
          <span className="balance-amount">₺{user.balance?.toLocaleString()}</span>
        </div>
      </div>

      {/* TODO: Connect to real user data from Firebase auth + Firestore */}
    </div>
  );
};

export default ProfileHeader;
