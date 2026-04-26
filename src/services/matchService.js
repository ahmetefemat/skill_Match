import { 
  collection, 
  serverTimestamp, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  runTransaction,
  getDocs,
  orderBy,
  limit
} from "firebase/firestore";

import { db } from "./firebase";

// 1. MAÇ İLANI OLUŞTURMA (ATOMIK TRANSACTION)
export const createMatch = async (userId, gameType, amount, targetGoal) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      // Adım 1: Cüzdan kontrolü ve bakiye düşme
      const walletRef = doc(db, "wallets", userId);
      const walletSnap = await transaction.get(walletRef);

      if (!walletSnap.exists()) {
        throw new Error("Cüzdan bulunamadı!");
      }

      const currentBalance = walletSnap.data().guncel_kredi || 0;
      if (currentBalance < amount) {
        throw new Error("Yetersiz bakiye! Bu işlem için cüzdanınızda yeterli kredi bulunmuyor.");
      }

      // Adım 2: Bakiyeyi güncelle
      transaction.update(walletRef, {
        guncel_kredi: currentBalance - amount,
        son_islem_tarihi: serverTimestamp()
      });

      // Adım 3: Transaction log kaydı
      const transactionRef = doc(collection(db, "transactions"));
      transaction.set(transactionRef, {
        user_id: userId,
        tip: "harcama",
        miktar: -amount,
        aciklama: `${gameType} Maç İlanı Bedeli (Bloke)`,
        tarih: serverTimestamp()
      });

      // Adım 4: Maç dokümanı oluştur
      const matchDocRef = doc(collection(db, "matches"));
      transaction.set(matchDocRef, {
        olusturan_id: userId,
        oyun_turu: gameType,
        hedef: targetGoal,
        giris_ucreti: amount,
        durum: "beklemede",
        katilan_id: null,
        kazanan_id: null,
        olusturulma_tarihi: serverTimestamp(),
        guncellenme_tarihi: serverTimestamp()
      });

      return { success: true, matchId: matchDocRef.id };
    });

    return result;
  } catch (error) {
    console.error("Maç oluşturma hatası:", error.message);
    throw error;
  }
};

// 2. AKTİF MAÇLARI DİNLEME (Real-time)
export const listenToActiveMatches = (callback) => {
  const q = query(
    collection(db, "matches"),
    where("durum", "==", "beklemede"),
    orderBy("olusturulma_tarihi", "desc"),
    limit(20)
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const activeMatches = [];
      querySnapshot.forEach((doc) => {
        activeMatches.push({ id: doc.id, ...doc.data() });
      });
      callback(activeMatches, null);
    },
    (error) => {
      console.error("Aktif maçları dinleme hatası:", error);
      callback([], error);
    }
  );

  return unsubscribe;
};

// 2B. OYNANAN MAÇLARI DİNLEME (Real-time)
export const listenToPlayingMatches = (callback) => {
  const q = query(
    collection(db, "matches"),
    where("durum", "==", "oynanıyor"),
    orderBy("guncellenme_tarihi", "desc"),
    limit(20)
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const playingMatches = [];
      querySnapshot.forEach((doc) => {
        playingMatches.push({ id: doc.id, ...doc.data() });
      });
      callback(playingMatches, null);
    },
    (error) => {
      console.error("Oynanan maçları dinleme hatası:", error);
      callback([], error);
    }
  );

  return unsubscribe;
};

// 3. MAÇA KATILMA (ATOMIK TRANSACTION)
export const joinMatch = async (matchId, userId) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      // Adım 1: Match doküleri ver
      const matchRef = doc(db, "matches", matchId);
      const matchSnap = await transaction.get(matchRef);

      if (!matchSnap.exists()) {
        throw new Error("Bu maç bulunamadı veya silinmiş!");
      }

      const matchData = matchSnap.data();

      // Adım 2: Güvenlik kontrolleri
      if (matchData.olusturan_id === userId) {
        throw new Error("Kendi oluşturduğunuz maça katılamazsınız!");
      }

      if (matchData.durum !== "beklemede") {
        throw new Error("Bu maç zaten dolmuş veya başlamış!");
      }

      const amount = matchData.giris_ucreti;

      // Adım 3: Katılan kullanıcının cüzdan kontrolü
      const userWalletRef = doc(db, "wallets", userId);
      const userWalletSnap = await transaction.get(userWalletRef);

      if (!userWalletSnap.exists()) {
        throw new Error("Cüzdan bulunamadı!");
      }

      const userBalance = userWalletSnap.data().guncel_kredi || 0;
      if (userBalance < amount) {
        throw new Error("Yetersiz bakiye! Maç için gerekli krediyi cüzdanınızda bulunmuyor.");
      }

      // Adım 4: Bakiye düş
      transaction.update(userWalletRef, {
        guncel_kredi: userBalance - amount,
        son_islem_tarihi: serverTimestamp()
      });

      // Adım 5: Transaction log kaydı
      const userTransactionRef = doc(collection(db, "transactions"));
      transaction.set(userTransactionRef, {
        user_id: userId,
        tip: "harcama",
        miktar: -amount,
        aciklama: `${matchData.oyun_turu} Maça Katılım Bedeli (Bloke)`,
        tarih: serverTimestamp(),
        match_id: matchId
      });

      // Adım 6: Match durumunu güncelle
      transaction.update(matchRef, {
        durum: "oynanıyor",
        katilan_id: userId,
        guncellenme_tarihi: serverTimestamp()
      });

      return { success: true, matchId };
    });

    return result;
  } catch (error) {
    console.error("Maça katılma hatası:", error);
    throw error;
  }
};

// 4. KULLANICI MAÇLARINI DİNLEME
export const listenToUserMatches = (userId, callback) => {
  const q = query(
    collection(db, "matches"),
    where("olusturan_id", "==", userId),
    orderBy("olusturulma_tarihi", "desc")
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const userMatches = [];
      querySnapshot.forEach((doc) => {
        userMatches.push({ id: doc.id, ...doc.data() });
      });
      callback(userMatches, null);
    },
    (error) => {
      console.error("Kullanıcı maçlarını dinleme hatası:", error);
      callback([], error);
    }
  );

  return unsubscribe;
};

// 5. MAÇ GEÇMİŞİ SORGUSU
export const getMatchHistory = async (userId) => {
  try {
    const q = query(
      collection(db, "matches"),
      where("olusturan_id", "==", userId),
      orderBy("guncellenme_tarihi", "desc"),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    const matches = [];
    querySnapshot.forEach((doc) => {
      matches.push({ id: doc.id, ...doc.data() });
    });

    return matches;
  } catch (error) {
    console.error("Maç geçmişi sorgusu hatası:", error);
    throw error;
  }
};