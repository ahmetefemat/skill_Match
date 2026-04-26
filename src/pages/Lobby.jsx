import React, { useState } from 'react';
import './Lobby.css';

const Lobby = () => {
  // ANA NAVİGASYON STATE'İ
  const [activeMenu, setActiveMenu] = useState('LOBBY');
  const [activeFilter, setActiveFilter] = useState('Tümü');
  
  // VERİTABANI STATE'LERİ (Firebase bağlandığında buralar dolacak)
  const [lobbies, setLobbies] = useState([]); 
  const [matchHistory, setMatchHistory] = useState([]); 
  const [transactions, setTransactions] = useState([]);

  // MODAL VE FORM STATE'LERİ
  const [showModal, setShowModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState('Valorant');
  const [betAmount, setBetAmount] = useState(100);

  // OYUNLARA GÖRE DİNAMİK HEDEFLER
  const targets = {
    'Valorant': ['En az 10 Kill', 'En az 20 Kill', 'MVP Ol', 'Maç Kazan'],
    'LoL': ['İlk Kan (First Blood)', 'En az 15 Asist', 'Ejderha Çal', 'Maç Kazan'],
    'CS:GO': ['En az 20 Kill', '1v2 Clutch At', 'MVP Ol', 'Maç Kazan']
  };

  const menus = [
    { id: 'LOBBY', label: 'LOBBY', icon: '⚏' },
    { id: 'WALLET', label: 'WALLET', icon: '💳' },
    { id: 'MATCH HISTORY', label: 'MATCH HISTORY', icon: '⏱' },
    { id: 'SETTINGS', label: 'SETTINGS', icon: '⚙' }
  ];

  // Lobi Filtreleme Fonksiyonu
  const filteredLobbies = activeFilter === 'Tümü' 
    ? lobbies 
    : lobbies.filter(lobby => lobby.game === activeFilter);

  return (
    <div className="lobby-wrapper">
      
      {/* =========================================
          SOL MENÜ (SIDEBAR)
      ========================================== */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          SkillMatch
        </div>
        
        <nav className="sidebar-nav">
          {menus.map((menu) => (
            <div 
              key={menu.id} 
              onClick={() => setActiveMenu(menu.id)}
              className={`nav-item ${activeMenu === menu.id ? 'active' : ''}`}
            >
              <span>{menu.icon}</span>
              {menu.label}
            </div>
          ))}
        </nav>

        <div className="sidebar-profile">
          <div className="profile-avatar" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', fontSize: '20px'}}>
            👤
          </div>
          <div className="profile-info">
            {/* Backend bağlanınca buralar dinamik olacak */}
            <h4>Oyuncu Adı</h4>
            <span>Bağlanıyor...</span>
          </div>
        </div>
      </aside>

      {/* =========================================
          ANA İÇERİK ALANI
      ========================================== */}
      <main className="main-content">
        
        {/* ÜST BAR (KREDİLER) */}
        <header className="top-header">
          <div className="credit-badge">
            <span className="credit-icon">$</span> -- Kredi
          </div>
          <button className="btn-primary" onClick={() => setActiveMenu('WALLET')}>Add Credits</button>
        </header>

        {/* -------------------------------------------
            1. CANLI LOBİ EKRANI
        -------------------------------------------- */}
        {activeMenu === 'LOBBY' && (
          <>
            <div className="lobby-header">
              <h1>Canlı Lobi</h1>
              
              <div className="filters">
                {['Tümü', 'LoL', 'Valorant', 'CS:GO'].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`filter-chip ${activeFilter === filter ? 'active' : ''}`}
                  >
                    {filter === 'LoL' && <span>🧙‍♂️</span>}
                    {filter === 'Valorant' && <span>🔫</span>}
                    {filter === 'CS:GO' && <span>💣</span>}
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="cards-grid">
              {/* Firebase'den gelen iddialar buraya maplenecek */}
              {filteredLobbies.map((lobby) => (
                <div key={lobby.id} className="match-card">
                  <div className="card-user">
                    <img src={lobby.avatar} alt={lobby.username} />
                    <div className="card-user-info">
                      <h3>{lobby.username}</h3>
                      <p>Rank: {lobby.rank}</p>
                    </div>
                  </div>
                  <div className="card-target">
                    {lobby.game} | {lobby.target}
                  </div>
                  <div className="card-footer">
                    <div className="bet-info">
                      <span className="bet-label">BAHİS</span>
                      <span className="bet-value">{lobby.betAmount} Kredi</span>
                    </div>
                    <button className="btn-outline">Eşleşmeyi Kabul Et</button>
                  </div>
                </div>
              ))}

              {/* Sabit "İddia Ekle" Kartı */}
              <div className="match-card add-card" onClick={() => setShowModal(true)}>
                <span className="add-icon">+</span>
                <p>Kendi iddialarını<br/>oluştur ve rakiplerini<br/>bekle.</p>
              </div>
            </div>
          </>
        )}

        {/* -------------------------------------------
            2. MAÇ GEÇMİŞİ EKRANI
        -------------------------------------------- */}
        {activeMenu === 'MATCH HISTORY' && (
          <>
            <div className="lobby-header">
              <h1>Maç Geçmişi</h1>
            </div>

            {matchHistory.length === 0 ? (
              <div className="empty-history">
                <div style={{fontSize: '40px', marginBottom: '16px'}}>⏱</div>
                <p>Henüz tamamlanmış bir maçın bulunmuyor.</p>
              </div>
            ) : (
              <div className="history-section">
                <div className="history-table-header">
                  <span>Oyun</span>
                  <span>Hedef / İddia</span>
                  <span>Sonuç</span>
                  <span>İstatistik</span>
                  <span style={{textAlign: 'right'}}>Miktar</span>
                </div>

                {matchHistory.map((match) => (
                  <div key={match.id} className="history-row">
                    <div className="history-game">
                      {match.game === 'Valorant' ? '🔫' : match.game === 'CS:GO' ? '💣' : '🧙‍♂️'} {match.game}
                    </div>
                    <div className="history-target">{match.target}</div>
                    <div className={`history-status status-${match.result.toLowerCase()}`}>
                      {match.result === 'WIN' ? 'GALİBİYET' : match.result === 'LOSS' ? 'MAĞLUBİYET' : 'BEKLEMEDE'}
                    </div>
                    <div className="history-stats">{match.stats}</div>
                    <div className={`history-amount ${match.result === 'WIN' ? 'status-win' : match.result === 'LOSS' ? 'status-loss' : 'status-pending'}`}>
                      {match.result === 'WIN' ? '+' : match.result === 'LOSS' ? '-' : ''}{match.amount} Kredi
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* -------------------------------------------
            3. CÜZDAN (WALLET) EKRANI
        -------------------------------------------- */}
        {activeMenu === 'WALLET' && (
          <div className="wallet-section">
            <div className="lobby-header">
              <h1>Cüzdanım</h1>
            </div>
            
            <div className="wallet-grid">
              <div className="wallet-left">
                <div className="balance-card">
                  <span className="balance-label">MEVCUT BAKİYE</span>
                  <h1 className="balance-amount"><span className="currency-symbol">$</span> -- Kredi</h1>
                  <div className="balance-actions">
                    <button className="btn-primary" style={{flex: 1}}>Kredi Yükle</button>
                    <button className="btn-outline" style={{flex: 1, borderColor: 'rgba(255,255,255,0.2)', color: '#fff'}}>Çekim Talebi</button>
                  </div>
                </div>

                <div className="quick-load-section">
                  <h3 className="section-subtitle">Hızlı Yükleme Paketleri</h3>
                  <div className="credit-packages">
                    <button className="pack-btn">
                      <span className="pack-amount">500</span>
                      <span className="pack-label">Kredi</span>
                    </button>
                    <button className="pack-btn popular">
                      <div className="popular-badge">POPÜLER</div>
                      <span className="pack-amount">1500</span>
                      <span className="pack-label">Kredi</span>
                    </button>
                    <button className="pack-btn">
                      <span className="pack-amount">5000</span>
                      <span className="pack-label">Kredi</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="wallet-right">
                <h3 className="section-subtitle">Son İşlemler</h3>
                {transactions.length === 0 ? (
                  <div className="empty-history" style={{padding: '40px 0'}}>
                    <div style={{fontSize: '32px', marginBottom: '12px'}}>💳</div>
                    <p>Henüz bir hesap hareketin bulunmuyor.</p>
                  </div>
                ) : (
                  <div className="transaction-list">
                    {/* İşlemler buraya maplenecek */}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------
            4. AYARLAR (SETTINGS) EKRANI
        -------------------------------------------- */}
     {/* 4. AYARLAR (SETTINGS) EKRANI */}
     {activeMenu === 'SETTINGS' && (
          <div className="settings-container">
            <div className="lobby-header"><h1>Ayarlar</h1></div>
            <div className="settings-grid">
              <div className="settings-card profile-main">
                <div className="settings-profile-header">
                  <div className="settings-avatar-big">👤</div>
                  <div className="settings-name-edit">
                    {/* FAKE VERİLER KALDIRILDI, BACKEND'DEN GELECEK */}
                    <h2>Kullanıcı Adı</h2>
                    <span>@kullanici_etiketi</span>
                    <button className="btn-text">Fotoğrafı Değiştir</button>
                  </div>
                </div>
                <div className="settings-form" style={{marginTop: '20px'}}>
                  <div className="form-group">
                    <label className="form-label">Görünen Ad</label>
                    <input type="text" className="glass-input" placeholder="Adınız" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">E-posta</label>
                    <input type="email" className="glass-input" placeholder="mail@adresiniz.com" />
                  </div>
                </div>
                <button className="btn-primary" style={{width: 'fit-content'}}>Kaydet</button>
              </div>

              <div className="settings-card linked-accounts">
                <h3 className="section-subtitle">Bağlı Hesaplar</h3>
                <div className="account-list">
                  <div className="account-item">
                    <div className="acc-info"><span>🔫</span> <div><h4>Valorant</h4><span className="acc-status disconnected">Hesap Bağlı Değil</span></div></div>
                    <button className="btn-primary-small">Bağla</button>
                  </div>
                  <div className="account-item">
                    <div className="acc-info"><span>🧙‍♂️</span> <div><h4>LoL</h4><span className="acc-status disconnected">Hesap Bağlı Değil</span></div></div>
                    <button className="btn-primary-small">Bağla</button>
                  </div>
                  <div className="account-item">
                    <div className="acc-info"><span>💣</span> <div><h4>CS:GO</h4><span className="acc-status disconnected">Hesap Bağlı Değil</span></div></div>
                    <button className="btn-primary-small">Bağla</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SAĞ ALT FAB BUTON */}
        {activeMenu === 'LOBBY' && (
          <button className="fab-button" onClick={() => setShowModal(true)}>
            <span>+</span> İDDİA OLUŞTUR
          </button>
        )}

        {/* =========================================
            İDDİA OLUŞTUR MODALI (ULTRA GLASSY)
        ========================================== */}
        {showModal && (
          <div className="modal-overlay">
            <div className="create-modal">
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              <h2 className="modal-title">Yeni İddia Oluştur</h2>
              
              <div className="form-group">
                <label className="form-label">Oyun Seç</label>
                <div className="game-selector">
                  <button className={`game-opt ${selectedGame === 'LoL' ? 'active' : ''}`} onClick={() => setSelectedGame('LoL')}>🧙‍♂️ LoL</button>
                  <button className={`game-opt ${selectedGame === 'Valorant' ? 'active' : ''}`} onClick={() => setSelectedGame('Valorant')}>🔫 Valorant</button>
                  <button className={`game-opt ${selectedGame === 'CS:GO' ? 'active' : ''}`} onClick={() => setSelectedGame('CS:GO')}>💣 CS:GO</button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">İddia Hedefi</label>
                <select className="glass-select">
                  {targets[selectedGame].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Bahis Miktarı (Kredi)</label>
                <input type="number" className="glass-input" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} step="50" min="50" />
              </div>

              <div className="bet-summary">
                <span>TOPLAM BAHİS</span>
                <h2>{betAmount} Kredi</h2>
              </div>

              <button className="btn-primary" style={{width: '100%', marginTop: '24px', padding: '16px'}} onClick={() => setShowModal(false)}>
                İDDİAYI YAYINLA
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Lobby;