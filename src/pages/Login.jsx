import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from "../services/authService";
import './Login.css';

// Görsellerimiz
import bgImage from '../assets/crossover-bg.jpg'; 
import logo from '../assets/logo.svg';
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
        
        // Kayıt işlemi (Ahmet Efe'nin servisi)
        await registerUser(email, password, username);
        
        // BAŞARILI: Lobi yerine Landing (Ana Sayfa) rotasına fırlat
        navigate('/'); 
      } else {
        // Giriş işlemi (Ahmet Efe'nin servisi)
        await loginUser(email, password);
        
        // BAŞARILI: Lobi yerine Landing (Ana Sayfa) rotasına fırlat
        navigate('/'); 
      }
    } catch (err) {
      setError(err.message);
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
          <img src={logo} alt="SkillMatch Logo" className="brand-logo" />
          <h1 className="brand-title">SkillMatch</h1>
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
          
          {/* HER ZAMAN GÖRÜNEN ORTAK ALANLAR */}
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

          {/* YAĞ GİBİ AÇILIP KAPANAN KAYIT ALANLARI */}
          <div className={`register-fields-wrapper ${activeTab === 'register' ? 'is-open' : ''}`}>
            {/* Wrapper içine ekstra div koymuyoruz, doğrudan inputlar */}
            <div className="input-group">
              <label className="input-label">Şifre Tekrar</label>
              <input 
                type="password" 
                required={activeTab === 'register'}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="neon-input"
                placeholder="••••••••"
              />
            </div>

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

          <button type="submit" className="neon-btn">
            {activeTab === 'login' ? 'Giriş Yap' : 'Kayıt İşlemini Tamamla'}
          </button>
        </form>

        <div className="divider">veya şununla devam et</div>

        {/* SOSYAL MEDYA BUTONLARI */}
        <div className="social-logins">
          
          <button type="button" className="social-btn">
            <img src={riotIcon} alt="Riot Games" className="social-img-icon" />
            Riot Games ile Giriş Yap
          </button>

          <button type="button" className="social-btn">
            <img src={steamIcon} alt="Steam" className="social-img-icon" />
            Steam ile Giriş Yap
          </button>

          {/* Google şimdilik orijinal SVG'siyle kalabilir, en sorunsuz o çalışır */}
          <button type="button" className="social-btn">
            <svg className="google-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google ile Giriş Yap
          </button>

        
        </div>
      </div>
    </div>
  );
};

export default Login;