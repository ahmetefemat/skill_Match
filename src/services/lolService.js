/**
 * League of Legends Data Service
 * Fetches LoL data via Local BFF Server (or Cloud Functions)
 */

const CLOUD_FUNCTION_URL = import.meta.env.VITE_CLOUD_FUNCTION_URL;

if (!CLOUD_FUNCTION_URL) {
  console.error('❌ VITE_CLOUD_FUNCTION_URL not configured in .env');
}

// ============================================
// ERROR HANDLING
// ============================================
const handleApiError = (error, context) => {
  console.error(`[lolService - ${context}]`, error);

  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (status === 404) {
      throw new Error(`${context}: Not found`);
    }
    if (status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    if (status === 403) {
      throw new Error('Access forbidden. Check your API credentials.');
    }
    if (status >= 500) {
      throw new Error(`Server error: ${data?.error || 'Unknown error'}`);
    }

    throw new Error(data?.error || `${context} failed`);
  }

  if (error.message) {
    throw new Error(`${context}: ${error.message}`);
  }

  throw new Error(`${context}: Unknown error`);
};

// ============================================
// 1. GET SUMMONER BY NAME
// ============================================
export const getSummonerByName = async (summonerName) => {
  try {
    if (!summonerName || summonerName.trim() === '') {
      throw new Error('Summoner name is required');
    }

    const response = await fetch(`${CLOUD_FUNCTION_URL}/getSummoner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ summonerName: summonerName.trim() })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`✓ Summoner fetched: ${data.name} (${data.source})`);
    return data;
  } catch (error) {
    handleApiError(error, 'getSummonerByName');
  }
};

// ============================================
// 2. GET CHAMPION MASTERY
// ============================================
export const getChampionMastery = async (summonerId) => {
  try {
    if (!summonerId) {
      throw new Error('Summoner ID is required');
    }

    const response = await fetch(`${CLOUD_FUNCTION_URL}/getChampionMastery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ summonerId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`✓ Champion mastery fetched: ${data.champions.length} champions (${data.source})`);
    return data.champions;
  } catch (error) {
    handleApiError(error, 'getChampionMastery');
  }
};

// ============================================
// 3. GET MATCH HISTORY
// ============================================
export const getMatchHistory = async (puuid, start = 0, count = 20) => {
  try {
    if (!puuid) {
      throw new Error('PUUID is required');
    }

    const response = await fetch(`${CLOUD_FUNCTION_URL}/getMatchHistory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ puuid, start, count })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`✓ Match history fetched: ${data.matches.length} matches (${data.source})`);
    return data.matches;
  } catch (error) {
    handleApiError(error, 'getMatchHistory');
  }
};

// ============================================
// 4. GET MATCH DETAILS
// ============================================
export const getMatchDetails = async (matchId) => {
  try {
    if (!matchId) {
      throw new Error('Match ID is required');
    }

    const response = await fetch(`${CLOUD_FUNCTION_URL}/getMatchDetails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ matchId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`✓ Match details fetched (${data.source})`);
    return data;
  } catch (error) {
    handleApiError(error, 'getMatchDetails');
  }
};

// ============================================
// 5. GET SUMMONER RANK
// ============================================
export const getSummonerRank = async (summonerId) => {
  try {
    if (!summonerId) {
      throw new Error('Summoner ID is required');
    }

    const response = await fetch(`${CLOUD_FUNCTION_URL}/getSummonerRank`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ summonerId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`✓ Rank data fetched (${data.source})`);
    return data.entries;
  } catch (error) {
    handleApiError(error, 'getSummonerRank');
  }
};

// ============================================
// COMPOSITE: Get Complete Player Profile
// ============================================
export const getCompletePlayerProfile = async (summonerName) => {
  try {
    // Step 1: Get summoner basic info
    const summoner = await getSummonerByName(summonerName);

    // Step 2: Get rank info
    const rankEntries = await getSummonerRank(summoner.id);

    // Step 3: Get champion mastery
    const champions = await getChampionMastery(summoner.id);

    // Step 4: Get recent matches
    const matchIds = await getMatchHistory(summoner.puuid, 0, 10);

    return {
      summoner,
      rank: rankEntries.length > 0 ? rankEntries[0] : null,
      topChampions: champions.slice(0, 5), // Top 5 champions
      recentMatches: matchIds
    };
  } catch (error) {
    handleApiError(error, 'getCompletePlayerProfile');
  }
};

// ============================================
// HEALTH CHECK
// ============================================
export const healthCheck = async () => {
  try {
    const response = await fetch(`${CLOUD_FUNCTION_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Health check failed: HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✓ Cloud Functions healthy:', data);
    return data;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return null;
  }
};
