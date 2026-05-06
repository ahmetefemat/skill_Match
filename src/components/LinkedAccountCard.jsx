import React from 'react';
import riotIcon from "../assets/landing/riot.png"; 
import steamIcon from "../assets/landing/steam.png";

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
          {/* İKON DEĞİŞİKLİĞİNİ BURAYA YAPTIK */}
          <span className="account-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {account.platform === "Riot Games" ? (
              <img src={riotIcon} alt="Riot Games" style={{ width: '35px', height: '35px', objectFit: 'contain' }} />
            ) : account.platform === "Steam" ? (
              <img src={steamIcon} alt="Steam" style={{ width: '35px', height: '35px', objectFit: 'contain' }} />
            ) : (
              account.icon /* Eğer başka bir platform eklenirse varsayılan ikon/yazı çıksın diye */
            )}
          </span>
          
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
    </div>
  );
};

export default LinkedAccountCard;