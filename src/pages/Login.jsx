import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser, translateFirebaseError } from "../services/authService";
import './Login.css';

// Görsellerimiz
import bgImage from '../assets/crossover-bg.jpg'; 
import BrandLogo from "../components/BrandLogo.jsx";
import riotIcon from '../assets/landing/riot.png'; 
import steamIcon from '../assets/landing/steam.png'; 

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  
  // Ortak Alanlar
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Sadece Kayıt İçin Ekstra Alanlar
  const [passwordConfirm, setPasswordConfirm] = useState(''); // Şifre Tekrar
  const [birthDate, setBirthDate] = useState(''); // Doğum Tarihi
  const [username, setUsername] = useState(''); 
  const [error, setError] = useState('');

  // Firebase'in düzgün yüklendiğini kontrol et
  useEffect(() => {
    try {
      // Firebase modülünü test et
      const testFirebase = async () => {
        const { auth } = await import("../services/firebase.js");
        if (!auth) {
          console.error("⚠️ Firebase Auth başlatılamadı!");
          setError("Sistem yapılandırması hatalı. Lütfen yöneticiyle iletişim kurun.");
        } else {
          console.log("✅ Firebase Auth başarıyla yüklendi");
        }
      };
      testFirebase();
    } catch (err) {
      console.error("Firebase yükleme hatası:", err);
      setError("Sistem yapılandırması hatalı.");
    }
  }, []); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 

    try {
      if (activeTab === 'register') {
        // Şifre eşleşme kontrolü
        if (password !== passwordConfirm) {
          setError("Şifreler birbiriyle eşleşmiyor!");
          return;
        }

        // Şifre uzunluğu kontrolü
        if (password.length < 6) {
          setError("Şifre en az 6 karakter olmalıdır!");
          return;
        }

        if (!username.trim()) {
          setError("Kullanıcı adı boş olamaz!");
          return;
        }
        
        // Kayıt işlemi - username'i riot_id olarak da geç
        await registerUser(email, password, username, username);
        
        // BAŞARILI: Landing (Ana Sayfa) rotasına fırlat
        navigate('/'); 
      } else {
        // Email ve şifre kontrolü
        if (!email.trim()) {
          setError("E-posta adresini giriniz!");
          return;
        }

        if (!password.trim()) {
          setError("Şifrenizi giriniz!");
          return;
        }

        // Giriş işlemi
        await loginUser(email, password);
        
        // BAŞARILI: Landing (Ana Sayfa) rotasına fırlat
        navigate('/'); 
      }
    } catch (err) {
      // Usar a função de tradução de erros
      const userMessage = translateFirebaseError(err);
      
      console.error("❌ Erro de autenticação:", {
        code: err.code,
        message: err.message,
        userMessage: userMessage
      });
      console.error("📋 Erro completo:", err);
      
      setError(userMessage);
    }
  };

  return (
    <div className="login-wrapper">
      {/* YENİ EKLENEN KISIM: Arka Plan Görseli (Eğer resim yoksa çökmeyi önlemek için check eklendi) */}
      {bgImage ? (
        <img src={bgImage} alt="SkillMatch Heroes" className="login-bg-image" />
      ) : (
        <>
          {/* Eğer resim bulunamazsa eski parlamalar devreye girsin (Yedek Plan) */}
          <div className="glow-cyan"></div>
          <div className="glow-emerald"></div>
        </>
      )}

      {/* Merkezi Dar Kutu (Sağa Yaslı) */}
      <div className="glass-card">
        
      <div className="brand-header">
        <BrandLogo variant="login" />
        </div>

        <div className="tabs-container">
          <button 
            type="button" 
            onClick={() => { setActiveTab('login'); setError(''); }} 
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
          >
            Giriş Yap
            {activeTab === 'login' && <span className="tab-indicator"></span>}
          </button>
          
          <button 
            type="button" 
            onClick={() => { setActiveTab('register'); setError(''); }} 
            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
          >
            Kayıt Ol
            {activeTab === 'register' && <span className="tab-indicator"></span>}
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
  {/* 1. SATIR: E-POSTA VE ŞİFRE (HER ZAMAN YAN YANA) */}
  <div className="form-horizontal-row">
    <div className="input-group">
      <label className="input-label">E-posta Adresi</label>
      <input 
        type="email" 
        required 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        className="neon-input" 
        placeholder="oyuncu@skillmatch.gg" 
      />
    </div>

    <div className="input-group">
      <label className="input-label">Şifre</label>
      <input 
        type="password" 
        required 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        className="neon-input" 
        placeholder="••••••••" 
      />
    </div>
  </div>

  {/* KAYIT OL AÇILIR ALANI (Şifre Tekrar Kalktı, Diğer İkisi Yan Yana) */}
  <div className={`register-fields-wrapper ${activeTab === 'register' ? 'is-open' : ''}`}>
    <div className="form-horizontal-row">
      <div className="input-group">
        <label className="input-label">Kullanıcı Adı (Riot/Steam ID)</label>
        <input 
          type="text" 
          required={activeTab === 'register'} 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          className="neon-input" 
          placeholder="NickName#TR1" 
        />
      </div>

      <div className="input-group">
        <label className="input-label">Doğum Tarihi</label>
        <input 
          type="date" 
          required={activeTab === 'register'} 
          value={birthDate} 
          onChange={(e) => setBirthDate(e.target.value)} 
          className="neon-input" 
        />
      </div>
    </div>
  </div>

  <button type="submit" className="neon-btn" style={{ marginTop: '20px' }}>
    {activeTab === 'login' ? 'Giriş Yap' : 'Kayıt İşlemini Tamamla'}
  </button>
</form>
        <div className="divider">veya şununla devam et</div>

        {/* SOSYAL MEDYA BUTONLARI */}
        <div className="social-logins-row">
  <button type="button" className="social-square-btn" title="Riot Games">
    <img src={riotIcon} alt="Riot" className="social-img-icon" />
  </button>

  <button type="button" className="social-square-btn" title="Steam">
    <img src={steamIcon} alt="Steam" className="social-img-icon" />
  </button>

  <button type="button" className="social-square-btn" title="Google">
    <svg className="google-icon" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  </button>
</div>
      </div>
    </div>
  );
};

export default Login;