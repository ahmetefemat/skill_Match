
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Lobby.css";
import { useAuth } from "../hooks/useAuth";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { checkBalance, addCredit, listenToUserTransactions } from "../services/walletService";
import { createMatch, listenToActiveMatches, listenToPlayingMatches, joinMatch } from "../services/matchService";
import { logoutUser } from "../services/authService";
import Footer from "../components/Footer.jsx";
import AppNavbar from "../components/AppNavbar.jsx";
// src/assets/landing klasöründen oyun ikonlarını çekiyoruz
import lolIcon from "../assets/landing/lol-icon.png";
import valoIcon from "../assets/landing/valorant-icon.png";
import cs2Icon from "../assets/landing/cs2-icon.png";
const Lobby = () => {
  // --- YENİ EKLENEN: Sinyal okuyucuyu başlattık ---
  const location = useLocation();
  // ------------------------------------------------

  // AUTH VE USER DATA
  const { loading: authLoading } = useAuth();
  const user = auth.currentUser;

  // ANA NAVİGASYON STATE'İ
  const [activeMenu, setActiveMenu] = useState('LOBBY');
  const [activeFilter, setActiveFilter] = useState('Tümü');
  
  // --- YENİ EKLENEN: Cüzdan sinyalini yakalayan radar ---
  useEffect(() => {
    if (location.state?.openWallet) {
      setActiveMenu('WALLET');
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  // ------------------------------------------------------
  
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
  const [isOpen, setIsOpen] = useState(false);

  const claimGames = useMemo(
    () => [
      { id: "LoL", label: "LoL", iconSrc: lolIcon, iconAlt: "LoL" },
      { id: "Valorant", label: "Valorant", iconSrc: valoIcon, iconAlt: "Valorant" },
      // Data layer uses "CS:GO" today; UI label is "CS2".
      { id: "CS:GO", label: "CS2", iconSrc: cs2Icon, iconAlt: "CS2" },
    ],
    []
  );

  const toggleTargetDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeTargetDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelectTarget = useCallback((value) => {
    console.log("Selected target:", value);
    setSelectedTarget(value);
    setIsOpen(false);
  }, []);

  // OYUNLARA GÖRE DİNAMİK HEDEFLER
  const targets = useMemo(
    () => ({
      Valorant: ["En az 10 Kill", "En az 20 Kill", "MVP Ol", "Maç Kazan"],
      LoL: ["İlk Kan (First Blood)", "En az 15 Asist", "Ejderha Çal", "Maç Kazan"],
      "CS:GO": ["En az 20 Kill", "1v2 Clutch At", "MVP Ol", "Maç Kazan"],
    }),
    []
  );

  // İLK HEDEF SEÇİMİNİ OTOMATIK YAP
  useEffect(() => {
    const targetList = targets[selectedGame] ?? [];

    if (targetList.length === 0) {
      setSelectedTarget("");
      return;
    }

    setSelectedTarget((prev) => (targetList.includes(prev) ? prev : targetList[0]));
    setIsOpen(false);
  }, [selectedGame, targets]);

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
    if (gameName === 'LoL') return <img src={lolIcon} alt="LoL" style={{ width: '20px', height: '20px' }} />;
    if (gameName === 'Valorant') return <img src={valoIcon} alt="Valorant" style={{ width: '20px', height: '20px' }} />;
    if (gameName === 'CS:GO' || gameName === 'CS2') return <img src={cs2Icon} alt="CS" style={{ width: '20px', height: '20px' }} />;
    return '🎮'; // Varsayılan için istersen buraya da bir default icon koyabilirsin
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
 // AYARLAR (Eski haline geri getiriyoruz)
 const menus = [
  { id: "LOBBY", label: "Lobi", icon: "⚏" },
  { id: "WALLET", label: "Cüzdan", icon: "💳" }, // <-- BUNU GERİ EKLE KANKA
  { id: "MATCH HISTORY", label: "Maç Geçmişi", icon: "⏱" },
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

  const gameFilters = [
    { key: "all", value: "Tümü", label: "Tümü" },
    { key: "lol", value: "LoL", label: "LoL" },
    { key: "val", value: "Valorant", label: "Valorant" },
    // Data layer still uses "CS:GO" today; UI label is "CS2".
    { key: "cs2", value: "CS:GO", label: "CS2" },
  ];

  return (
    <div className="lobby-wrapper lobby-page">
      {/* Deep layered background (Landing language) */}
      <div className="lobby-bg" aria-hidden="true">
        <div className="lobby-orb lobby-orb--a" />
        <div className="lobby-orb lobby-orb--b" />
        <div className="lobby-orb lobby-orb--c" />
        <div className="lobby-grid" />
      </div>

      <AppNavbar
        balance={currentBalance}
        username={user?.displayName || user?.email?.split("@")[0] || "Player"}
        avatarUrl={user?.photoURL}
      />

   {/* Secondary (in-page) navigation for Lobby sections */}
<div className="lobby-subHeader">
  <div className="landing-container lobby-subHeaderInner">
    <div className="lobby-tabs" role="tablist" aria-label="Lobby sections">
      {menus
        .filter((menu) => menu.id !== "WALLET") // <-- CÜZDANI GÖRSEL OLARAK BURADA SİLDİK
        .map((menu) => (
          <button
            key={menu.id}
            type="button"
            onClick={() => setActiveMenu(menu.id)}
            className={`lobby-tab ${activeMenu === menu.id ? "isActive" : ""}`}
          >
            <span aria-hidden="true" className="lobby-tabIcon">
              {menu.icon}
            </span>
            {menu.label}
          </button>
        ))}
    </div>
  </div>
</div>
      {/* Main content */}
      <main className="main-content lobby-main">
        <div className="landing-container">

        {/* -------------------------------------------
            1. CANLI LOBİ EKRANI
        -------------------------------------------- */}
        {activeMenu === 'LOBBY' && (
          <>
            <div className="lobby-header">
              <div className="lobby-titleRow">
                <h1>Canlı Lobi</h1>
                <button
                  type="button"
                  className="landing-btn landing-btn--primary lobby-cta"
                  onClick={() => setShowModal(true)}
                >
                  İddia Oluştur <span aria-hidden="true">→</span>
                </button>
              </div>

              <div className="lobby-filters" aria-label="Game filters">
                {gameFilters.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setActiveFilter(f.value)}
                    className={`lobby-filterPill ${activeFilter === f.value ? "isActive" : ""}`}
                  >
                   {f.value === "LoL" && <img src={lolIcon} alt="LoL" style={{ width: '20px', height: '20px', objectFit: 'contain' }} aria-hidden="true" />}
{f.value === "Valorant" && <img src={valoIcon} alt="Valorant" style={{ width: '20px', height: '20px', objectFit: 'contain' }} aria-hidden="true" />}
{f.value === "CS:GO" && <img src={cs2Icon} alt="CS:GO" style={{ width: '20px', height: '20px', objectFit: 'contain' }} aria-hidden="true" />}
{f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AÇIK MAÇLAR BÖLÜMÜ */}
            <section className="lobby-section">
              <h2 className="lobby-sectionTitle">📍 Açık İddialar</h2>
              <div className="cards-grid">
                {matchesLoading ? (
                  <div className="match-card lobby-emptyCard" role="status">
                    <p>Açık iddialar yükleniyor...</p>
                  </div>
                ) : visibleLobbies.length === 0 ? (
                  <div className="match-card lobby-emptyCard">
                    <div className="lobby-emptyIcon" aria-hidden="true">✨</div>
                    <p className="lobby-emptyTitle">Şu anda açık iddia bulunmuyor.</p>
                    <p className="lobby-emptyDesc">İlk iddianı oluştur ve rakiplerini bekle.</p>
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
                <div className="match-card add-card" onClick={() => setShowModal(true)} role="button" tabIndex={0}>
                  <span className="add-icon">+</span>
                  <p>Kendi iddialarını<br/>oluştur ve rakiplerini<br/>bekle.</p>
                </div>
              </div>
            </section>

            {/* OYNANAN MAÇLAR BÖLÜMÜ */}
            {visiblePlayingMatches.length > 0 && (
              <section className="lobby-section">
                <h2 className="lobby-sectionTitle">⚔️ Canlı Maçlar</h2>
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
              </section>
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
            <div className="acc-info">
                <img src={valoIcon} alt="Valorant" style={{ width: '24px', height: '24px' }} /> 
                <div><h4>Valorant</h4><span className="acc-status disconnected">Hesap Bağlı Değil</span></div>
            </div>
            <button className="btn-primary-small">Bağla</button>
        </div>
        <div className="account-item">
            <div className="acc-info">
                <img src={lolIcon} alt="LoL" style={{ width: '24px', height: '24px' }} /> 
                <div><h4>LoL</h4><span className="acc-status disconnected">Hesap Bağlı Değil</span></div>
            </div>
            <button className="btn-primary-small">Bağla</button>
        </div>
        <div className="account-item">
            <div className="acc-info">
                <img src={cs2Icon} alt="CS:GO" style={{ width: '24px', height: '24px' }} /> 
                <div><h4>CS:GO</h4><span className="acc-status disconnected">Hesap Bağlı Değil</span></div>
            </div>
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

        </div>
      </main>

      <Footer />

      {/* Mobile CTA */}
      {activeMenu === 'LOBBY' && (
        <button className="fab-button" onClick={() => setShowModal(true)} type="button">
          <span aria-hidden="true">+</span> İDDİA OLUŞTUR
        </button>
      )}

      {/* =========================================
          İDDİA OLUŞTUR MODALI (ULTRA GLASSY)
      ========================================== */}
        {showModal && (
          <div className="claim-modal-overlay" onClick={() => setShowModal(false)} role="presentation">
            <div
              className="claim-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Yeni İddia Oluştur"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="claim-modal__header">
                <h2 className="claim-modal__title">Yeni İddia Oluştur</h2>
                <button
                  className="claim-modal__close"
                  onClick={() => setShowModal(false)}
                  type="button"
                  aria-label="Kapat"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <div className="sm-claim-game-selector" role="group" aria-label="Oyun seçimi">
                {claimGames.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    className={`sm-claim-game-button ${
                      selectedGame === game.id ? "sm-claim-game-button--active" : ""
                    }`}
                    onClick={() => {
                      setSelectedGame(game.id);
                    }}
                  >
                    <span className="sm-claim-game-icon" aria-hidden="true">
                      <img src={game.iconSrc} alt={game.iconAlt} loading="lazy" />
                    </span>
                    <span>{game.label}</span>
                  </button>
                ))}
              </div>

              <div
                className={`claim-modal__formGroup claim-modal__formGroup--target ${
                  isOpen ? "claim-modal__formGroup--targetOpen" : ""
                }`}
              >
                <label className="claim-modal__label">İddia Hedefi</label>
                <div className="custom-select-container">
                  <div
                    className={`custom-select-header claim-modal__selectHeader ${isOpen ? "open" : ""}`}
                    onClick={toggleTargetDropdown}
                    role="button"
                    tabIndex={0}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleTargetDropdown();
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        closeTargetDropdown();
                      }
                    }}
                  >
                    {selectedTarget || "Hedef seçin"}
                    <span className="arrow" aria-hidden="true">{isOpen ? "▲" : "▼"}</span>
                  </div>

                  <ul
                    className={`custom-select-list claim-modal__selectList ${isOpen ? "is-open" : ""}`}
                    role="listbox"
                    aria-label="İddia hedefleri"
                    aria-hidden={!isOpen}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault();
                        closeTargetDropdown();
                      }
                    }}
                  >
                    {(targets[selectedGame] ?? []).map((t) => (
                      <li key={t} role="option" aria-selected={selectedTarget === t}>
                        <button
                          type="button"
                          className={`claim-modal__targetOption ${
                            selectedTarget === t ? "claim-modal__targetOption--active" : ""
                          }`}
                          tabIndex={isOpen ? 0 : -1}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSelectTarget(t);
                          }}
                        >
                          {t}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="claim-modal__formGroup">
                <label className="claim-modal__label">Bahis Miktarı (Kredi)</label>
                <input
                  type="number"
                  className="glass-input claim-modal__input"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  step="50"
                  min="50"
                />
              </div>

              <div className="claim-modal__summary" aria-label="Toplam bahis">
                <div className="claim-modal__summaryMeta">
                  <span className="claim-modal__summaryLabel">TOPLAM BAHİS</span>
                </div>
                <div className="claim-modal__summaryValue">{betAmount} Kredi</div>
              </div>

              <button
                className="btn-primary claim-modal__submit"
                onClick={handleCreateMatch}
                disabled={isCreatingMatch}
                type="button"
              >
                {isCreatingMatch ? "Oluşturuluyor..." : "İDDİAYI YAYINLA"}
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

    </div>
  );
};

export default Lobby;