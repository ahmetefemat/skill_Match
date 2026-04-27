import React from 'react';

/**
 * LinkedAccountCard Component
 * Displays a linked gaming account (Riot, Steam, etc)
 *
 * Props:
 *   account: Object - Account data with platform, username, connected status
 *   onManage: Function - Manage/connect handler
 */
const LinkedAccountCard = ({ account, onManage }) => {
  const getStatusColor = (connected) => {
    return connected ? 'connected' : 'disconnected';
  };

  return (
    <div className={`linked-account-card account-${getStatusColor(account.connected)}`}>
      <div className="account-header">
        <div className="account-icon-section">
          <span className="account-icon">{account.icon}</span>
          <div className="account-info">
            <h3 className="account-platform">{account.platform}</h3>
            <p className="account-username">{account.username}</p>
          </div>
        </div>

        <div className="account-status">
          {account.connected ? (
            <>
              <span className="status-badge status-badge--connected">✓ Connected</span>
              {account.verificationStatus === 'verified' && (
                <span className="verify-badge">Verified</span>
              )}
            </>
          ) : (
            <span className="status-badge status-badge--disconnected">Not Connected</span>
          )}
        </div>
      </div>

      {account.connected && account.connectedDate && (
        <p className="account-meta">
          Connected on {new Date(account.connectedDate).toLocaleDateString()}
        </p>
      )}

      <button
        className="btn-account-action"
        onClick={() => onManage(account)}
        title={account.connected ? 'Manage account' : 'Connect account'}
      >
        {account.connected ? '⚙ Manage' : '+ Connect'}
      </button>

      {/* TODO: Connect to real account linking from Firebase */}
    </div>
  );
};

export default LinkedAccountCard;
