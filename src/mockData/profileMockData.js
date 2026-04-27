/**
 * Mock Data for User Profile
 * Structure mirrors future Firebase/Backend API responses
 * TODO: Replace with real Firebase/API calls when backend is ready
 */

// TODO: Replace mockUserProfile with real user profile from Firebase
export const mockUserProfile = {
  id: 'user_001',
  username: 'ShadowPlayer',
  email: 'player@skillmatch.io',
  avatarUrl: null, // Will be replaced with Firebase Storage URL
  rank: 'Diamond',
  level: 47,
  tier: 'Premium',
  riotId: 'ShadowPlayer#RANK1',
  steamId: '76561198034567890',
  joinDate: '2024-01-15',
  bio: 'Competitive esports player | Always grinding | LFT',
  balance: 5420,
  totalEarned: 8750,
  totalSpent: 3330,
  isVerified: true,
  lastActive: '2 minutes ago',
};

// TODO: Replace mockProfileStats with real player statistics from Firebase
export const mockProfileStats = {
  totalMatches: 47,
  wins: 33,
  losses: 14,
  draws: 0,
  winRate: 70,
  currentStreak: 5, // positive = win streak
  longestWinStreak: 12,
  averageKills: 8.5,
  averageDeaths: 4.2,
  averageAssists: 6.8,
  kda: 2.02,
  averageScore: 1980,
  totalHoursPlayed: 342,
  favoriteGame: 'Valorant',
  favoriteRole: 'Duelist',
};

// TODO: Replace mockLinkedAccounts with real linked accounts from Firebase
export const mockLinkedAccounts = [
  {
    id: 'riot_001',
    platform: 'Riot Games',
    username: 'ShadowPlayer#RANK1',
    icon: '🎮',
    connected: true,
    connectedDate: '2024-01-15',
    verificationStatus: 'verified',
    accountUrl: null,
  },
  {
    id: 'steam_001',
    platform: 'Steam',
    username: 'ShadowPlayer',
    icon: '🎯',
    connected: true,
    connectedDate: '2024-01-20',
    verificationStatus: 'verified',
    accountUrl: 'https://steamcommunity.com/profiles/76561198034567890',
  },
];

// TODO: Replace mockWalletData with real wallet transactions from Firebase
export const mockWalletData = {
  currentBalance: 5420,
  totalDeposits: 10000,
  totalEarnings: 8750,
  totalWithdrawals: 12330,
  pendingTransactions: 0,
  lastUpdated: Date.now(),
};

// TODO: Replace mockTransactionHistory with real transaction history from Firebase
export const mockTransactionHistory = [
  {
    id: 'txn_001',
    type: 'win', // 'win', 'deposit', 'withdrawal', 'bonus'
    description: 'Won match vs ProPlayer_99',
    amount: 250,
    balance: 5420,
    date: '2 hours ago',
    timestamp: Date.now() - 2 * 3600000,
    status: 'completed',
    game: 'Valorant',
  },
  {
    id: 'txn_002',
    type: 'loss',
    description: 'Lost match vs SniperX',
    amount: -100,
    balance: 5170,
    date: '1 day ago',
    timestamp: Date.now() - 24 * 3600000,
    status: 'completed',
    game: 'CS:GO',
  },
  {
    id: 'txn_003',
    type: 'deposit',
    description: 'Credit deposit',
    amount: 1000,
    balance: 5270,
    date: '3 days ago',
    timestamp: Date.now() - 3 * 24 * 3600000,
    status: 'completed',
    game: null,
  },
  {
    id: 'txn_004',
    type: 'win',
    description: 'Won match vs MidLaneKing',
    amount: 180,
    balance: 4270,
    date: '5 days ago',
    timestamp: Date.now() - 5 * 24 * 3600000,
    status: 'completed',
    game: 'League of Legends',
  },
];

// TODO: Replace mockProfileMatches with real recent match history from Firebase
export const mockProfileMatches = [
  {
    id: 'match_001',
    game: 'Valorant',
    opponent: 'ProPlayer_99',
    result: 'won',
    creditAmount: 250,
    date: '2 hours ago',
    timestamp: Date.now() - 2 * 3600000,
    status: 'completed',
    mapName: 'Haven',
    kills: 18,
    deaths: 5,
    assists: 8,
    score: 2100,
    duration: '35m 20s',
  },
  {
    id: 'match_002',
    game: 'CS:GO',
    opponent: 'SniperX',
    result: 'lost',
    creditAmount: -100,
    date: '1 day ago',
    timestamp: Date.now() - 24 * 3600000,
    status: 'completed',
    mapName: 'Mirage',
    kills: 12,
    deaths: 16,
    assists: 3,
    score: 1850,
    duration: '42m 15s',
  },
  {
    id: 'match_003',
    game: 'League of Legends',
    opponent: 'MidLaneKing',
    result: 'won',
    creditAmount: 180,
    date: '3 days ago',
    timestamp: Date.now() - 3 * 24 * 3600000,
    status: 'completed',
    mapName: 'Summoner\'s Rift',
    kills: 7,
    deaths: 2,
    assists: 15,
    score: 1950,
    duration: '28m 45s',
  },
];

// TODO: Replace mockAchievements with real achievements from Firebase
export const mockAchievements = [
  {
    id: 'ach_001',
    name: '30 Wins',
    description: 'Won 30 matches',
    icon: '🏆',
    unlockedDate: '2024-04-15',
    rarity: 'common',
  },
  {
    id: 'ach_002',
    name: 'Diamond Rank',
    description: 'Reached Diamond rank',
    icon: '💎',
    unlockedDate: '2024-03-22',
    rarity: 'rare',
  },
  {
    id: 'ach_003',
    name: 'First Blood',
    description: 'Won 10 consecutive matches',
    icon: '⚡',
    unlockedDate: '2024-04-01',
    rarity: 'epic',
  },
];
