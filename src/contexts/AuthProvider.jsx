import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { AuthContext } from "./authContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      
      // Çerezleri temizle
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // --- İŞTE SİHİRLİ DOKUNUŞ BURADA ---
      // "/login" yerine "/" yazdık. Artık çıkış yapınca zorla logine atmayacak, ana sayfada (Landing) kalacaksın.
      window.location.href = "/";
    } catch (error) {
      console.error("Çıkış işlemi sırasında hata:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);  
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (error) {
          console.error("Firestore veri çekme hatası:", error);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Beyaz ekranı önlemek için loading durumunu burada yönetiyoruz
  return (
    <AuthContext.Provider value={{ user, userData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};