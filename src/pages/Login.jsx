import { useState } from "react";
import { registerUser, loginUser } from "../services/authService";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false); // Kayıt modunda başla
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [riotId, setRiotId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        await registerUser(email, password, username, riotId);
        alert("🎉 Kayıt Başarılı!");
        // Kayıttan sonra da cüzdana gitsin istersen buraya da ekleyebilirsin
        window.location.href = "/wallet-test"; 
      } else {
        await loginUser(email, password);
        // alert("✅ Giriş Başarılı!"); // İstersen bunu kaldırabilirsin, direkt yönlendirsin
        
        // --- İŞTE BU SATIR SAYFAYI DEĞİŞTİRECEK ---
        window.location.href = "/wallet-test"; 
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">
          {isRegister ? "SkillMatch - Kayıt Testi" : "SkillMatch - Giriş Testi"}
        </h2>

        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Sadece Kayıt modundayken görünecek alanlar */}
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="Kullanıcı Adı"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Riot ID (Opsiyonel)"
                value={riotId}
                onChange={(e) => setRiotId(e.target.value)}
                className="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}

          {/* Her iki modda da görünecek alanlar */}
          <input
            type="email"
            placeholder="E-Posta Adresi"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Şifre (En az 6 haneli)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition duration-200 mt-2"
          >
            {isRegister ? "Kayıt Ol ve Veritabanını Oluştur" : "Giriş Yap"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {isRegister ? "Zaten hesabın var mı?" : "Henüz hesabın yok mu?"}{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-400 hover:text-blue-300 font-bold underline"
          >
            {isRegister ? "Giriş Yap" : "Kayıt Ol"}
          </button>
        </div>
      </div>
    </div>
  );
}