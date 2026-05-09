import xIcon from "../assets/landing/x.png";
import instagramIcon from "../assets/landing/instagram.png";
import youtubeIcon from "../assets/landing/youtube.png";
import BrandLogo from "./BrandLogo.jsx";

export default function Footer({ id = "footer" } = {}) {
	return (
		<footer className="landing-footer" id={id}>
			<div className="landing-container">
				<div className="footer-top">
					<div className="footer-brand">
						<BrandLogo variant="footer" className="footer-brandRow" />
						<p className="footer-tagline">Bet on your skill. Win with performance.</p>
						<div className="footer-social" aria-label="Social links">
							{/* TODO: Replace with real SkillMatch social media links */}
							<a
								className="footer-socialBtn"
								href="#"
								target="_blank"
								rel="noopener noreferrer"
								onClick={() => console.log("Clicked: Social - X")}
							>
								<img className="footer-socialIcon" src={xIcon} alt="X" />
							</a>
							<a
								className="footer-socialBtn"
								href="#"
								target="_blank"
								rel="noopener noreferrer"
								onClick={() => console.log("Clicked: Social - Instagram")}
							>
								<img className="footer-socialIcon" src={instagramIcon} alt="Instagram" />
							</a>
							<a
								className="footer-socialBtn"
								href="#"
								target="_blank"
								rel="noopener noreferrer"
								onClick={() => console.log("Clicked: Social - YouTube")}
							>
								<img className="footer-socialIcon" src={youtubeIcon} alt="YouTube" />
							</a>
						</div>
					</div>

					<div className="footer-cols">
						<div className="footer-col">
							<h3>Platform</h3>
							<a href="#games">Nasıl Çalışır?</a>
							<a href="#features">Özellikler</a>
							<a href="#stats">İstatistikler</a>
						</div>
						<div className="footer-col">
							<h3>Oyunlar</h3>
							<a href="#games">League of Legends</a>
							<a href="#games">Valorant</a>
							<a href="#games">Counter-Strike 2</a>
						</div>
						<div className="footer-col">
							<h3>Destek</h3>
							{/* TODO: Replace with real routes/pages */}
							<a
								href="#"
								onClick={(e) => {
									e.preventDefault();
									console.log("Clicked: Yardım Merkezi");
								}}
							>
								Yardım Merkezi
							</a>
							<a
								href="#"
								onClick={(e) => {
									e.preventDefault();
									console.log("Clicked: İletişim");
								}}
							>
								İletişim
							</a>
							<a
								href="#"
								onClick={(e) => {
									e.preventDefault();
									console.log("Clicked: Kurallar");
								}}
							>
								Kurallar
							</a>
						</div>
						<div className="footer-col">
							<h3>Yasal</h3>
							{/* TODO: Replace with real routes/pages */}
							<a
								href="#"
								onClick={(e) => {
									e.preventDefault();
									console.log("Clicked: Kullanım Şartları");
								}}
							>
								Kullanım Şartları
							</a>
							<a
								href="#"
								onClick={(e) => {
									e.preventDefault();
									console.log("Clicked: Gizlilik Politikası");
								}}
							>
								Gizlilik Politikası
							</a>
						</div>
					</div>
				</div>

				<div className="footer-bottom">© 2024 SkillMatch. Tüm hakları saklıdır.</div>
			</div>
		</footer>
	);
}
