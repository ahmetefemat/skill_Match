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
      kayit_tarihi: serverTimestamp()
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
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    throw error;
  }
};

// ÇIKIŞ YAPMA
export const logoutUser = async () => {
  await signOut(auth);
  window.location.href = "/";
};