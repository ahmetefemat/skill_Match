import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export const getUserById = async (userId) => {
  if (!userId) {
    return null;
  }

  const userSnap = await getDoc(doc(db, "users", userId));
  if (!userSnap.exists()) {
    return null;
  }

  return userSnap.data();
};

export const getUsersByIds = async (userIds = []) => {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return {};
  }

  const results = await Promise.all(
    uniqueIds.map(async (id) => ({ id, data: await getUserById(id) }))
  );

  return results.reduce((acc, { id, data }) => {
    if (data) {
      acc[id] = data;
    }
    return acc;
  }, {});
};

export const buildLinkedAccounts = (userData = {}) => {
  return [
    {
      id: "riot",
      platform: "Riot Games",
      username: userData.riot_id || "Not connected",
      icon: "RG",
      connected: Boolean(userData.riot_id),
      connectedDate: userData.riot_connected_date || null,
      verificationStatus: userData.riot_verified ? "verified" : null,
    },
    {
      id: "steam",
      platform: "Steam",
      username: userData.steam_id || "Not connected",
      icon: "ST",
      connected: Boolean(userData.steam_id),
      connectedDate: userData.steam_connected_date || null,
      verificationStatus: userData.steam_verified ? "verified" : null,
    },
  ];
};

const getTimestampMillis = (value) => {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }
  if (typeof value.seconds === "number") {
    return value.seconds * 1000;
  }
  if (typeof value._seconds === "number") {
    return value._seconds * 1000;
  }
  if (typeof value.seconds === "string") {
    const secondsNumber = Number(value.seconds);
    return Number.isNaN(secondsNumber) ? null : secondsNumber * 1000;
  }
  if (typeof value._seconds === "string") {
    const secondsNumber = Number(value._seconds);
    return Number.isNaN(secondsNumber) ? null : secondsNumber * 1000;
  }
  return null;
};

const normalizeAchievements = (items = []) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => {
    if (typeof item === "string") {
      return {
        id: `ach_${index + 1}`,
        name: item,
        description: "",
        icon: "A",
        rarity: "common",
      };
    }

    return {
      id: item.id || `ach_${index + 1}`,
      name: item.name || item.title || "Achievement",
      description: item.description || "",
      icon: item.icon || "A",
      rarity: item.rarity || "common",
    };
  });
};

const resolveProfileRank = (userData = {}) => {
  return (
    userData.rank ||
    userData.rutbe ||
    userData.rank_label ||
    "Unranked"
  );
};

const resolveProfileLevel = (userData = {}) => {
  return (
    userData.level ||
    userData.seviye ||
    userData.level_number ||
    1
  );
};

const resolveProfileTier = (userData = {}) => {
  return (
    userData.tier ||
    userData.abonelik ||
    userData.membership ||
    "Standard"
  );
};

export const buildUserProfile = (userData = {}, authUser, walletBalance = 0) => {
  const joinDateMillis =
    getTimestampMillis(
      userData.kayit_tarihi ||
        userData.created_at ||
        userData.createdAt ||
        userData.kayitTarihi
    ) ||
    getTimestampMillis(authUser?.metadata?.creationTime) ||
    Date.now();

  const username =
    userData.kullanici_adi ||
    userData.kullaniciAdi ||
    userData.kullaniciadi ||
    userData.username ||
    userData.display_name ||
    authUser?.displayName ||
    "Player";

  return {
    id: authUser?.uid || userData.user_id || "",
    username,
    email: userData.e_posta || authUser?.email || "",
    avatarUrl: userData.avatar_url || null,
    rank: resolveProfileRank(userData),
    level: resolveProfileLevel(userData),
    tier: resolveProfileTier(userData),
    riotId: userData.riot_id || null,
    steamId: userData.steam_id || null,
    joinDate: joinDateMillis,
    bio: userData.bio || "",
    balance: walletBalance,
    totalEarned: userData.total_earned || 0,
    totalSpent: userData.total_spent || 0,
    isVerified: Boolean(userData.is_verified),
    lastActive: userData.last_active || "Just now",
  };
};

export const buildAchievements = (userData = {}) => {
  return normalizeAchievements(userData.achievements || userData.basarilar || []);
};

export const resolveStatsOverrides = (userData = {}) => {
  return (
    userData.stats ||
    userData.statistics ||
    userData.istatistikler ||
    null
  );
};
