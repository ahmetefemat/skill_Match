import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from "../services/authService";
import './Login.css';

// YENİ EKLENEN KISIM: Efsanevi görseli buraya çekiyoruz
import bgImage from '../assets/crossover-bg.jpg'; 

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
        
        // AHMET İÇİN NOT: backend'e username ve birthDate de gönderilebilir.
        await registerUser(email, password, username);
        navigate('/lobby');
      } else {
        await loginUser(email, password);
        navigate('/lobby');
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
          <div className="logo-box"><span>S</span></div>
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
          
          {/* ORTAK ALANLAR (Giriş ve Kayıt) */}
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

          {/* SADECE KAYIT MODUNDA GÖRÜNECEK ALANLAR */}
          {activeTab === 'register' && (
            <>
              <div className="input-group">
                <label className="input-label">Şifre Tekrar</label>
                <input 
                  type="password" 
                  required
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
                  required
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
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="neon-input"
                />
              </div>
            </>
          )}

          <button type="submit" className="neon-btn">
            {activeTab === 'login' ? 'Giriş Yap' : 'Kayıt İşlemini Tamamla'}
          </button>
        </form>

        <div className="divider">veya şununla devam et</div>

        {/* SOSYAL MEDYA BUTONLARI */}
        <div className="social-logins">
          
          <button type="button" className="social-btn">
            <svg className="riot-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
            Riot Games ile Giriş Yap
          </button>

          <button type="button" className="social-btn">
            <svg className="steam-icon" viewBox="0 0 24 24">
              <path d="M11.979 0C5.363 0 0 5.36 0 11.979c0 4.673 2.673 8.71 6.556 10.74l3.197-4.636c-.161-.318-.255-.678-.255-1.06 0-1.285 1.042-2.327 2.328-2.327.135 0 .267.012.396.034l3.397-4.93v-.45c0-2.348 1.905-4.253 4.253-4.253 2.348 0 4.253 1.905 4.253 4.253 0 2.348-1.905 4.253-4.253 4.253-1.63 0-3.04-.925-3.743-2.261l-5.11 1.488c.036.14.056.285.056.435 0 1.285-1.042 2.327-2.327 2.327-1.127 0-2.062-.8-2.278-1.874l-3.324 4.825C6.155 23.364 8.948 24 11.98 24 18.614 24 24 18.636 24 12c0-6.618-5.385-11.979-12.021-12z"/>
            </svg>
            Steam ile Giriş Yap
          </button>

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