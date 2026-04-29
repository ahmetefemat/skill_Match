import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { addCredit, deductCredit, checkBalance } from "../services/walletService";
import { createMatch, updateMatchStatus, completeMatch } from "../services/matchService";
import "./TestDashboard.css";

export default function TestDashboard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [creditAmount, setCreditAmount] = useState("");
  const [deductAmount, setDeductAmount] = useState("");
  const [gameType, setGameType] = useState("CS2");
  const [matchAmount, setMatchAmount] = useState("");
  const [targetGoal, setTargetGoal] = useState("");
  const [createdMatchId, setCreatedMatchId] = useState("");
  const [matchIdForStatus, setMatchIdForStatus] = useState("");
  const [newStatus, setNewStatus] = useState("oynanıyor");
  const [matchIdForComplete, setMatchIdForComplete] = useState("");
  const [winnerUserId, setWinnerUserId] = useState("");

  const loadBalance = async () => {
    if (!user) return;
    try {
      const currentBalance = await checkBalance(user.uid);
      setBalance(currentBalance);
      showMessage(`Bakiye yüklendi: ${currentBalance}`, "success");
    } catch (error) {
      showMessage(`Bakiye yükleme hatası: ${error.message}`, "error");
    }
  };

  useEffect(() => {
    loadBalance();
  }, [user]);

  const showMessage = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

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
    if (!matchIdForStatus) {
      showMessage("Maç ID'si giriniz", "error");
      return;
    }

    setLoading(true);
    try {
      await updateMatchStatus(matchIdForStatus, newStatus);
      showMessage(`✅ Maç durumu "${newStatus}" olarak güncellendi!`, "success");
      setMatchIdForStatus("");
    } catch (error) {
      showMessage(`❌ Hata: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMatch = async (e) => {
    e.preventDefault();
    if (!matchIdForComplete || !winnerUserId) {
      showMessage("Maç ID'si ve kazanan kullanıcı ID'si giriniz", "error");
      return;
    }

    setLoading(true);
    try {
      await completeMatch(matchIdForComplete, winnerUserId, user.uid, "test-user-2", 100);
      showMessage(`✅ Maç tamamlandı! Kazanan: ${winnerUserId}`, "success");
      setMatchIdForComplete("");
      setWinnerUserId("");
    } catch (error) {
      showMessage(`❌ Hata: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-dashboard-container">
      <div className="test-dashboard-header">
        <h1>🧪 Test Dashboard</h1>
        <p>Uygulamanın temel fonksiyonlarını test edin</p>
      </div>

      {message && <div className={`test-alert test-alert-${messageType}`}>{message}</div>}

      <div className="test-balance-card">
        <h2>💰 Mevcut Bakiye</h2>
        <div className="test-balance-amount">{balance.toFixed(2)}</div>
        <button onClick={loadBalance} className="test-btn test-btn-secondary" disabled={loading}>Yenile</button>
      </div>

      <div className="test-grid">
        <div className="test-card">
          <h3>➕ Bakiye Ekleme</h3>
          <form onSubmit={handleAddCredit}>
            <input type="number" placeholder="Tutar ()" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} min="0.01" step="0.01" disabled={loading} />
            <button type="submit" className="test-btn test-btn-success" disabled={loading}>{loading ? "şleniyor..." : "Kredi Ekle"}</button>
          </form>
          <small>Örnek: 100</small>
        </div>

        <div className="test-card">
          <h3>➖ Bakiye Çıkarma</h3>
          <form onSubmit={handleDeductCredit}>
            <input type="number" placeholder="Tutar ()" value={deductAmount} onChange={(e) => setDeductAmount(e.target.value)} min="0.01" step="0.01" disabled={loading} />
            <button type="submit" className="test-btn test-btn-danger" disabled={loading}>{loading ? "şleniyor..." : "Kredi Çıkar"}</button>
          </form>
          <small>Örnek: 50</small>
        </div>

        <div className="test-card">
          <h3>🎮 Maç Oluşturma</h3>
          <form onSubmit={handleCreateMatch}>
            <select value={gameType} onChange={(e) => setGameType(e.target.value)} disabled={loading}>
              <option value="CS2">CS2</option>
              <option value="Valorant">Valorant</option>
              <option value="Dota2">Dota 2</option>
              <option value="LoL">League of Legends</option>
            </select>
            <input type="number" placeholder="Giriş Ücreti ()" value={matchAmount} onChange={(e) => setMatchAmount(e.target.value)} min="0.01" step="0.01" disabled={loading} />
            <input type="text" placeholder="Hedef (opsiyonel)" value={targetGoal} onChange={(e) => setTargetGoal(e.target.value)} disabled={loading} />
            <button type="submit" className="test-btn test-btn-primary" disabled={loading}>{loading ? "Oluşturuluyor..." : "Maç Oluştur"}</button>
          </form>
          {createdMatchId && <div className="test-success-box">✅ Maç ID: <code>{createdMatchId}</code></div>}
          <small>Bakiyeden giriş ücreti düşülecek</small>
        </div>

        <div className="test-card">
          <h3>🔄 Maç Durumu Güncelle</h3>
          <form onSubmit={handleUpdateMatchStatus}>
            <input type="text" placeholder="Maç ID" value={matchIdForStatus} onChange={(e) => setMatchIdForStatus(e.target.value)} disabled={loading} />
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} disabled={loading}>
              <option value="oynanıyor">Oynanıyor</option>
              <option value="tamamlandı">Tamamlandı</option>
              <option value="iptal">ptal</option>
            </select>
            <button type="submit" className="test-btn test-btn-warning" disabled={loading}>{loading ? "Güncelleniyor..." : "Durumu Güncelle"}</button>
          </form>
          <small>Geçerli durum geçişleri: beklemede→oynanıyor/iptal, oynanıyor→tamamlandı/iptal</small>
        </div>

        <div className="test-card">
          <h3>🏆 Maç Tamamla (Kazanan Belirle)</h3>
          <form onSubmit={handleCompleteMatch}>
            <input type="text" placeholder="Maç ID" value={matchIdForComplete} onChange={(e) => setMatchIdForComplete(e.target.value)} disabled={loading} />
            <input type="text" placeholder="Kazanan Kullanıcı ID" value={winnerUserId} onChange={(e) => setWinnerUserId(e.target.value)} disabled={loading} />
            <button type="submit" className="test-btn test-btn-success" disabled={loading}>{loading ? "Tamamlanıyor..." : "Maçı Tamamla"}</button>
          </form>
          <small>Maç "oynanıyor" durumunda olmalıdır</small>
        </div>

        <div className="test-card">
          <h3>ℹ️ Test Bilgileri</h3>
          <div className="test-info-box">
            <p><strong>Kullanıcı ID:</strong> <code>{user?.uid}</code></p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Durum Makinesi:</strong></p>
            <ul>
              <li>beklemede → oynanıyor</li>
              <li>beklemede → iptal</li>
              <li>oynanıyor → tamamlandı</li>
              <li>oynanıyor → iptal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
