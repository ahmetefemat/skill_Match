import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// Função para traduzir erros do Firebase
export const translateFirebaseError = (error) => {
  const errorMap = {
    'auth/invalid-credential': 'E-posta ou senha incorreta!',
    'auth/user-not-found': 'Este e-mail não está registrado!',
    'auth/wrong-password': 'E-posta ou senha incorreta!',
    'auth/email-already-in-use': 'Este e-mail já está registrado!',
    'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres)',
    'auth/invalid-email': 'E-mail inválido!',
    'auth/operation-not-allowed': 'Esta operação está desabilitada. Contate o administrador.',
    'auth/invalid-api-key': 'Erro na configuração do servidor. Contate o administrador.',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    'auth/user-disabled': 'Esta conta foi desabilitada. Contate o administrador.',
  };

  return errorMap[error.code] || error.message || 'Erro desconhecido!';
};

// KAYIT OLMA FONKSİYONU
export const registerUser = async (email, password, username, riotId) => {
  try {
    // Email ve şifre validasyonu
    if (!email || !password || !username) {
      throw new Error("E-posta, şifre e nome de usuário são obrigatórios!");
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Formato de e-mail inválido!");
    }

    console.log("📝 Iniciando registro para:", email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("✅ Registro bem-sucedido, UID:", user.uid);

    // Adım 2: Users koleksiyonuna döküman oluştur
    await setDoc(doc(db, "users", user.uid), {
      user_id: user.uid,
      kullanici_adi: username,
      riot_id: riotId || username,
      e_posta: email,
      rol: "user",
      kayit_tarihi: serverTimestamp(),
      rank: "Unranked",
      level: 1,
      tier: "Standard",
      bio: "",
      last_active: "Just now",
      achievements: [],
      stats: {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        currentStreak: 0,
        longestWinStreak: 0,
        averagePerformanceRating: 0,
        averageScore: 0,
        averageKills: 0,
        averageDeaths: 0,
        averageAssists: 0,
      },
    });
    console.log("✅ Dados do usuário salvos!");

    // Adım 3: Wallets koleksiyonuna (cüzdan) döküman oluştur
    await setDoc(doc(db, "wallets", user.uid), {
      user_id: user.uid,
      guncel_kredi: 0,
      son_islem_tarihi: serverTimestamp()
    });
    console.log("✅ Carteira criada!");

    return { success: true, user };
  } catch (error) {
    console.error("❌ Erro no registro:", error.code, error.message);
    throw error;
  }
};

// GİRİŞ YAPMA FONKSİYONU
export const loginUser = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error("E-posta e senha são obrigatórios!");
    }

    console.log("📝 Tentando fazer login para:", email);
    console.log("🔐 Configuração do Firebase:", {
      projectId: auth?.app?.options?.projectId,
      authDomain: auth?.app?.options?.authDomain
    });

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Login bem-sucedido:", userCredential.user.uid);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("❌ Erro de login:", error.code, error.message);
    console.error("📋 Detalhes completos:", error);
    throw error;
  }
};

// ÇIKIŞ YAPMA
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("Çıkış başarılı");
  } catch (error) {
    console.error("Çıkış hatası:", error);
    throw error;
  }
};