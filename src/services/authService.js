import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase"; // Az önce kurduğumuz bağlantı

// 1. KULLANICI KAYIT OLMA (REGISTER) FONKSİYONU
export const registerUser = async (email, password, username, riotId) => {
  try {
    // Adım 1: Firebase Auth ile kullanıcıyı oluştur
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Adım 2: Firestore'da 'users' koleksiyonuna profili kaydet
    // Kullanıcının benzersiz ID'sini (uid) doküman adı olarak kullanıyoruz
    await setDoc(doc(db, "users", user.uid), {
      user_id: user.uid,
      kullanici_adi: username,
      e_posta: email,
      riot_id: riotId || "", // Riot ID girilmemişse boş bırak
      kayit_tarihi: serverTimestamp(),
      rol: "user"
    });

    // Adım 3: Kayıt olan kullanıcıya anında boş bir cüzdan (wallet) oluştur
    // Kolay bulunması için cüzdan ID'sini de kullanıcının UID'si ile aynı yapıyoruz
    await setDoc(doc(db, "wallets", user.uid), {
      wallet_id: user.uid,
      user_id: user.uid,
      guncel_kredi: 0,
      bloke_kredi: 0,
      son_islem_tarihi: serverTimestamp()
    });

    return user; // İşlem başarılıysa kullanıcı bilgisini döndür
  } catch (error) {
    console.error("Kayıt Hatası:", error.message);
    throw error; // Hatayı arayüze fırlat ki kullanıcıya "Şifre çok kısa" vb. uyarı verebilelim
  }
};

// 2. KULLANICI GİRİŞ YAPMA (LOGIN) FONKSİYONU
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Giriş Hatası:", error.message);
    throw error;
  }
};

// 3. ÇIKIŞ YAPMA (LOGOUT) FONKSİYONU
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Çıkış Hatası:", error.message);
    throw error;
  }
};