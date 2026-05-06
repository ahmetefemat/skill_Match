import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { addCredit, deductCredit, checkBalance } from "../services/walletService";
import { createMatch, updateMatchStatus, completeMatch, listenToPlayingMatches } from "../services/matchService";
import "./TestDashboard.css";

export default function TestDashboard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Oynanan maçlar
  const [playingMatches, setPlayingMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);

  // Modal state
  const [activeModal, setActiveModal] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [winnerSelection, setWinnerSelection] = useState(null);

  const showMessage = useCallback((msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  }, []);

  const [creditAmount, setCreditAmount] = useState("");
  const [deductAmount, setDeductAmount] = useState("");
  const [gameType, setGameType] = useState("CS2");
  const [matchAmount, setMatchAmount] = useState("");
  const [targetGoal, setTargetGoal] = useState("");
  const [createdMatchId, setCreatedMatchId] = useState("");

  const loadBalance = useCallback(async () => {
    if (!user) return;
    try {
      const currentBalance = await checkBalance(user.uid);
      setBalance(currentBalance);
      showMessage(`Bakiye yüklendi: ${currentBalance}`, "success");
    } catch (error) {
      showMessage(`Bakiye yükleme hatası: ${error.message}`, "error");
    }
  }, [showMessage, user]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  // Oynanan maçları dinle
  useEffect(() => {
    setMatchesLoading(true);
    const unsubscribe = listenToPlayingMatches((matches, error) => {
      if (error) {
        showMessage(`Maç yükleme hatası: ${error.message}`, "error");
      } else {
        setPlayingMatches(matches);
      }
      setMatchesLoading(false);
    });

    return () => unsubscribe();
  }, [showMessage]);

  const handleAddCredit = async (e) => {
    e.preventDefault();
    if (!creditAmount || isNaN(creditAmount) || creditAmount <= 0) {
      showMessage("Geçerli bir tutar giriniz", "error");
      return;
    }

    setLoading(true);
    try {
      await addCredit(user.uid, parseFloat(creditAmount));
      showMessage(`✅ ${creditAmount} başarıyla eklendi!`, "success");
      setCreditAmount("");
      await loadBalance();
    } catch (error) {
      showMessage(`❌ Hata: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeductCredit = async (e) => {
    e.preventDefault();
    if (!deductAmount || isNaN(deductAmount) || deductAmount <= 0) {
      showMessage("Geçerli bir tutar giriniz", "error");
      return;
    }

    setLoading(true);
    try {
      await deductCredit(user.uid, parseFloat(deductAmount), "Test işlemi - Bakiye çıkarma");
      showMessage(`✅ ${deductAmount} başarıyla çıkarıldı!`, "success");
      setDeductAmount("");
      await loadBalance();
    } catch (error) {
      showMessage(`❌ Hata: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (!matchAmount || isNaN(matchAmount) || matchAmount <= 0) {
      showMessage("Geçerli bir giriş ücreti giriniz", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await createMatch(user.uid, gameType, parseFloat(matchAmount), targetGoal || "Test Hedefi");
      setCreatedMatchId(result.matchId);
      showMessage(`✅ Maç başarıyla oluşturuldu! ID: ${result.matchId}`, "success");
      setMatchAmount("");
      setTargetGoal("");
      await loadBalance();
    } catch (error) {
      showMessage(`❌ Hata: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMatchStatus = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateMatchStatus(selectedMatch.id, "iptal");
      showMessage(`✅ Maç başarıyla iptal edildi!`, "success");
      setActiveModal(null);
      setSelectedMatch(null);
    } catch (error) {
      showMessage(`❌ Hata: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMatch = async (e) => {
    e.preventDefault();
    if (!winnerSelection) {
      showMessage("Lütfen bir kazanan seçiniz", "error");
      return;
    }

    setLoading(true);
    try {
      const creatorId = selectedMatch.olusturan_id;
      const joinedId = selectedMatch.katilan_id;
      const winnerId = winnerSelection === "creator" ? creatorId : joinedId;

      await completeMatch(selectedMatch.id, winnerId, creatorId, joinedId, selectedMatch.giris_ucreti);
      showMessage(`✅ Maç tamamlandı! Kazanan: ${winnerSelection === "creator" ? "Oluşturan" : "Katılan"}`, "success");
      setActiveModal(null);
      setSelectedMatch(null);
      setWinnerSelection(null);
    } catch (error) {
      showMessage(`❌ Hata: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const openMatchModal = async (match, modalType) => {
    setSelectedMatch(match);
    setActiveModal(modalType);
    setWinnerSelection(null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedMatch(null);
    setWinnerSelection(null);
  };

  return (
    <div className="test-dashboard-container">
      <div className="test-dashboard-header">
        <div className="test-header-content">
          <h1>🧪 Test Dashboard</h1>
          <p>Uygulamanın fonksiyonlarını test edin ve maçları yönetin</p>
        </div>
      </div>

      {message && <div className={`test-alert test-alert-${messageType}`}>{message}</div>}

      {/* BALANÇ KARTSI */}
      <div className="test-section">
        <div className="test-balance-card">
          <div className="test-balance-header">
            <h2>💰 Mevcut Bakiye</h2>
            <button onClick={loadBalance} className="test-btn test-btn-secondary test-btn-sm" disabled={loading}>
              🔄
            </button>
          </div>
          <div className="test-balance-amount">{balance.toFixed(2)}</div>
          <p className="test-balance-label">Başarı Puanı</p>
        </div>
      </div>

      {/* OYNANAN MAÇLAR BÖLÜMÜ */}
      <div className="test-section">
        <div className="test-section-header">
          <h2>🎮 Oynanan Maçlar</h2>
          <span className="test-match-count">{playingMatches.length} maç</span>
        </div>

        {matchesLoading ? (
          <div className="test-loading">Maçlar yükleniyor...</div>
        ) : playingMatches.length === 0 ? (
          <div className="test-empty-state">
            <p>Şu anda oynanan maç bulunmuyor</p>
          </div>
        ) : (
          <div className="test-matches-grid">
            {playingMatches.map((match) => (
              <div key={match.id} className="test-match-card">
                <div className="test-match-header">
                  <div className="test-match-game">
                    <span className="test-match-type">{match.oyun_turu}</span>
                    <span className="test-match-fee">{match.giris_ucreti}₺</span>
                  </div>
                  <span className="test-match-goal">{match.hedef}</span>
                </div>

                <div className="test-match-players">
                  <div className="test-player">
                    <span className="test-player-role">👤 Oluşturan</span>
                    <code className="test-player-id">{match.olusturan_id.substring(0, 8)}...</code>
                  </div>
                  <div className="test-vs">VS</div>
                  <div className="test-player">
                    <span className="test-player-role">👤 Katılan</span>
                    <code className="test-player-id">{match.katilan_id.substring(0, 8)}...</code>
                  </div>
                </div>

                <div className="test-match-actions">
                  <button
                    className="test-btn test-btn-danger test-btn-sm"
                    onClick={() => openMatchModal(match, "cancel")}
                    disabled={loading}
                  >
                    🚫 İptal Et
                  </button>
                  <button
                    className="test-btn test-btn-success test-btn-sm"
                    onClick={() => openMatchModal(match, "winner")}
                    disabled={loading}
                  >
                    🏆 Kazanan Belirle
                  </button>
                </div>

                <div className="test-match-info">
                  <small>ID: <code>{match.id}</code></small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KULLANMIŞ KONTROLLER */}
      <div className="test-section">
        <div className="test-section-header">
          <h2>💳 Bakiye İşlemleri</h2>
        </div>

        <div className="test-grid">
          <div className="test-card">
            <h3>➕ Kredi Ekle</h3>
            <form onSubmit={handleAddCredit}>
              <input
                type="number"
                placeholder="Tutar girin"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                min="0.01"
                step="0.01"
                disabled={loading}
              />
              <button type="submit" className="test-btn test-btn-success" disabled={loading}>
                {loading ? "İşleniyor..." : "Ekle"}
              </button>
            </form>
            <small>Örnek: 100</small>
          </div>

          <div className="test-card">
            <h3>➖ Kredi Çıkar</h3>
            <form onSubmit={handleDeductCredit}>
              <input
                type="number"
                placeholder="Tutar girin"
                value={deductAmount}
                onChange={(e) => setDeductAmount(e.target.value)}
                min="0.01"
                step="0.01"
                disabled={loading}
              />
              <button type="submit" className="test-btn test-btn-danger" disabled={loading}>
                {loading ? "İşleniyor..." : "Çıkar"}
              </button>
            </form>
            <small>Örnek: 50</small>
          </div>
        </div>
      </div>

      {/* MAÇ OLUŞTURMA */}
      <div className="test-section">
        <div className="test-section-header">
          <h2>➕ Yeni Maç Oluştur</h2>
        </div>

        <div className="test-card test-card-full">
          <form onSubmit={handleCreateMatch}>
            <div className="test-form-row">
              <div className="test-form-group">
                <label>Oyun Türü</label>
                <select value={gameType} onChange={(e) => setGameType(e.target.value)} disabled={loading}>
                  <option value="CS2">CS2</option>
                  <option value="Valorant">Valorant</option>
                  <option value="Dota2">Dota 2</option>
                  <option value="LoL">League of Legends</option>
                </select>
              </div>
              <div className="test-form-group">
                <label>Giriş Ücreti</label>
                <input
                  type="number"
                  placeholder="Tutar"
                  value={matchAmount}
                  onChange={(e) => setMatchAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  disabled={loading}
                />
              </div>
              <div className="test-form-group">
                <label>Hedef (Opsiyonel)</label>
                <input
                  type="text"
                  placeholder="Hedef tanımı"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <button type="submit" className="test-btn test-btn-primary" disabled={loading}>
              {loading ? "Oluşturuluyor..." : "🎮 Maç Oluştur"}
            </button>
          </form>
          {createdMatchId && (
            <div className="test-success-box">
              ✅ Maç oluşturuldu! ID: <code>{createdMatchId}</code>
            </div>
          )}
        </div>
      </div>

      {/* BILGILER */}
      <div className="test-section">
        <div className="test-info-box">
          <h3>ℹ️ Test Bilgileri</h3>
          <p><strong>Kullanıcı ID:</strong> <code>{user?.uid}</code></p>
          <p><strong>Email:</strong> {user?.email}</p>
        </div>
      </div>

      {/* MODALS */}
      {/* İPTAL MODAL */}
      {activeModal === "cancel" && selectedMatch && (
        <div className="test-modal-overlay" onClick={closeModal}>
          <div className="test-modal" onClick={(e) => e.stopPropagation()}>
            <div className="test-modal-header">
              <h3>🚫 Maçı İptal Et</h3>
              <button className="test-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="test-modal-body">
              <p>Bu maçı iptal etmek istediğinizden emin misiniz?</p>
              <div className="test-modal-match-info">
                <div><strong>Oyun:</strong> {selectedMatch.oyun_turu}</div>
                <div><strong>Giriş Ücreti:</strong> {selectedMatch.giris_ucreti}₺</div>
                <div><strong>Hedef:</strong> {selectedMatch.hedef}</div>
              </div>
            </div>
            <div className="test-modal-footer">
              <button className="test-btn test-btn-secondary" onClick={closeModal} disabled={loading}>
                İptal
              </button>
              <button className="test-btn test-btn-danger" onClick={handleUpdateMatchStatus} disabled={loading}>
                {loading ? "İşleniyor..." : "Evet, İptal Et"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KAZANAN MODAL */}
      {activeModal === "winner" && selectedMatch && (
        <div className="test-modal-overlay" onClick={closeModal}>
          <div className="test-modal" onClick={(e) => e.stopPropagation()}>
            <div className="test-modal-header">
              <h3>🏆 Kazananı Belirle</h3>
              <button className="test-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="test-modal-body">
              <p>Maçın kazananını seçiniz:</p>
              <div className="test-modal-match-info">
                <div><strong>Oyun:</strong> {selectedMatch.oyun_turu}</div>
                <div><strong>Giriş Ücreti:</strong> {selectedMatch.giris_ucreti}₺</div>
              </div>

              <div className="test-winner-options">
                <label className={`test-winner-option ${winnerSelection === "creator" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    value="creator"
                    checked={winnerSelection === "creator"}
                    onChange={(e) => setWinnerSelection(e.target.value)}
                  />
                  <span className="test-winner-label">
                    <span className="test-winner-title">👤 Oluşturan</span>
                    <code>{selectedMatch.olusturan_id.substring(0, 12)}...</code>
                  </span>
                </label>

                <label className={`test-winner-option ${winnerSelection === "joined" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    value="joined"
                    checked={winnerSelection === "joined"}
                    onChange={(e) => setWinnerSelection(e.target.value)}
                  />
                  <span className="test-winner-label">
                    <span className="test-winner-title">👤 Katılan</span>
                    <code>{selectedMatch.katilan_id.substring(0, 12)}...</code>
                  </span>
                </label>
              </div>
            </div>
            <div className="test-modal-footer">
              <button className="test-btn test-btn-secondary" onClick={closeModal} disabled={loading}>
                İptal
              </button>
              <button className="test-btn test-btn-success" onClick={handleCompleteMatch} disabled={loading || !winnerSelection}>
                {loading ? "İşleniyor..." : "Kazananı Onayla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
