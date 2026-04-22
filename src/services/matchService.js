import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDoc
} from "firebase/firestore";

import { db } from "./firebase";
import { deductCredit } from "./walletService";

// 1. MAÇ İLANI OLUŞTURMA
export const createMatch = async (userId, gameType, amount) => {
  try {
    await deductCredit(userId, amount, `${gameType} Maç İlanı Bedeli (Bloke)`);

    const matchRef = await addDoc(collection(db, "matches"), {
      olusturan_id: userId,
      oyun_turu: gameType,
      giris_ucreti: amount,
      durum: "beklemede",
      katilan_id: null,
      kazanan_id: null,
      olusturulma_tarihi: serverTimestamp()
    });

    return { success: true, matchId: matchRef.id };
  } catch (error) {
    console.error("Maç oluşturma hatası:", error);
    throw error;
  }
};

// 2. AKTİF MAÇLARI DİNLEME (VİTRİN)
export const listenToActiveMatches = (callback) => {
  const q = query(collection(db, "matches"), where("durum", "==", "beklemede"));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const activeMatches = [];
    querySnapshot.forEach((doc) => {
      activeMatches.push({ id: doc.id, ...doc.data() });
    });
    callback(activeMatches);
  });

  return unsubscribe;
};

// 3. MAÇA KATILMA FONKSİYONU (Eksik olan buydu!)
export const joinMatch = async (matchId, userId, amount) => {
  try {
    // Adım 1: Maçın detaylarını çekip kontrol edelim (Kendi maçı mı?)
    const matchRef = doc(db, "matches", matchId);
    const matchSnap = await getDoc(matchRef);

    // --- DEFENSİF KONTROL: Belge var mı? ---
    if (!matchSnap.exists()) {
      throw new Error("Bu maç bulunamadı veya silinmiş!");
    }

    const matchData = matchSnap.data();

    // --- KRİTİK GÜVENLİK KONTROLÜ ---
    if (matchData.olusturan_id === userId) {
      throw new Error("Kendi oluşturduğunuz maça katılamazsınız!");
    }

    if (matchData.durum !== "beklemede") {
      throw new Error("Bu maç zaten dolmuş veya başlamış!");
    }
    // --------------------------------

    // Adım 2: Para kesme ve durumu güncelleme
    await deductCredit(userId, amount, "Maça Katılım Bedeli (Bloke)");
    
    // Adım 3: Maçın durumunu 'oynanıyor' yap (tek güncelleme)
    await updateDoc(matchRef, {
      durum: "oynanıyor",
      katilan_id: userId,
      guncellenme_tarihi: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Maça katılma hatası:", error);
    throw error;
  }
};