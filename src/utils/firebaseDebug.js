// Debug tool para testar conexão com Firebase
export const testFirebaseConnection = async () => {
  try {
    const firebaseModule = await import("../services/firebase.js");
    
    console.group("🔥 Firebase Debug Info");
    console.log("✅ Firebase módulo carregado");
    console.log("Auth:", firebaseModule.auth);
    console.log("App:", firebaseModule.auth?.app?.name || "Padrão");
    
    // Informações de configuração (parte da chave por segurança)
    const apiKey = firebaseModule.auth?.app?.options?.apiKey || "❌ Não configurada";
    const projectId = firebaseModule.auth?.app?.options?.projectId || "❌ Não configurada";
    const authDomain = firebaseModule.auth?.app?.options?.authDomain || "❌ Não configurada";
    
    console.log("API Key:", apiKey.substring(0, 10) + "***" + apiKey.substring(apiKey.length - 5));
    console.log("Project ID:", projectId);
    console.log("Auth Domain:", authDomain);
    
    // Verificar se a autenticação por email está habilitada
    const settings = firebaseModule.auth?.settings || {};
    console.log("🔐 Auth Settings:", settings);
    
    console.groupEnd();
    
    return {
      success: true,
      auth: firebaseModule.auth,
      config: { projectId, authDomain }
    };
  } catch (error) {
    console.error("❌ Firebase bağlantı hatası:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Testa auth session
export const testAuthSession = async () => {
  try {
    const firebaseModule = await import("../services/firebase.js");
    
    console.log("📝 Firebase carregado com sucesso");
    console.log("Auth module:", firebaseModule.auth ? "✅" : "❌");
    console.log("Firestore db:", firebaseModule.db ? "✅" : "❌");
    
    return firebaseModule.auth?.currentUser || null;
  } catch (error) {
    console.error("❌ Erro ao testar sessão:", error);
    return null;
  }
};

// Função para testar login
export const testLogin = async (email, password) => {
  try {
    const authService = await import("../services/authService.js");
    console.log("🔐 Testando login com:", email);
    
    const result = await authService.loginUser(email, password);
    console.log("✅ Login bem-sucedido!");
    return result;
  } catch (error) {
    const translated = await import("../services/authService.js")
      .then(m => m.translateFirebaseError(error));
    
    console.error("❌ Erro no login:", {
      code: error.code,
      message: error.message,
      translated: translated
    });
    
    throw error;
  }
};
