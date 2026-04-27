import { 
  collection, 
  serverTimestamp, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  runTransaction,
  getDocs,
  getDoc,
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

export const getUserMatchHistory = async (userId, limitCount = 10) => {
  try {
    const [createdSnap, joinedSnap] = await Promise.all([
      getDocs(
        query(
          collection(db, "matches"),
          where("olusturan_id", "==", userId),
          orderBy("guncellenme_tarihi", "desc"),
          limit(limitCount)
        )
      ),
      getDocs(
        query(
          collection(db, "matches"),
          where("katilan_id", "==", userId),
          orderBy("guncellenme_tarihi", "desc"),
          limit(limitCount)
        )
      ),
    ]);

    const matchesMap = new Map();

    createdSnap.forEach((docSnap) => {
      matchesMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
    });

    joinedSnap.forEach((docSnap) => {
      if (!matchesMap.has(docSnap.id)) {
        matchesMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
      }
    });

    return Array.from(matchesMap.values());
  } catch (error) {
    console.error("Kullanici mac gecmisi sorgusu hatasi:", error);
    throw error;
  }
};

export const getMatchById = async (matchId) => {
  if (!matchId) {
    return null;
  }

  const matchSnap = await getDoc(doc(db, "matches", matchId));
  if (!matchSnap.exists()) {
    return null;
  }

  return { id: matchSnap.id, ...matchSnap.data() };
};

// =====================================================
// DURUM MAKİNESİ: GEÇERSIZ GEÇİŞLER ENGELLENİYOR
// =====================================================

/**
 * Durum geçişi validasyonu
 * Geçerli geçişler:
 * - beklemede → oynanıyor (katılım olunca)
 * - oynanıyor → tamamlandı (sonuç girilince)
 * - oynanıyor → iptal (herhangi biri iptal edince)
 * - beklemede → iptal (oluşturan iptal edebilir)
 */
export const isValidStatusTransition = (fromStatus, toStatus) => {
  const validTransitions = {
    "beklemede": ["oynanıyor", "iptal"],
    "oynanıyor": ["tamamlandı", "iptal"],
    "tamamlandı": [], // Final state
    "iptal": []       // Final state
  };

  return validTransitions[fromStatus]?.includes(toStatus) || false;
};

/**
 * Maç durumunu güncelle (durum makinesi kontrollü)
 * Yalnızca geçerli geçişlere izin ver
 */
export const updateMatchStatus = async (matchId, newStatus) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      // Mevcut durumu kontrol et
      const matchRef = doc(db, "matches", matchId);
      const matchSnap = await transaction.get(matchRef);

      if (!matchSnap.exists()) {
        throw new Error("Maç bulunamadı!");
      }

      const matchData = matchSnap.data();
      const currentStatus = matchData.durum;

      // Durum geçişinin geçerli olup olmadığını kontrol et
      if (!isValidStatusTransition(currentStatus, newStatus)) {
        throw new Error(
          `Geçersiz durum geçişi: ${currentStatus} → ${newStatus}. ` +
          `Maç durumundan ${newStatus} durumuna geçişe izin verilmiyor.`
        );
      }

      // Durumu güncelle
      transaction.update(matchRef, {
        durum: newStatus,
        guncellenme_tarihi: serverTimestamp()
      });

      return { success: true, previousStatus: currentStatus };
    });

    return result;
  } catch (error) {
    console.error("Durum güncelleme hatası:", error.message);
    throw error;
  }
};

/**
 * Maçı tamamla ve ödül dağıt
 * - kazananId'yi kaydet
 * - Kazananın cüzdanına toplam tutarı yatır
 * - Transaction logları oluştur
 */
export const completeMatch = async (matchId, winnerId, creatorId, joinedId, entryFee) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      // Adım 1: Match durumunu tamamlandı'ya çek
      const matchRef = doc(db, "matches", matchId);
      const matchSnap = await transaction.get(matchRef);

      if (!matchSnap.exists()) {
        throw new Error("Maç bulunamadı!");
      }

      const matchData = matchSnap.data();

      // Durum kontrolü
      if (matchData.durum !== "oynanıyor") {
        throw new Error("Yalnızca oynanan maçlar tamamlanabilir!");
      }

      // Adım 2: Kazananı kaydet
      transaction.update(matchRef, {
        durum: "tamamlandı",
        kazanan_id: winnerId,
        guncellenme_tarihi: serverTimestamp()
      });

      // Adım 3: Kazananın cüzdanına toplam tutarı yatır
      const winnerWalletRef = doc(db, "wallets", winnerId);
      const winnerWalletSnap = await transaction.get(winnerWalletRef);

      if (winnerWalletSnap.exists()) {
        const currentBalance = winnerWalletSnap.data().guncel_kredi || 0;
        const totalPrize = entryFee * 2; // İki oyuncunun bahisinin toplamı

        transaction.update(winnerWalletRef, {
          guncel_kredi: currentBalance + totalPrize,
          son_islem_tarihi: serverTimestamp()
        });

        // Adım 4: Kazanç transaction log kaydı
        const winTransactionRef = doc(collection(db, "transactions"));
        transaction.set(winTransactionRef, {
          user_id: winnerId,
          tip: "gelir",
          miktar: totalPrize,
          aciklama: `Maç Kazanımı (${matchData.oyun_turu})`,
          tarih: serverTimestamp(),
          match_id: matchId
        });
      }

      return { success: true, matchId };
    });

    return result;
  } catch (error) {
    console.error("Maç tamamlama hatası:", error.message);
    throw error;
  }
};

/**
 * Maçı iptal et ve iade akışını başlat
 * - Geçerli durum: beklemede veya oynanıyor
 * - Oluşturan oyuncuya: giris_ucreti geri yat
 * - Katılan oyuncuya (varsa): giris_ucreti geri yat
 * - Transaction logları oluştur
 */
export const cancelMatch = async (matchId) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      // Adım 1: Match doküleri oku
      const matchRef = doc(db, "matches", matchId);
      const matchSnap = await transaction.get(matchRef);

      if (!matchSnap.exists()) {
        throw new Error("Maç bulunamadı!");
      }

      const matchData = matchSnap.data();

      // Adım 2: Durum kontrolü (yalnızca beklemede ve oynanıyor durumunda iptal edilebilir)
      if (!["beklemede", "oynanıyor"].includes(matchData.durum)) {
        throw new Error(
          `Durum: ${matchData.durum} olan maçlar iptal edilemez. ` +
          `Yalnızca beklemede veya oynanıyor durumundaki maçlar iptal edilebilir.`
        );
      }

      // Adım 3: İz bıraksam dönüştür
      transaction.update(matchRef, {
        durum: "iptal",
        guncellenme_tarihi: serverTimestamp(),
        iptal_nedeni: "Oyuncu tarafından iptal edildi",
        iptal_tarihi: serverTimestamp()
      });

      const entryFee = matchData.giris_ucreti;

      // Adım 4: Oluşturan oyuncuya iade yap
      const creatorWalletRef = doc(db, "wallets", matchData.olusturan_id);
      const creatorWalletSnap = await transaction.get(creatorWalletRef);

      if (creatorWalletSnap.exists()) {
        const creatorBalance = creatorWalletSnap.data().guncel_kredi || 0;
        transaction.update(creatorWalletRef, {
          guncel_kredi: creatorBalance + entryFee,
          son_islem_tarihi: serverTimestamp()
        });

        // İade transaction log kaydı
        const creatorRefundRef = doc(collection(db, "transactions"));
        transaction.set(creatorRefundRef, {
          user_id: matchData.olusturan_id,
          tip: "iade",
          miktar: entryFee,
          aciklama: `Iptal edilen maçtan iade (${matchData.oyun_turu})`,
          tarih: serverTimestamp(),
          match_id: matchId
        });
      }

      // Adım 5: Katılan oyuncuya (varsa) iade yap
      if (matchData.katilan_id) {
        const joinedWalletRef = doc(db, "wallets", matchData.katilan_id);
        const joinedWalletSnap = await transaction.get(joinedWalletRef);

        if (joinedWalletSnap.exists()) {
          const joinedBalance = joinedWalletSnap.data().guncel_kredi || 0;
          transaction.update(joinedWalletRef, {
            guncel_kredi: joinedBalance + entryFee,
            son_islem_tarihi: serverTimestamp()
          });

          // İade transaction log kaydı
          const joinedRefundRef = doc(collection(db, "transactions"));
          transaction.set(joinedRefundRef, {
            user_id: matchData.katilan_id,
            tip: "iade",
            miktar: entryFee,
            aciklama: `Iptal edilen maçtan iade (${matchData.oyun_turu})`,
            tarih: serverTimestamp(),
            match_id: matchId
          });
        }
      }

      return {
        success: true,
        matchId,
        refunded: {
          creator: entryFee,
          joined: matchData.katilan_id ? entryFee : 0
        }
      };
    });

    return result;
  } catch (error) {
    console.error("Maç iptal hatası:", error.message);
    throw error;
  }
};