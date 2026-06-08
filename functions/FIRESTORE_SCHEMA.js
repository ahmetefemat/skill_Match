/**
 * FIRESTORE CACHE SCHEMA
 * League of Legends Data Cache Structure
 */

/*
Collection: lol_cache
Purpose: Cache Riot API responses to avoid rate limiting

Document ID Examples:
- summoner_drakos
- summoner_doublelift
- mastery_AbCd1234EfGh5678
- matches_AbCd1234EfGh5678_0_20
- match_na1_12345678-1234-5678-1234-567890abcdef
- rank_AbCd1234EfGh5678

Document Structure:
{
  data: {
    // Actual API response data (varies by type)
  },
  cached_at: Timestamp,
  ttl: number (milliseconds) - optional, for fine-grained cache expiry
}

CACHE ENTRIES:

1. SUMMONER CACHE
   Doc ID: summoner_{summonerName.toLowerCase()}
   TTL: 1 hour (players don't change level/name often)
   Data: {
     id: string,
     name: string,
     profileIconId: number,
     summonerLevel: number,
     puuid: string
   }

2. CHAMPION MASTERY CACHE
   Doc ID: mastery_{summonerId}
   TTL: 1 hour (mastery updates slowly)
   Data: Array of {
     championId: number,
     championLevel: number,
     championPoints: number,
     lastPlayTime: number
   }

3. MATCH HISTORY CACHE
   Doc ID: matches_{puuid}_{start}_{count}
   TTL: 30 minutes (recent matches change)
   Data: Array of match IDs [
     "na1_12345678-...",
     "na1_87654321-...",
     ...
   ]

4. MATCH DETAILS CACHE
   Doc ID: match_{matchId}
   TTL: infinite (matches never change)
   Data: {
     metadata: { dataVersion, matchId, participants, platformId, timestamp, tournamentCode },
     info: {
       appId: number,
       gameDuration: number,
       gameEndTimestamp: number,
       gameId: number,
       gameMode: string,
       gameName: string,
       gameStartTimestamp: number,
       gameType: string,
       gameVersion: string,
       mapId: number,
       participants: Array<ParticipantData>,
       platformId: string,
       queueId: number,
       tournamentCode: string
     }
   }

5. RANK DATA CACHE
   Doc ID: rank_{summonerId}
   TTL: 30 minutes (rank updates on games)
   Data: Array of {
     summonerId: string,
     queueType: string (RANKED_SOLO_5x5, RANKED_FLEX_SR, etc),
     tier: string (DIAMOND, PLATINUM, GOLD, etc),
     rank: string (I, II, III, IV),
     leaguePoints: number,
     wins: number,
     losses: number,
     hotStreak: boolean
   }

TTL STRATEGY:
- Summoner info: 1 hour (players rarely rename)
- Champion mastery: 1 hour (updates slowly)
- Match history: 30 minutes (changes frequently)
- Match details: never expires (immutable)
- Rank data: 30 minutes (updates on games)

Cache Invalidation (Future Enhancement):
- Automatic cleanup job to remove expired documents
- Manual cache clear via admin function
- User-triggered refresh option in UI
*/

// Firestore Rules for lol_cache collection:
/*
rules_version = '2';

match /databases/{database}/documents {
  // Public read, admin write for LoL cache
  match /lol_cache/{document=**} {
    allow read: if true;
    allow write: if request.auth != null && request.auth.token.admin == true;
  }
}
*/
