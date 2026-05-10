import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate} from "react-router-dom";
import "./AppNavbar.css";
import BrandLogo from "./BrandLogo.jsx";

const NAV_ITEMS = [
  { label: "Lobby", to: "/lobby" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Profile", to: "/profile" },
];

const getInitial = (value) => {
  if (!value) return "U";
  return String(value).trim()?.[0]?.toUpperCase() || "U";
};

export default function AppNavbar({ balance, username, avatarUrl }) {
  const location = useLocation();
  const navigate = useNavigate(); // BURAYA EKLENDİ
  const activePath = location?.pathname || "";

  // --- YENİ EKLENEN MODAL STATE VE FONKSİYONLARI ---
  const [infoModal, setInfoModal] = useState({ isOpen: false, type: "" });

  const getModalContent = () => {
    switch (infoModal.type) {
      case "nasil":
        return {
          title: "Nasıl Çalışır?",
          text: "SkillMatch, espor tutkunlarını adil ve rekabetçi bir ortamda buluşturur. Hesabını bağla, bakiye yükle, hedefini seç ve lobideki açık iddialara katıl. Kazanan hesabı sistem otomatik doğrular ve ödülü anında cüzdanına yansıtır!",
        };
      case "ozellikler":
        return {
          title: "Özellikler",
          text: "Sıfır hile toleransı, anında bakiye transferi, Riot Games & Steam API entegrasyonu ile otomatik maç sonucu onayı ve sadece yeteneğe dayalı eşleştirme sistemi.",
        };
      case "destek":
        return {
          title: "Destek Merkezi",
          text: "Bir sorun mu yaşıyorsun? Arena kuralları, bakiye işlemleri veya itirazlar için 7/24 Discord sunucumuz üzerinden veya destek@skillmatch.com adresinden bize ulaşabilirsin.",
        };
      default:
        return { title: "", text: "" };
    }
  };

  const modalData = getModalContent();
  // ------------------------------------------------

  const balanceText = useMemo(() => {
    // TODO: Integrate real-time balance from Firebase/wallet service via parent page state.
    if (typeof balance === "number" && Number.isFinite(balance)) {
      return `₺${balance.toLocaleString()}`;
    }
    return "₺250";
  }, [balance]);

  return (
    <header className="appNavbar" role="banner">
      <div className="landing-container appNavbar-inner">
        <div className="appNavbar-left">
          <BrandLogo variant="navbar" className="appNavbar-brand" />
        </div>

        <nav className="appNavbar-center" aria-label="Primary">
          {/* ANA SAYFADAYSA BİLGİ LİNKLERİ, DEĞİLSE NORMAL MENÜ ÇALIŞACAK */}
          {activePath === "/" ? (
            <>
              <a href="#" className="appNavbar-link" onClick={(e) => { e.preventDefault(); setInfoModal({ isOpen: true, type: 'nasil' }); }}>Nasıl Çalışır?</a>
              <a href="#" className="appNavbar-link" onClick={(e) => { e.preventDefault(); setInfoModal({ isOpen: true, type: 'ozellikler' }); }}>Özellikler</a>
              <a href="#" className="appNavbar-link" onClick={(e) => { e.preventDefault(); setInfoModal({ isOpen: true, type: 'destek' }); }}>Destek</a>
            </>
          ) : (
            NAV_ITEMS.map((item) => {
              const isActive = activePath === item.to;

              if (isActive) {
                return (
                  <span
                    key={item.to}
                    className="appNavbar-link isActive"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                );
              }

              return (
                <Link key={item.to} className="appNavbar-link" to={item.to}>
                  {item.label}
                </Link>
              );
            })
          )}
        </nav>

        <div className="appNavbar-right">
  {/* ANA SAYFAYA DÖN BUTONU SADECE DİĞER SAYFALARDA GÖZÜKSÜN */}
  {activePath !== "/" && (
    <Link to="/" className="appNavbar-backLink">
      <span className="back-arrow">←</span> Ana Sayfa
    </Link>
  )}

  {/* TEK VE TERTEMİZ JİLET BUTON (Kutu içinde kutu yok) */}
 {/* AppNavbar.jsx içindeki bakiye butonunun güncel hali */}
{/* TEK VE TERTEMİZ JİLET BUTON */}
<button 
  className="appNavbar-balanceActionBtn" 
  onClick={() => navigate('/lobby', { state: { openWallet: true } })} 
>
  <div className="appNavbar-balanceInfo">
    <span className="appNavbar-balanceLabel">BAKİYE</span>
    <span className="appNavbar-balanceValue">{balanceText}</span>
  </div>
  
  <div className="appNavbar-plusBadge">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  </div>
</button>

          {activePath === "/profile" ? (
            <div className="appNavbar-user isActive" aria-label="User profile">
              <div className="appNavbar-avatar" aria-hidden="true">
                {avatarUrl ? (
                  <img className="appNavbar-avatarImg" src={avatarUrl} alt="" />
                ) : (
                  <span className="appNavbar-avatarInitial">{getInitial(username)}</span>
                )}
              </div>
              <span className="appNavbar-username">{username || "Player"}</span>
            </div>
          ) : (
            <Link className="appNavbar-user" to="/profile" aria-label="Go to profile">
              <div className="appNavbar-avatar" aria-hidden="true">
                {avatarUrl ? (
                  <img className="appNavbar-avatarImg" src={avatarUrl} alt="" />
                ) : (
                  <span className="appNavbar-avatarInitial">{getInitial(username)}</span>
                )}
              </div>
              <span className="appNavbar-username">{username || "Player"}</span>
            </Link>
          )}
        </div>
      </div>

      {/* MODAL KISMI (EN ÜSTTE ÇIKACAK KARANLIK PENCERE) */}
      {infoModal.isOpen && (
        <div className="nav-modal-overlay" onClick={() => setInfoModal({ isOpen: false, type: '' })}>
          <div className="nav-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="nav-modal-close" onClick={() => setInfoModal({ isOpen: false, type: '' })}>×</button>
            <h2>{modalData.title}</h2>
            <div className="nav-modal-body">
              <p>{modalData.text}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}