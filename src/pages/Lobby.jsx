
import React, { useState, useEffect } from 'react';
import './Lobby.css';
import { useAuth } from '../hooks/useAuth';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { checkBalance, addCredit, listenToUserTransactions } from '../services/walletService';
import { createMatch, listenToActiveMatches, listenToPlayingMatches, joinMatch } from '../services/matchService';
import { logoutUser } from '../services/authService';

const Lobby = () => {
  // AUTH VE USER DATA
  const { userData, loading: authLoading } = useAuth();
  const user = auth.currentUser;

  // ANA NAVİGASYON STATE'İ
  const [activeMenu, setActiveMenu] = useState('LOBBY');
  const [activeFilter, setActiveFilter] = useState('Tümü');
  
  // CÜZDAN STATE'LERİ
  const [currentBalance, setCurrentBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  
  // VERİTABANI STATE'LERİ - Firebase entegrasyonu (Real-time)
  const [lobbies, setLobbies] = useState([]); 
  const [playingMatches, setPlayingMatches] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [isJoiningMatch, setIsJoiningMatch] = useState(false);
  const [selectedMatchDetail, setSelectedMatchDetail] = useState(null);
  const [userNameMap, setUserNameMap] = useState({});

  // MODAL VE FORM STATE'LERİ
  const [showModal, setShowModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState('Valorant');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [betAmount, setBetAmount] = useState(100);
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);

  // OYUNLARA GÖRE DİNAMİK HEDEFLER
  const targets = {
    'Valorant': ['En az 10 Kill', 'En az 20 Kill', 'MVP Ol', 'Maç Kazan'],
    'LoL': ['İlk Kan (First Blood)', 'En az 15 Asist', 'Ejderha Çal', 'Maç Kazan'],
    'CS:GO': ['En az 20 Kill', '1v2 Clutch At', 'MVP Ol', 'Maç Kazan']
  };

  // İLK HEDEF SEÇİMİNİ OTOMATIK YAP
  const targetList = targets[selectedGame];
  useEffect(() => {
    setSelectedTarget(targetList[0]);
  }, [selectedGame, targetList]);

  // BAKIYE YÜKLE
  useEffect(() => {
    const fetchBalance = async () => {
      if (user && !authLoading) {
        setBalanceLoading(true);
        const bakiye = await checkBalance(user.uid);
        setCurrentBalance(bakiye);
        setBalanceLoading(false);
      }
    };
    fetchBalance();
  }, [user, authLoading]);

  // AKTİF MAÇLARI DİNLE (Real-time)
  useEffect(() => {
    const unsubscribe = listenToActiveMatches((activeMatches, error) => {
      if (error) {
        console.error("Açık maçlar dinlemesi hatası:", error);
        setMatchesLoading(false);
        return;
      }
      setLobbies(activeMatches);
      setMatchesLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // OYNANAN MAÇLARI DİNLE (Real-time)
  useEffect(() => {
    const unsubscribe = listenToPlayingMatches((playing, error) => {
      if (error) {
        console.error("Oynanan maçlar dinlemesi hatası:", error);
        return;
      }
      setPlayingMatches(playing);
    });

    return () => unsubscribe();
  }, []);

  // KULLANICI TRANSACTIONS DİNLE (Real-time)
  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenToUserTransactions(user.uid, (txList, error) => {
      if (error) {
        console.error("İşlem geçmişi dinlemesi hatası:", error);
        return;
      }
      setTransactions(txList);
    });

    return () => unsubscribe();
  }, [user]);

  // MAÇLARDA GEÇEN KULLANICI ADLARINI USERS KOLEKSİYONUNDAN ÇEK
  useEffect(() => {
    const allUserIds = new Set();

    [...lobbies, ...playingMatches].forEach((match) => {
      if (match?.olusturan_id) allUserIds.add(match.olusturan_id);
      if (match?.katilan_id) allUserIds.add(match.katilan_id);
    });

    const missingUserIds = Array.from(allUserIds).filter((uid) => !userNameMap[uid]);
    if (missingUserIds.length === 0) return;

    let isCancelled = false;

    const fetchUserNames = async () => {
      const resolvedUsers = await Promise.all(
        missingUserIds.map(async (uid) => {
          try {
            const userSnap = await getDoc(doc(db, "users", uid));
            if (userSnap.exists()) {
              const data = userSnap.data();
              return [uid, data?.kullanici_adi || `Oyuncu-${uid.slice(0, 5)}`];
            }
            return [uid, `Oyuncu-${uid.slice(0, 5)}`];
          } catch {
            return [uid, `Oyuncu-${uid.slice(0, 5)}`];
          }
        })
      );

      if (isCancelled) return;

      setUserNameMap((prev) => {
        const next = { ...prev };
        resolvedUsers.forEach(([uid, username]) => {
          next[uid] = username;
        });
        return next;
      });
    };

    fetchUserNames();

    return () => {
      isCancelled = true;
    };
  }, [lobbies, playingMatches, userNameMap]);

  const getUserName = (uid) => {
    if (!uid) return "Henüz katılan yok";
    return userNameMap[uid] || `Oyuncu-${uid.slice(0, 5)}`;
  };

  const getGameIcon = (gameName) => {
    if (gameName === 'LoL') return '🧙‍♂️';
    if (gameName === 'Valorant') return '🔫';
    if (gameName === 'CS:GO') return '💣';
    return '🎮';
  };

  // BAKIYE GÜNCELLE
  const refreshBalance = async () => {
    if (user) {
      const bakiye = await checkBalance(user.uid);
      setCurrentBalance(bakiye);
    }
  };

  // MAÇ OLUŞTUR
  const handleCreateMatch = async () => {
    if (!selectedTarget || betAmount <= 0) {
      alert("Lütfen hedef seçin ve geçerli bir miktar girin.");
      return;
    }

    if (currentBalance < betAmount) {
      alert("Yetersiz bakiye! Cüzdanınızda yeterli kredi bulunmamaktadır.");
      return;
    }

    try {
      setIsCreatingMatch(true);
      await createMatch(user.uid, selectedGame, betAmount, selectedTarget);
      alert(`✅ ${selectedGame} maçı başarıyla oluşturuldu! ${betAmount} ₺ bloke edildi.`);
      setShowModal(false);
      setBetAmount(100);
      refreshBalance();
    } catch (err) {
      alert("Maç oluşturulamadı: " + err.message);
    } finally {
      setIsCreatingMatch(false);
    }
  };

  // MAÇA KATIL
  const handleJoinMatch = async (matchId) => {
    try {
      setIsJoiningMatch(true);
      await joinMatch(matchId, user.uid);
      alert(`✅ Maça başarıyla katıldınız!`);
      refreshBalance();
    } catch (err) {
      const errorMsg = err.message || "Maça katılırken hata oluştu";
      alert("Hata: " + errorMsg);
    } finally {
      setIsJoiningMatch(false);
    }
  };

  // KREDİ YÜKLE
  const handleAddCredit = async () => {
    const miktar = prompt("Yüklemek istediğiniz kredi miktarını girin:");
    if (!miktar || isNaN(miktar) || Number(miktar) <= 0) {
      return alert("Lütfen geçerli bir sayı girin.");
    }

    try {
      await addCredit(user.uid, Number(miktar));
      alert(`✅ ${miktar} kredi başarıyla yüklendi!`);
      refreshBalance();
    } catch (err) {
      alert("Kredi yükleme başarısız: " + err.message);
    }
  };

  // ÇIKIŞ YAP
  const handleLogout = async () => {
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      try {
        await logoutUser();
      } catch (err) {
        console.error('Çıkış hatası:', err);
        alert('Çıkış yapılırken hata oluştu');
      }
    }
  };

  // AYARLAR
  const menus = [
    { id: 'LOBBY', label: 'LOBBY', icon: '⚏' },
    { id: 'WALLET', label: 'WALLET', icon: '💳' },
    { id: 'MATCH HISTORY', label: 'MATCH HISTORY', icon: '⏱' },
    { id: 'SETTINGS', label: 'SETTINGS', icon: '⚙' }
  ];

  if (authLoading || balanceLoading) {
    return <div className="p-10 text-white">Yükleniyor...</div>;
  }

  const visibleLobbies = activeFilter === 'Tümü'
    ? lobbies
    : lobbies.filter((match) => match.oyun_turu === activeFilter);

  const visiblePlayingMatches = activeFilter === 'Tümü'
    ? playingMatches
    : playingMatches.filter((match) => match.oyun_turu === activeFilter);

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
            <h4>{userData?.kullanici_adi || "Oyuncu"}</h4>
            <span>{user?.email || "Bağlanıyor..."}</span>
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
            <span className="credit-icon">$</span> {currentBalance} Kredi
          </div>
          <button className="btn-primary" onClick={() => setActiveMenu('WALLET')}>Kredi Yükle</button>
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

            {/* AÇIK MAÇLAR BÖLÜMÜ */}
            <div style={{marginBottom: '40px'}}>
              <h2 style={{color: '#fff', marginBottom: '16px', fontSize: '16px', fontWeight: '600', textTransform: 'uppercase', opacity: 0.8}}>📍 Açık İddialar</h2>
              <div className="cards-grid">
                {matchesLoading ? (
                  <div className="match-card" style={{ textAlign: 'center', opacity: 0.7 }}>
                    <p>Açık maçlar yükleniyor...</p>
                  </div>
                ) : visibleLobbies.length === 0 ? (
                  <div className="match-card" style={{ textAlign: 'center', opacity: 0.7 }}>
                    <p>Şu an açık bir maç bulunmuyor. Yeni maç açarak ilk oyuncu ol!</p>
                  </div>
                ) : (
                  visibleLobbies.map((lobby) => (
                    <div 
                      key={lobby.id} 
                      className="match-card match-card-clickable match-card--pending"
                      onClick={() => setSelectedMatchDetail(lobby)}
                    >
                      <div className="match-card-top">
                        <span className="game-pill">{getGameIcon(lobby.oyun_turu)} {lobby.oyun_turu}</span>
                        <span className="status-pill status-pill--waiting">Rakip Bekliyor</span>
                      </div>

                      <div className="card-user">
                        <div className="card-avatar">
                          {getUserName(lobby.olusturan_id).substring(0, 1).toUpperCase()}
                        </div>
                        <div className="card-user-info">
                          <h3>{getUserName(lobby.olusturan_id)}</h3>
                          <p>Hedef: {lobby.hedef || 'Belirtilmemiş'}</p>
                        </div>
                      </div>
                      <div className="card-target">
                        {lobby.oyun_turu} | {lobby.hedef}
                      </div>
                      <div className="card-footer">
                        <div className="bet-info">
                          <span className="bet-label">BAHİS</span>
                          <span className="bet-value">{lobby.giris_ucreti} Kredi</span>
                        </div>
                        <button
                          className="btn-join"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinMatch(lobby.id);
                          }}
                          disabled={isJoiningMatch || lobby.olusturan_id === user?.uid}
                          title={lobby.olusturan_id === user?.uid ? 'Senin iddian' : 'Bu maça katıl'}
                        >
                          {isJoiningMatch ? 'Katılıyor...' : 'Eşleşmeyi Kabul Et'}
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {/* Sabit "İddia Ekle" Kartı */}
                <div className="match-card add-card" onClick={() => setShowModal(true)}>
                  <span className="add-icon">+</span>
                  <p>Kendi iddialarını<br/>oluştur ve rakiplerini<br/>bekle.</p>
                </div>
              </div>
            </div>

            {/* OYNANAN MAÇLAR BÖLÜMÜ */}
            {visiblePlayingMatches.length > 0 && (
              <div>
                <h2 style={{color: '#fff', marginBottom: '16px', fontSize: '16px', fontWeight: '600', textTransform: 'uppercase', opacity: 0.8}}>⚔️ Canlı Maçlar</h2>
                <div className="cards-grid">
                  {visiblePlayingMatches.map((match) => (
                    <div 
                      key={match.id} 
                      className="match-card match-card-clickable match-card--live"
                      onClick={() => setSelectedMatchDetail(match)}
                    >
                      <div className="match-card-top">
                        <span className="game-pill">{getGameIcon(match.oyun_turu)} {match.oyun_turu}</span>
                        <span className="status-pill status-pill--live">Canlı Oynanıyor</span>
                      </div>

                      <div className="card-user">
                        <div className="card-avatar card-avatar-live">
                          ⚔️
                        </div>
                        <div className="card-user-info">
                          <h3>{getUserName(match.olusturan_id)} vs {getUserName(match.katilan_id)}</h3>
                          <p>Canlı eşleşme devam ediyor</p>
                        </div>
                      </div>

                      <div className="card-users-line">
                        <span>👤 {getUserName(match.olusturan_id)}</span>
                        <span>⚔️ {getUserName(match.katilan_id)}</span>
                      </div>

                      <div className="card-target">
                        {match.oyun_turu} | {match.hedef}
                      </div>
                      <div className="card-footer">
                        <div className="bet-info">
                          <span className="bet-label">BAHİS</span>
                          <span className="bet-value">{match.giris_ucreti} Kredi</span>
                        </div>
                        <button className="btn-join btn-join-live" disabled>
                          Devam Ediyor
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

            <div className="empty-history">
              <div style={{fontSize: '40px', marginBottom: '16px'}}>⏱</div>
              <p>Henüz tamamlanmış bir maçın bulunmuyor.</p>
            </div>
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
                  <h1 className="balance-amount"><span className="currency-symbol">₺</span> {currentBalance} Kredi</h1>
                  <div className="balance-actions">
                    <button className="btn-primary" style={{flex: 1}} onClick={handleAddCredit}>Kredi Yükle</button>
                    <button className="btn-outline" style={{flex: 1, borderColor: 'rgba(255,255,255,0.2)', color: '#fff'}} onClick={() => alert('Çekim özelliği yakında!')}>Çekim Talebi</button>
                  </div>
                </div>

                <div className="quick-load-section">
                  <h3 className="section-subtitle">Hızlı Yükleme Paketleri</h3>
                  <div className="credit-packages">
                    <button className="pack-btn" onClick={() => { const inp = prompt('500 ₺ yüklemek istediğinizi onaylıyor musunuz?'); if(inp === 'evet') handleAddCredit(); }}>
                      <span className="pack-amount">500</span>
                      <span className="pack-label">Kredi</span>
                    </button>
                    <button className="pack-btn popular" onClick={() => { const inp = prompt('1500 ₺ yüklemek istediğinizi onaylıyor musunuz? (POPÜLER)'); if(inp === 'evet') handleAddCredit(); }}>
                      <div className="popular-badge">POPÜLER</div>
                      <span className="pack-amount">1500</span>
                      <span className="pack-label">Kredi</span>
                    </button>
                    <button className="pack-btn" onClick={() => { const inp = prompt('5000 ₺ yüklemek istediğinizi onaylıyor musunuz?'); if(inp === 'evet') handleAddCredit(); }}>
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
                  <div className="transaction-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {transactions.map((tx) => (
                      <div key={tx.id} style={{ 
                        padding: '12px', 
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        fontSize: '13px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#ddd', fontWeight: '600' }}>{tx.aciklama}</span>
                          <span style={{ 
                            color: tx.miktar > 0 ? '#4ade80' : '#f87171',
                            fontWeight: 'bold'
                          }}>
                            {tx.miktar > 0 ? '+' : ''}{tx.miktar} ₺
                          </span>
                        </div>
                        <span style={{ color: '#999', fontSize: '11px' }}>
                          {tx.tarih?.toDate?.().toLocaleDateString?.('tr-TR') || 'Tarih bilinmiyor'}
                        </span>
                      </div>
                    ))}
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

              <div className="settings-card" style={{gridColumn: '1 / -1', borderTop: '2px solid rgba(255, 255, 255, 0.1)'}}>
                <h3 className="section-subtitle" style={{marginBottom: '20px'}}>Hesap</h3>
                <button 
                  className="btn-danger"
                  onClick={handleLogout}
                  style={{
                    width: 'fit-content',
                    backgroundColor: 'rgba(255, 59, 48, 0.15)',
                    color: '#ff3b30',
                    border: '1px solid rgba(255, 59, 48, 0.3)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 59, 48, 0.25)';
                    e.target.style.borderColor = 'rgba(255, 59, 48, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 59, 48, 0.15)';
                    e.target.style.borderColor = 'rgba(255, 59, 48, 0.3)';
                  }}
                >
                  🚪 Çıkış Yap
                </button>
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
                <select className="glass-select" value={selectedTarget} onChange={(e) => setSelectedTarget(e.target.value)}>
                  {targets[selectedGame].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Bahis Miktarı (Kredi)</label>
                <input type="number" className="glass-input" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} step="50" min="50" />
              </div>

              <div className="bet-summary">
                <span>TOPLAM BAHİS</span>
                <h2>{betAmount} Kredi</h2>
              </div>

              <button 
                className="btn-primary" 
                style={{width: '100%', marginTop: '24px', padding: '16px'}} 
                onClick={handleCreateMatch}
                disabled={isCreatingMatch}
              >
                {isCreatingMatch ? 'Oluşturuluyor...' : 'İDDİAYI YAYINLA'}
              </button>
            </div>
          </div>
        )}

        {/* =========================================
            MAÇ DETAY MODALI
        ========================================== */}
        {selectedMatchDetail && (
          <div className="modal-overlay" onClick={() => setSelectedMatchDetail(null)}>
            <div className="create-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedMatchDetail(null)}>×</button>
              <h2 className="modal-title">Maç Detayı</h2>

              <div className="bet-summary" style={{ marginBottom: '20px' }}>
                <span>{selectedMatchDetail.oyun_turu} | {selectedMatchDetail.hedef}</span>
                <h2>{selectedMatchDetail.giris_ucreti} Kredi</h2>
              </div>

              <div className="form-group">
                <label className="form-label">Katılımcılar</label>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{ marginBottom: '12px', color: '#fff' }}>
                    👤 Oluşturan: {getUserName(selectedMatchDetail.olusturan_id)}
                  </div>
                  <div style={{ color: '#fff' }}>
                    ⚔️ Katılan: {getUserName(selectedMatchDetail.katilan_id)}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Durum</label>
                <div style={{
                  display: 'inline-block',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  background: selectedMatchDetail.durum === 'oynanıyor'
                    ? 'rgba(76, 175, 80, 0.18)'
                    : 'rgba(255, 193, 7, 0.18)',
                  border: selectedMatchDetail.durum === 'oynanıyor'
                    ? '1px solid rgba(76, 175, 80, 0.4)'
                    : '1px solid rgba(255, 193, 7, 0.4)',
                  color: '#fff',
                  fontWeight: '600'
                }}>
                  {selectedMatchDetail.durum === 'oynanıyor' ? 'CANLI OYNANIYOR' : 'RAKİP BEKLİYOR'}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Lobby;