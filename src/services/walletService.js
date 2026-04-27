import { db } from "./firebase";
import { 
  doc, 
  updateDoc, 
  increment, 
  collection, 
  addDoc, 
  serverTimestamp, 
  getDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot
} from "firebase/firestore";

// 1. KREDİ YÜKLEME FONKSİYONU
export const addCredit = async (userId, amount) => {
  try {
    const walletRef = doc(db, "wallets", userId);

    // Adım 1: Cüzdan bakiyesini artır
    await updateDoc(walletRef, {
      guncel_kredi: increment(amount),
      son_islem_tarihi: serverTimestamp()
    });

    // Adım 2: İşlem geçmişine (Log) kaydet
    await addDoc(collection(db, "transactions"), {
      user_id: userId,
      tip: "yukleme",
      miktar: amount,
      aciklama: "Kredi Kartı/Havale ile yükleme",
      tarih: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Cüzdan yükleme hatası:", error);
    throw error;
  }
};

// 2. BAKİYE KONTROLÜ (İddiaya girmeden önce çağırılacak)
export const checkBalance = async (userId) => {
  const walletSnap = await getDoc(doc(db, "wallets", userId));
  if (walletSnap.exists()) {
    const data = walletSnap.data();
    return (
      data.guncel_kredi ??
      data.currentBalance ??
      data.balance ??
      data.bakiye ??
      0
    );
  }
  return 0;
};

// 3. BAKİYE DÜŞME / HARCAMA FONKSİYONU (YENİ)
export const deductCredit = async (userId, amount, description = "Lobi Maç Bedeli") => {
  try {
    const walletRef = doc(db, "wallets", userId);
    const walletSnap = await getDoc(walletRef);

    if (!walletSnap.exists()) {
      throw new Error("Cüzdan bulunamadı!");
    }

    const currentBalance = walletSnap.data().guncel_kredi || 0;

    // Güvenlik: Kullanıcının parası yetiyor mu?
    if (currentBalance < amount) {
      throw new Error("Yetersiz bakiye! Bu işlem için cüzdanınızda yeterli kredi bulunmuyor.");
    }

    // Adım 1: Cüzdan bakiyesinden miktarı düş (increment içine eksi değer vererek)
    await updateDoc(walletRef, {
      guncel_kredi: increment(-amount),
      son_islem_tarihi: serverTimestamp()
    });

    // Adım 2: İşlem geçmişine harcama olarak kaydet (miktar eksi yazılır)
    await addDoc(collection(db, "transactions"), {
      user_id: userId,
      tip: "harcama",
      miktar: -amount, 
      aciklama: description,
      tarih: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Bakiye düşme hatası:", error);
    throw error; // Hatayı UI tarafında yakalamak için fırlatıyoruz
  }
};

// 4. KULLANICI TRANSACTIONS SORGULAMA
export const getTransactionHistory = async (userId, limitCount = 10) => {
  try {
    const q = query(
      collection(db, "transactions"),
      where("user_id", "==", userId),
      orderBy("tarih", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const transactions = [];
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });

    return transactions;
  } catch (error) {
    console.error("Transaction geçmişi sorgusu hatası:", error);
    throw error;
  }
};

// 5. KULLANICI TRANSACTIONS DİNLEME (Real-time)
export const listenToUserTransactions = (userId, callback) => {
  const q = query(
    collection(db, "transactions"),
    where("user_id", "==", userId),
    orderBy("tarih", "desc"),
    limit(10)
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const transactions = [];
      querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() });
      });
      callback(transactions, null);
    },
    (error) => {
      console.error("Transaction dinleme hatası:", error);
      callback([], error);
    }
  );

  return unsubscribe;
};