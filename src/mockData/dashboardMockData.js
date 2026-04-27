/**
 * Mock Data for Dashboard
 * Structure mirrors future Firebase/Backend API responses
 * TODO: Replace with real Firebase/API calls when backend is ready
 */

// TODO: Replace mockUser with Firebase user data from authContext
export const mockUser = {
  id: 'user_001',
  username: 'ShadowPlayer',
  email: 'player@skillmatch.io',
  avatarUrl: null, // Will be replaced with Firebase Storage URL
  balance: 5420,
  rank: 'Diamond',
  riotId: 'ShadowPlayer#RANK1', // Valorant example
  steamId: '76561198034567890', // CS:GO example
  joinDate: '2024-01-15',
  tier: 'Premium',
};

// TODO: Replace mockStats with real statistics from Firebase/Firestore
export const mockStats = {
  totalMatches: 47,
  wins: 33,
  losses: 14,
  winRate: 70, // percentage
  draws: 0,
  currentStreak: 5, // positive = win streak, negative = loss streak
  longestWinStreak: 12,
  averageKills: 8.5,
  averageDeaths: 4.2,
  kda: 2.02, // kill death assist ratio
  averagePerformanceRating: 8.5, // out of 10
  totalCreditsEarned: 8750,
  totalCreditsSpent: 3330,
  mostPlayedGame: 'Valorant',
  favoriteRole: 'Duelist',
};

// TODO: Replace mockChartData with real performance metrics from backend
export const mockChartData = {
  winLoss: {
    wins: 33,
    losses: 14,
  },
  performanceTrend: {
    labels: ['Match 1', 'Match 2', 'Match 3', 'Match 4', 'Match 5', 'Match 6', 'Match 7'],
    data: [2100, 2350, 1850, 2150, 2400, 1950, 2500],
  },
  weeklyWinRate: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
    data: [65, 70, 68, 75, 78, 72, 80],
  },
  killTrend: {
    labels: ['Match 1', 'Match 2', 'Match 3', 'Match 4', 'Match 5', 'Match 6', 'Match 7'],
    data: [18, 21, 12, 16, 24, 14, 25],
  },
};

// TODO: Replace mockRecentMatches with real match history from Firebase/API
export const mockRecentMatches = [
  {
    id: 'match_001',
    game: 'Valorant',
    opponent: 'ProPlayer_99',
    result: 'won', // 'won' | 'lost' | 'draw'
    creditAmount: 250,
    creditChange: 250,
    date: '2 hours ago',
    timestamp: Date.now() - 2 * 3600000,
    status: 'completed', // 'completed' | 'pending' | 'disputed'
    mapName: 'Haven',
    kills: 18,
    deaths: 5,
    assists: 8,
    score: 2100,
    duration: '35m 20s',
    matchUrl: null, // Will link to match details page
  },
  {
    id: 'match_002',
    game: 'CS:GO',
    opponent: 'SniperX',
    result: 'lost',
    creditAmount: -100,
    creditChange: -100,
    date: '1 day ago',
    timestamp: Date.now() - 24 * 3600000,
    status: 'completed',
    mapName: 'Mirage',
    kills: 12,
    deaths: 16,
    assists: 3,
    score: 1850,
    duration: '42m 15s',
    matchUrl: null,
  },
  {
    id: 'match_003',
    game: 'League of Legends',
    opponent: 'MidLaneKing',
    result: 'won',
    creditAmount: 180,
    creditChange: 180,
    date: '3 days ago',
    timestamp: Date.now() - 3 * 24 * 3600000,
    status: 'completed',
    mapName: 'Summoner\'s Rift',
    kills: 7,
    deaths: 2,
    assists: 15,
    score: 1950,
    duration: '28m 45s',
    matchUrl: null,
  },
  {
    id: 'match_004',
    game: 'Valorant',
    opponent: 'PhantomAgent',
    result: 'won',
    creditAmount: 200,
    creditChange: 200,
    date: '5 days ago',
    timestamp: Date.now() - 5 * 24 * 3600000,
    status: 'completed',
    mapName: 'Bind',
    kills: 21,
    deaths: 7,
    assists: 4,
    score: 2350,
    duration: '31m 10s',
    matchUrl: null,
  },
];

// TODO: Add more mock data as needed
export const mockWalletData = {
  currentBalance: 5420,
  totalDeposits: 15000,
  totalWithdrawals: 9580,
  pendingTransactions: 0,
  lastUpdated: Date.now(),
};

export const mockNotifications = [
  {
    id: 'notif_001',
    type: 'match_result', // 'match_result' | 'achievement' | 'system'
    title: 'Victory!',
    message: 'You won against ProPlayer_99',
    read: false,
    timestamp: Date.now() - 5000,
  },
  {
    id: 'notif_002',
    type: 'achievement',
    title: 'Milestone Unlocked',
    message: 'You\'ve reached 30 wins!',
    read: true,
    timestamp: Date.now() - 3600000,
  },
];
