import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import "./Landing.css";

import lolImg from "../assets/landing/lol.png";
import valorantImg from "../assets/landing/valorant.png";
import cs2Img from "../assets/landing/cs2.png";
import poppyImg from "../assets/landing/lol-poppy.png";
import Footer from "../components/Footer.jsx";
import BrandLogo from "../components/BrandLogo.jsx";

const FeatureIcon = ({ type }) => {
	const common = {
		className: "landing-icon",
		viewBox: "0 0 24 24",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
	};

	switch (type) {
		case "trophy":
			return (
				<svg {...common}>
					<path
						d="M7 4h10v3c0 3.866-3.134 7-7 7H9c-3.314 0-6-2.686-6-6V7h4V4Z"
						stroke="currentColor"
						strokeWidth="1.8"
						opacity="0.95"
					/>
					<path
						d="M17 7h4v1c0 2.209-1.791 4-4 4"
						stroke="currentColor"
						strokeWidth="1.8"
						opacity="0.95"
					/>
					<path
						d="M3 7v1c0 2.209 1.791 4 4 4"
						stroke="currentColor"
						strokeWidth="1.8"
						opacity="0.95"
					/>
					<path
						d="M12 14v4m0 0H8m4 0h4"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
					/>
				</svg>
			);
		case "shield":
			return (
				<svg {...common}>
					<path
						d="M12 3.5 19 6.7v6.3c0 4.2-3 7.9-7 9.5-4-1.6-7-5.3-7-9.5V6.7L12 3.5Z"
						stroke="currentColor"
						strokeWidth="1.8"
						opacity="0.95"
					/>
					<path
						d="m9.2 12 1.8 1.8 3.9-4.1"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);
		case "bolt":
			return (
				<svg {...common}>
					<path
						d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinejoin="round"
						opacity="0.95"
					/>
				</svg>
			);
		case "chart":
			return (
				<svg {...common}>
					<path
						d="M4 19V5m0 14h16"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
					/>
					<path
						d="M7.5 15.5v-4m4 4v-7m4 7v-10"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
					/>
				</svg>
			);
		case "users":
			return (
				<svg {...common}>
					<path
						d="M7.6 21v-1.2c0-1.75 1.42-3.18 3.18-3.18h2.44c1.76 0 3.18 1.43 3.18 3.18V21"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
					/>
					<path
						d="M12 13.8a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Z"
						stroke="currentColor"
						strokeWidth="1.8"
						opacity="0.95"
					/>
					<path
						d="M18.7 21v-1c0-1.27-.77-2.37-1.88-2.84"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
						opacity="0.75"
					/>
					<path
						d="M15.9 7.55a2.8 2.8 0 0 1 0 5.6"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
						opacity="0.75"
					/>
				</svg>
			);
		case "wallet":
			return (
				<svg {...common}>
					<path
						d="M6.5 7.8V6.6c0-1.25.3-1.85.77-2.26.47-.41 1.11-.54 2.35-.54h4.86c1.24 0 1.88.13 2.35.54.47.41.77 1.01.77 2.26v1.2"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
						opacity="0.9"
					/>
					<path
						d="M4.8 8.6h14.4c.99 0 1.8.81 1.8 1.8v7.2c0 .99-.81 1.8-1.8 1.8H4.8c-.99 0-1.8-.81-1.8-1.8v-7.2c0-.99.81-1.8 1.8-1.8Z"
						stroke="currentColor"
						strokeWidth="1.8"
						opacity="0.95"
						strokeLinejoin="round"
					/>
					<path
						d="M15.7 12.2h5v4.6h-5c-1.27 0-2.3-1.03-2.3-2.3 0-1.27 1.03-2.3 2.3-2.3Z"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinejoin="round"
					/>
				</svg>
			);
		default:
			return null;
	}
};

const games = [
	{
		key: "lol",
		name: "League of Legends",
		mode: "Ranked Solo/Duo  •  Esnek  •  Clash",
		logo: "LEAGUE OF\nLEGENDS",
		badge: "Aktif",
		media: lolImg,
		mediaPos: "25% 35%",
		hue: "210deg",
		accent: "#00f5d4",
	},
	{
		key: "valorant",
		name: "Valorant",
		mode: "Rekabetçi  •  Derecesiz  •  Spike Rush",
		logo: "VALORANT",
		badge: "Aktif",
		media: valorantImg,
		mediaPos: "55% 35%",
		hue: "330deg",
		accent: "#00f5d4",
	},
	{
		key: "cs2",
		name: "Counter-Strike 2",
		mode: "Premier  •  Rekabetçi  •  Faceit",
		logo: "COUNTER\nSTRIKE 2",
		badge: "Aktif",
		media: cs2Img,
		mediaPos: "75% 40%",
		hue: "30deg",
		accent: "#00f5d4",
	},
];

const features = [
	{
		key: "skill",
		title: "Yetenek Temelli",
		desc: "Şans değil; doğru eşleşme ve yetenek kazandırır.",
		icon: "trophy",
		color: "cyan",
	},
	{
		key: "secure",
		title: "Güvenli & Adil",
		desc: "Sonuçlar doğrulanır, ödüller güvence altındadır.",
		icon: "shield",
		color: "purple",
	},
	{
		key: "fast",
		title: "Hızlı & Kolay",
		desc: "İddiayı oluştur, maçı oyna, sonucunu doğrula.",
		icon: "bolt",
		color: "cyan",
	},
	{
		key: "analytics",
		title: "İstatistik & Analiz",
		desc: "Performansını takip et, kendini geliştir.",
		icon: "chart",
		color: "purple",
	},
];

const stats = [
	{ key: "u", value: "15K+", label: "Aktif Kullanıcı", icon: "users", color: "cyan" },
	{ key: "m", value: "28K+", label: "Tamamlanan İddia", icon: "trophy", color: "purple" },
	{ key: "r", value: "2.5M+", label: "Toplam Ödül", icon: "wallet", color: "cyan" },
	{ key: "f", value: "%99.9", label: "Adil Oyun Oranı", icon: "shield", color: "purple" },
];

export default function Landing() {
    const { user, logout } = useAuth();

	const handleLogout = async (e) => {
		e.preventDefault(); // 1. Sayfanın kendini yenilemesini engeller (Şart)
		
		try {
			if (logout) {
				await logout(); // 2. Arka planda çıkış işlemini yapar
				
				// 3. Çıkış yaptıktan sonra login'e atmasını ezip, burada kalmasını söyleriz
				navigate('/'); 
			}
		} catch (error) {
			console.error("Çıkış işlemi sırasında hata:", error);
		}
	};
    // ---- BİZİM EKLEDİĞİMİZ MODAL MANTIĞI ----
    const [infoModal, setInfoModal] = useState({ isOpen: false, type: "" });

    const getModalContent = () => {
        switch (infoModal.type) {
            case "nasil":
                return { title: "Nasıl Çalışır?", text: "SkillMatch, espor tutkunlarını adil ve rekabetçi bir ortamda buluşturur. Hesabını bağla, bakiye yükle, hedefini seç ve lobideki açık iddialara katıl. Kazanan hesabı sistem otomatik doğrular ve ödülü anında cüzdanına yansıtır!" };
            case "ozellikler":
                return { title: "Özellikler", text: "Sıfır hile toleransı, anında bakiye transferi, Riot Games & Steam API entegrasyonu ile otomatik maç sonucu onayı ve sadece yeteneğe dayalı eşleştirme sistemi." };
            case "destek":
                return { title: "Destek Merkezi", text: "Bir sorun mu yaşıyorsun? Arena kuralları, bakiye işlemleri veya itirazlar için 7/24 Discord sunucumuz üzerinden veya destek@skillmatch.com adresinden bize ulaşabilirsin." };
            default:
                return { title: "", text: "" };
        }
    };
    const modalData = getModalContent();
    // ------------------------------------------

    return (
		<div className="landing">
			{/* Deep layered background */}
			<div className="landing-bg" aria-hidden="true">
				<div className="landing-orb landing-orb--a" />
				<div className="landing-orb landing-orb--b" />
				<div className="landing-orb landing-orb--c" />
				<div className="landing-grid" />
			</div>

			{/* 1) Navbar */}
            <header className="landing-navbar">
                <div className="landing-container landing-navbarInner">
					<BrandLogo variant="landing" />

                    {/* TODO: Replace hash links with real routes (React Router) when ready */}
					<nav className="landing-navLinks" aria-label="Primary">
    <a className="landing-navLink" href="#" onClick={(e) => { e.preventDefault(); setInfoModal({ isOpen: true, type: 'nasil' }); }}>
        Nasıl Çalışır?
    </a>
    <a className="landing-navLink" href="#" onClick={(e) => { e.preventDefault(); setInfoModal({ isOpen: true, type: 'ozellikler' }); }}>
        Özellikler
    </a>
    <a className="landing-navLink" href="#" onClick={(e) => { e.preventDefault(); setInfoModal({ isOpen: true, type: 'destek' }); }}>
        Destek
    </a>
</nav>

					<div className="landing-navActions">
                        {user ? (
                            /* KULLANICI GİRİŞ YAPMIŞSA LOBİ BUTONU VE USER CONTROLS */
                            <div className="landing-user-controls">
                                
                                {/* WELCOME MESSAGE */}
                                <div className="landing-welcome-badge">
                                    <span className="landing-welcome-greeting">Hoşgeldin,</span>
                                    <span className="landing-welcome-name">
                                        {user.displayName || (user.email ? user.email.split('@')[0] : 'Şampiyon')}
                                    </span>
                                </div>

                                {/* LOBİYE GİT BUTONU */}
                                <Link 
                                    to="/lobby" 
                                    className="landing-btn landing-btn--solid"
                                >
                                    Arena'ya Gir
                                </Link>
                                
                                {/* ÇIKIŞ BUTONU */}
                                <button 
                                    onClick={handleLogout} 
                                    className="landing-btn landing-btn--logout" 
                                >
                                    Çıkış
                                </button>
                            </div>
                        ) : (
                            /* GİRİŞ YAPMAMIŞSA NORMAL BUTONLAR */
                            <>
                                <Link className="landing-btn landing-btn--ghost" to="/login">
                                    Giriş Yap
                                </Link>
                                <Link className="landing-btn landing-btn--solid" to="/login">
                                    Hesap Oluştur
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

			<main>
				{/* 2) Hero */}
				<section className="landing-hero" id="top">
					<div className="landing-container">
						<div className="hero-shell">
							<div className="hero-bg" aria-hidden="true">
								<div className="hero-slice hero-slice--left" />
								<div className="hero-slice hero-slice--right" />
							</div>

							<div className="hero-content">
								<div className="hero-badge">
									<span className="hero-badgeDot" />
									<span>BET ON YOUR SKILL</span>
								</div>

								<h1 className="hero-title">
									YETENEĞİNLE <span className="hero-gradient">KAZAN</span>
								</h1>

								<p className="hero-subtitle">
									SkillMatch ile oyun becerini kanıtla, iddia oluştur, rakiplerini yen ve
									ödülleri kazan!
								</p>

								<div className="hero-actions">
									<Link className="landing-btn landing-btn--primary" to="/login">
										Hesap Oluştur <span aria-hidden="true">→</span>
									</Link>
									<Link className="landing-btn landing-btn--outline" to="/login">
										Giriş Yap <span aria-hidden="true">→</span>
									</Link>
								</div>

								<div className="hero-trust">
									<span className="hero-trustIcon" aria-hidden="true">
										<FeatureIcon type="shield" />
									</span>
									<span>Güvenli</span>
									<span className="hero-dot">•</span>
									<span>Hızlı</span>
									<span className="hero-dot">•</span>
									<span>Adil</span>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* 3) Supported games */}
				<section className="landing-section" id="games">
					<div className="landing-container">
						<div className="section-panel">
							<p className="section-kicker">DESTEKLENEN OYUNLAR</p>
							<h2 className="section-title">En Popüler Oyunlarda İddia Oluştur</h2>
							<p className="section-subtitle">
								Favori oyununu seç, yeteneğini göster ve kazanmaya başla.
							</p>

							<div className="games-grid">
								{games.map((g) => (
									<article
										key={g.key}
										className={`gameCard gameCard--${g.key}`}
										style={{
											"--media": `url(${g.media})`,
											"--mediaPos": g.mediaPos,
											"--mediaHue": g.hue,
											"--accent": g.accent,
										}}
									>
										<div className="gameCardMedia" aria-hidden="true" />

										<div className="gameCardBody">
											<div className="gameCardTop">
												<h3 className="gameCardName">{g.name}</h3>
												<span className="gameCardStatus">{g.badge}</span>
											</div>
											<p className="gameCardMode">{g.mode}</p>
												{/* TODO: Replace with real wager creation flow */}
											<button
												className="gameCardAction"
												type="button"
												onClick={() => console.log(`Clicked: İddia Oluştur (${g.name})`)}
											>
												İddia Oluştur <span aria-hidden="true">→</span>
											</button>
										</div>
									</article>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* 4) Features */}
				<section className="landing-section" id="features">
					<div className="landing-container">
						<div className="features-layout">
							<div className="features-copy">
								<h2 className="features-title">
									Neden <span className="features-accent">SkillMatch</span>?
								</h2>
								<p className="features-desc">
									Adil, güvenli ve rekabetçi bir ortamda yeteneğini sergile. İddialarını
									oluştur, eşleş, kazan.
								</p>
							</div>

							<div className="features-grid">
								{features.map((f) => (
									<article
										key={f.key}
										className={`featureCard featureCard--${f.color}`}
									>
										<div className="featureIcon" aria-hidden="true">
											<FeatureIcon type={f.icon} />
										</div>
										<h3 className="featureTitle">{f.title}</h3>
										<p className="featureDesc">{f.desc}</p>
									</article>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* 5) Stats strip */}
				<section className="landing-section" id="stats">
					<div className="landing-container">
						<div className="stats-strip" role="list">
							{stats.map((s) => (
								<div key={s.key} className={`stat stat--${s.color}`} role="listitem">
									<div className={`statIcon statIcon--${s.color}`} aria-hidden="true">
										<FeatureIcon type={s.icon} />
									</div>
									<div className="statText">
										<div className="statValue">{s.value}</div>
										<div className="statLabel">{s.label}</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* 6) Final CTA banner */}
				<section className="landing-section">
					<div className="landing-container">
						<div className="cta-banner">
							<div
								className="cta-art"
								aria-hidden="true"
								style={{ "--ctaArt": `url(${poppyImg})` }}
							/>
							<div className="cta-copy">
								<h2 className="cta-title">Hazır mısın? Yeteneğini gösterme zamanı!</h2>
								<p className="cta-desc">Hemen hesap oluştur ve kazanmaya başla.</p>
							</div>
							<Link className="landing-btn landing-btn--primary cta-btn" to="/login">
								Hesap Oluştur <span aria-hidden="true">→</span>
							</Link>
						</div>
					</div>
				</section>
			</main>


			{/* 7) Footer */}
			<Footer />
			{/* BİZİM EFSANE MODAL EKRANI */}
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
            
        </div> /* Bu satır zaten senin dosyanın en sonundaki kapanış div'i, buna dokunma */
    );
}
