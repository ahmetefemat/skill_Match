/**
 * Local BFF Server - League of Legends API Proxy
 * Runs on http://localhost:3001
 * 
 * Usage: node server.js
 * eslint-disable-next-line no-undef
 */

/* global process */

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const app = express();
const PORT = 3001;

// Riot API Configuration
const RIOT_API_KEY = process.env.RIOT_API_KEY;
const RIOT_API_BASE = 'https://na1.api.riotgames.com';
const CACHE = new Map(); // In-memory cache
const CACHE_TTL = 3600 * 1000; // 1 hour

if (!RIOT_API_KEY) {
  console.error('❌ RIOT_API_KEY not found in .env file');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// ============================================
// CACHE UTILITIES
// ============================================
const getCached = (key) => {
  const item = CACHE.get(key);
  if (!item) return null;
  
  const now = Date.now();
  if (now - item.timestamp > CACHE_TTL) {
    CACHE.delete(key);
    return null;
  }
  
  console.log(`✓ Cache HIT: ${key}`);
  return item.data;
};

const setCached = (key, data) => {
  CACHE.set(key, { data, timestamp: Date.now() });
  console.log(`✓ Cache SET: ${key}`);
};

// ============================================
// ERROR HANDLER
// ============================================
const handleError = (res, error, context) => {
  console.error(`[${context}]`, error.message);

  if (error.response?.status === 404) {
    return res.status(404).json({ error: 'Not found' });
  }
  if (error.response?.status === 429) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  if (error.response?.status === 403) {
    return res.status(403).json({ error: 'Access forbidden' });
  }

  res.status(500).json({ 
    error: error.message || 'Internal server error' 
  });
};

// ============================================
// ENDPOINTS
// ============================================

// GET SUMMONER
app.post('/api/lol/getSummoner', async (req, res) => {
  try {
    const { summonerName } = req.body;
    if (!summonerName) {
      return res.status(400).json({ error: 'summonerName required' });
    }

    const cacheKey = `summoner_${summonerName.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json({ ...cached, source: 'cache' });

    const url = `${RIOT_API_BASE}/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`;
    const response = await axios.get(url, {
      params: { api_key: RIOT_API_KEY },
      timeout: 10000
    });

    setCached(cacheKey, response.data);
    res.json({ ...response.data, source: 'riot' });
  } catch (error) {
    handleError(res, error, 'getSummoner');
  }
});

// GET CHAMPION MASTERY
app.post('/api/lol/getChampionMastery', async (req, res) => {
  try {
    const { summonerId } = req.body;
    if (!summonerId) {
      return res.status(400).json({ error: 'summonerId required' });
    }

    const cacheKey = `mastery_${summonerId}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json({ champions: cached, source: 'cache' });

    const url = `${RIOT_API_BASE}/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}`;
    const response = await axios.get(url, {
      params: { api_key: RIOT_API_KEY },
      timeout: 10000
    });

    setCached(cacheKey, response.data);
    res.json({ champions: response.data, source: 'riot' });
  } catch (error) {
    handleError(res, error, 'getChampionMastery');
  }
});

// GET MATCH HISTORY
app.post('/api/lol/getMatchHistory', async (req, res) => {
  try {
    const { puuid, start = 0, count = 20 } = req.body;
    if (!puuid) {
      return res.status(400).json({ error: 'puuid required' });
    }

    const cacheKey = `matches_${puuid}_${start}_${count}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json({ matches: cached, source: 'cache' });

    const url = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`;
    const response = await axios.get(url, {
      params: { api_key: RIOT_API_KEY, start, count },
      timeout: 10000
    });

    setCached(cacheKey, response.data);
    res.json({ matches: response.data, source: 'riot' });
  } catch (error) {
    handleError(res, error, 'getMatchHistory');
  }
});

// GET SUMMONER RANK
app.post('/api/lol/getSummonerRank', async (req, res) => {
  try {
    const { summonerId } = req.body;
    if (!summonerId) {
      return res.status(400).json({ error: 'summonerId required' });
    }

    const cacheKey = `rank_${summonerId}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json({ entries: cached, source: 'cache' });

    const url = `${RIOT_API_BASE}/lol/league/v4/entries/by-summoner/${summonerId}`;
    const response = await axios.get(url, {
      params: { api_key: RIOT_API_KEY },
      timeout: 10000
    });

    setCached(cacheKey, response.data);
    res.json({ entries: response.data, source: 'riot' });
  } catch (error) {
    handleError(res, error, 'getSummonerRank');
  }
});

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🎮 LoL BFF Server Running             ║
║  📍 http://localhost:${PORT}              ║
║  🔑 Riot API Key: ${RIOT_API_KEY.substring(0, 10)}... ║
║  ✓ CORS enabled for localhost:5173    ║
╚════════════════════════════════════════╝
  `);
});
