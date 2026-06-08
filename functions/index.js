import functions from "firebase-functions";
import admin from "firebase-admin";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

/* global process */

dotenv.config();

// Firebase Admin SDK Initialization
admin.initializeApp();
const db = admin.firestore();

// CORS Configuration
const corsHandler = cors({
  origin: [
    "http://localhost:5173",        // Vite dev server
    "http://localhost:5174",        // Alternative port
    "https://skill-match-a711a.web.app",  // Production
    "https://skill-match-a711a.firebaseapp.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
});

// Riot API Configuration
const RIOT_API_KEY = process.env.RIOT_API_KEY;
const RIOT_API_BASE = "https://na1.api.riotgames.com";
const CACHE_TTL = 3600 * 1000; // 1 hour in milliseconds

// ============================================
// UTILITY: Check Firestore Cache
// ============================================
const getCacheData = async (collection, docId) => {
  try {
    const docRef = db.collection(collection).doc(docId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      const timestamp = data.cached_at?.toMillis() || 0;
      const now = Date.now();

      // If cached data is within TTL, return it
      if (now - timestamp < CACHE_TTL) {
        console.log(`✓ Cache HIT for ${collection}/${docId}`);
        return { data: data.data, fromCache: true };
      }
    }
    return { data: null, fromCache: false };
  } catch (error) {
    console.error(`Cache retrieval error: ${error.message}`);
    return { data: null, fromCache: false };
  }
};

// ============================================
// UTILITY: Set Firestore Cache
// ============================================
const setCacheData = async (collection, docId, data) => {
  try {
    await db.collection(collection).doc(docId).set({
      data,
      cached_at: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✓ Cache SET for ${collection}/${docId}`);
  } catch (error) {
    console.error(`Cache set error: ${error.message}`);
  }
};

// ============================================
// CLOUD FUNCTION 1: Get Summoner by Name
// ============================================
export const getSummoner = functions
  .region("us-central1")
  .https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== "POST") {
          return res.status(405).json({ error: "Method not allowed" });
        }

        const { summonerName } = req.body;

        if (!summonerName) {
          return res.status(400).json({ error: "summonerName is required" });
        }

        // Check cache first
        const cacheKey = `summoner_${summonerName.toLowerCase()}`;
        const cachedSummoner = await getCacheData("lol_cache", cacheKey);

        if (cachedSummoner.fromCache) {
          return res.json({
            ...cachedSummoner.data,
            source: "cache"
          });
        }

        // Fetch from Riot API
        const riotUrl = `${RIOT_API_BASE}/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`;
        const response = await axios.get(riotUrl, {
          params: { api_key: RIOT_API_KEY },
          timeout: 10000
        });

        const summonerData = response.data;

        // Cache the result
        await setCacheData("lol_cache", cacheKey, summonerData);

        res.json({
          ...summonerData,
          source: "riot"
        });
      } catch (error) {
        console.error("getSummoner error:", error.message);

        if (error.response?.status === 404) {
          return res.status(404).json({ error: "Summoner not found" });
        }
        if (error.response?.status === 429) {
          return res.status(429).json({ error: "Rate limit exceeded" });
        }

        res.status(500).json({
          error: error.message || "Internal server error"
        });
      }
    });
  });

// ============================================
// CLOUD FUNCTION 2: Get Champion Mastery
// ============================================
export const getChampionMastery = functions
  .region("us-central1")
  .https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== "POST") {
          return res.status(405).json({ error: "Method not allowed" });
        }

        const { summonerId } = req.body;

        if (!summonerId) {
          return res.status(400).json({ error: "summonerId is required" });
        }

        // Check cache
        const cacheKey = `mastery_${summonerId}`;
        const cachedMastery = await getCacheData("lol_cache", cacheKey);

        if (cachedMastery.fromCache) {
          return res.json({
            champions: cachedMastery.data,
            source: "cache"
          });
        }

        // Fetch from Riot API
        const riotUrl = `${RIOT_API_BASE}/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}`;
        const response = await axios.get(riotUrl, {
          params: { api_key: RIOT_API_KEY },
          timeout: 10000
        });

        const masteryData = response.data;

        // Cache the result
        await setCacheData("lol_cache", cacheKey, masteryData);

        res.json({
          champions: masteryData,
          source: "riot"
        });
      } catch (error) {
        console.error("getChampionMastery error:", error.message);

        if (error.response?.status === 404) {
          return res.status(404).json({ error: "Mastery data not found" });
        }
        if (error.response?.status === 429) {
          return res.status(429).json({ error: "Rate limit exceeded" });
        }

        res.status(500).json({
          error: error.message || "Internal server error"
        });
      }
    });
  });

// ============================================
// CLOUD FUNCTION 3: Get Match History (by PUUID)
// ============================================
export const getMatchHistory = functions
  .region("us-central1")
  .https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== "POST") {
          return res.status(405).json({ error: "Method not allowed" });
        }

        const { puuid, start = 0, count = 20 } = req.body;

        if (!puuid) {
          return res.status(400).json({ error: "puuid is required" });
        }

        // Check cache
        const cacheKey = `matches_${puuid}_${start}_${count}`;
        const cachedMatches = await getCacheData("lol_cache", cacheKey);

        if (cachedMatches.fromCache) {
          return res.json({
            matches: cachedMatches.data,
            source: "cache"
          });
        }

        // Fetch from Riot API (Americas region for PUUID endpoints)
        const riotUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`;
        const response = await axios.get(riotUrl, {
          params: {
            api_key: RIOT_API_KEY,
            start,
            count
          },
          timeout: 10000
        });

        const matchIds = response.data;

        // Cache the result
        await setCacheData("lol_cache", cacheKey, matchIds);

        res.json({
          matches: matchIds,
          source: "riot"
        });
      } catch (error) {
        console.error("getMatchHistory error:", error.message);

        if (error.response?.status === 404) {
          return res.status(404).json({ error: "Match history not found" });
        }
        if (error.response?.status === 429) {
          return res.status(429).json({ error: "Rate limit exceeded" });
        }

        res.status(500).json({
          error: error.message || "Internal server error"
        });
      }
    });
  });

// ============================================
// CLOUD FUNCTION 4: Get Match Details
// ============================================
export const getMatchDetails = functions
  .region("us-central1")
  .https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== "POST") {
          return res.status(405).json({ error: "Method not allowed" });
        }

        const { matchId } = req.body;

        if (!matchId) {
          return res.status(400).json({ error: "matchId is required" });
        }

        // Check cache (matches don't change, so cache forever)
        const cacheKey = `match_${matchId}`;
        const cachedMatch = await getCacheData("lol_cache", cacheKey);

        if (cachedMatch.fromCache) {
          return res.json({
            ...cachedMatch.data,
            source: "cache"
          });
        }

        // Fetch from Riot API (Americas region)
        const riotUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`;
        const response = await axios.get(riotUrl, {
          params: { api_key: RIOT_API_KEY },
          timeout: 10000
        });

        const matchData = response.data;

        // Cache the result
        await setCacheData("lol_cache", cacheKey, matchData);

        res.json({
          ...matchData,
          source: "riot"
        });
      } catch (error) {
        console.error("getMatchDetails error:", error.message);

        if (error.response?.status === 404) {
          return res.status(404).json({ error: "Match not found" });
        }
        if (error.response?.status === 429) {
          return res.status(429).json({ error: "Rate limit exceeded" });
        }

        res.status(500).json({
          error: error.message || "Internal server error"
        });
      }
    });
  });

// ============================================
// CLOUD FUNCTION 5: Get Summoner Rank
// ============================================
export const getSummonerRank = functions
  .region("us-central1")
  .https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== "POST") {
          return res.status(405).json({ error: "Method not allowed" });
        }

        const { summonerId } = req.body;

        if (!summonerId) {
          return res.status(400).json({ error: "summonerId is required" });
        }

        // Check cache
        const cacheKey = `rank_${summonerId}`;
        const cachedRank = await getCacheData("lol_cache", cacheKey);

        if (cachedRank.fromCache) {
          return res.json({
            entries: cachedRank.data,
            source: "cache"
          });
        }

        // Fetch from Riot API
        const riotUrl = `${RIOT_API_BASE}/lol/league/v4/entries/by-summoner/${summonerId}`;
        const response = await axios.get(riotUrl, {
          params: { api_key: RIOT_API_KEY },
          timeout: 10000
        });

        const rankData = response.data;

        // Cache the result
        await setCacheData("lol_cache", cacheKey, rankData);

        res.json({
          entries: rankData,
          source: "riot"
        });
      } catch (error) {
        console.error("getSummonerRank error:", error.message);

        if (error.response?.status === 404) {
          return res.status(404).json({ error: "Rank data not found" });
        }
        if (error.response?.status === 429) {
          return res.status(429).json({ error: "Rate limit exceeded" });
        }

        res.status(500).json({
          error: error.message || "Internal server error"
        });
      }
    });
  });

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
export const health = functions
  .region("us-central1")
  .https.onRequest((req, res) => {
    corsHandler(req, res, () => {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString()
      });
    });
  });
