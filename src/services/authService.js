import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// KAYIT OLMA FONKSİYONU
export const registerUser = async (email, password, username, riotId) => {
  try {
    // Adım 1: Auth kısmına kullanıcıyı ekle
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Auth kaydı başarılı, UID:", user.uid);

    // Adım 2: Users koleksiyonuna döküman oluştur
    await setDoc(doc(db, "users", user.uid), {
      user_id: user.uid,
      kullanici_adi: username,
      riot_id: riotId,
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
    console.log("Users koleksiyonuna yazıldı!");

    // Adım 3: Wallets koleksiyonuna (cüzdan) döküman oluştur
    await setDoc(doc(db, "wallets", user.uid), {
      user_id: user.uid,
      guncel_kredi: 0,
      son_islem_tarihi: serverTimestamp()
    });
    console.log("Wallets koleksiyonuna yazıldı!");

    return { success: true, user };
  } catch (error) {
    console.error("Kayıt sırasında hata oluştu:", error.code, error.message);
    throw error;
  }
};

// GİRİŞ YAPMA FONKSİYONU
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return { success: true, user: userCredential.user };
};

// ÇIKIŞ YAPMA
export const logoutUser = async () => {
  await signOut(auth);
  window.location.href = "/";
};