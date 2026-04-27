import { collection, doc, getDocs, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";

const DEFAULT_STATS = {
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
};

const buildSeedPayload = (existing = {}) => {
  const payload = {};

  if (!("rank" in existing)) {
    payload.rank = "Unranked";
  }
  if (!("level" in existing)) {
    payload.level = 1;
  }
  if (!("tier" in existing)) {
    payload.tier = "Standard";
  }
  if (!("bio" in existing)) {
    payload.bio = "";
  }
  if (!("last_active" in existing)) {
    payload.last_active = "Just now";
  }
  if (!("achievements" in existing)) {
    payload.achievements = [];
  }

  const existingStats = existing.stats || {};
  const statsPayload = {};
  Object.keys(DEFAULT_STATS).forEach((key) => {
    if (!(key in existingStats)) {
      statsPayload[key] = DEFAULT_STATS[key];
    }
  });

  if (Object.keys(statsPayload).length > 0) {
    payload.stats = { ...existingStats, ...statsPayload };
  }

  if (Object.keys(payload).length > 0) {
    payload.updated_at = serverTimestamp();
  }

  return payload;
};

export const seedUserProfile = async (userId, overrides = {}) => {
  if (!userId) {
    throw new Error("User ID is required for seeding.");
  }

  const payload = {
    rank: "Diamond",
    level: 22,
    tier: "Premium",
    bio: "Competitive player | LFT",
    last_active: "Just now",
    achievements: [
      {
        id: "ach_001",
        name: "First Blood",
        description: "Won your first match",
        icon: "FB",
        rarity: "common",
      },
      {
        id: "ach_002",
        name: "Win Streak",
        description: "Won 5 matches in a row",
        icon: "WS",
        rarity: "rare",
      },
    ],
    stats: {
      totalMatches: 14,
      wins: 9,
      losses: 5,
      winRate: 64,
      currentStreak: 2,
      longestWinStreak: 4,
      averagePerformanceRating: 7.6,
      averageScore: 1920,
      averageKills: 8.1,
      averageDeaths: 4.3,
      averageAssists: 6.2,
    },
    updated_at: serverTimestamp(),
    ...overrides,
  };

  console.log("Seeding user profile:", { userId, payload });
  await setDoc(doc(db, "users", userId), payload, { merge: true });
  console.log("Seed complete for user:", userId);
  return { success: true };
};

export const seedAllUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  let batch = writeBatch(db);
  let batchCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  const commitBatch = async () => {
    if (batchCount === 0) {
      return;
    }
    await batch.commit();
    batch = writeBatch(db);
    batchCount = 0;
  };

  for (const docSnap of snapshot.docs) {
    const payload = buildSeedPayload(docSnap.data());
    if (Object.keys(payload).length === 0) {
      skippedCount += 1;
      continue;
    }

    batch.set(doc(db, "users", docSnap.id), payload, { merge: true });
    batchCount += 1;
    updatedCount += 1;

    if (batchCount >= 400) {
      await commitBatch();
    }
  }

  await commitBatch();
  return { updatedCount, skippedCount, total: snapshot.size };
};
