const getTimestampMillis = (value) => {
  if (!value) {
    return 0;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }
  if (typeof value.seconds === "number") {
    return value.seconds * 1000;
  }
  return 0;
};

const formatDateTime = (value) => {
  const millis = getTimestampMillis(value);
  if (!millis) {
    return "";
  }

  return new Date(millis).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getMatchTimestamp = (match) => {
  return getTimestampMillis(
    match.guncellenme_tarihi || match.olusturulma_tarihi || match.timestamp
  );
};

const getMatchResult = (match, userId) => {
  const status = (match.durum || "").toLowerCase();
  if (status === "iptal") return "cancelled";
  if (!match.kazanan_id) {
    return "pending";
  }
  return match.kazanan_id === userId ? "won" : "lost";
};

export const buildMatchStats = (matches = [], userId, overrides = null) => {
  const totalMatches = matches.length;
  const wins = matches.filter((match) => match.kazanan_id === userId).length;
  const losses = matches.filter(
    (match) => match.kazanan_id && match.kazanan_id !== userId
  ).length;
  const winRate = totalMatches ? Math.round((wins / totalMatches) * 100) : 0;
  const averagePerformanceRating = totalMatches
    ? Math.round((winRate / 10) * 10) / 10
    : 0;

  let currentStreak = 0;
  let longestWinStreak = 0;
  let activeStreak = 0;
  let activeWin = null;

  const sortedByRecent = [...matches].sort(
    (a, b) => getMatchTimestamp(b) - getMatchTimestamp(a)
  );

  sortedByRecent.forEach((match, index) => {
    if (!match.kazanan_id) {
      return;
    }
    const won = match.kazanan_id === userId;

    if (index === 0) {
      activeWin = won;
      activeStreak = 1;
      return;
    }

    if (activeWin === won) {
      activeStreak += 1;
    } else if (index === 1) {
      currentStreak = activeWin ? activeStreak : -activeStreak;
    }

    if (!activeWin) {
      return;
    }

    longestWinStreak = Math.max(longestWinStreak, activeStreak);
  });

  if (sortedByRecent.length === 1 && activeStreak) {
    currentStreak = activeWin ? activeStreak : -activeStreak;
    if (activeWin) {
      longestWinStreak = Math.max(longestWinStreak, activeStreak);
    }
  }

  const baseStats = {
    totalMatches,
    wins,
    losses,
    winRate,
    currentStreak,
    longestWinStreak,
    averagePerformanceRating,
    averageScore: 0,
    averageKills: 0,
    averageDeaths: 0,
    averageAssists: 0,
  };

  if (!overrides) {
    return baseStats;
  }

  return {
    ...baseStats,
    totalMatches: overrides.totalMatches ?? overrides.total_matches ?? baseStats.totalMatches,
    wins: overrides.wins ?? overrides.kazanmalar ?? baseStats.wins,
    losses: overrides.losses ?? overrides.kaybetmeler ?? baseStats.losses,
    winRate: overrides.winRate ?? overrides.kazanma_orani ?? baseStats.winRate,
    currentStreak: overrides.currentStreak ?? overrides.aktif_seri ?? baseStats.currentStreak,
    longestWinStreak:
      overrides.longestWinStreak ?? overrides.en_uzun_seri ?? baseStats.longestWinStreak,
    averagePerformanceRating:
      overrides.averagePerformanceRating ?? overrides.performans_puani ?? baseStats.averagePerformanceRating,
    averageScore: overrides.averageScore ?? overrides.ortalama_skor ?? baseStats.averageScore,
    averageKills: overrides.averageKills ?? overrides.ortalama_kill ?? baseStats.averageKills,
    averageDeaths: overrides.averageDeaths ?? overrides.ortalama_death ?? baseStats.averageDeaths,
    averageAssists: overrides.averageAssists ?? overrides.ortalama_assist ?? baseStats.averageAssists,
  };
};

export const buildPerformanceTrend = (matches = [], maxPoints = 7) => {
  const sorted = [...matches].sort(
    (a, b) => getMatchTimestamp(a) - getMatchTimestamp(b)
  );
  const recent = sorted.slice(-maxPoints);

  const labels = recent.map((match, index) => {
    const formatted = formatDateTime(match.guncellenme_tarihi || match.olusturulma_tarihi);
    return formatted || `Match ${index + 1}`;
  });

  const data = recent.map((match) => {
    if (typeof match.hedef === "number") {
      return match.hedef;
    }
    if (typeof match.giris_ucreti === "number") {
      return match.giris_ucreti;
    }
    return 0;
  });

  return { labels, data };
};

export const mapMatchesForTable = (matches = [], userId, opponentMap = {}) => {
  const sorted = [...matches].sort(
    (a, b) => getMatchTimestamp(b) - getMatchTimestamp(a)
  );

  return sorted.map((match) => {
    const opponentId =
      match.olusturan_id === userId ? match.katilan_id : match.olusturan_id;
    const opponentName = opponentId
      ? opponentMap[opponentId]?.kullanici_adi || opponentMap[opponentId]?.username
      : null;

    const result = getMatchResult(match, userId);
    const entryFee = typeof match.giris_ucreti === "number" ? match.giris_ucreti : 0;

    // Eğer maç iptal edildiyse, ilgili kullanıcı(oluşturan veya katılan) için iade pozitif olarak gösterilsin
    const rawStatusLower = (match.durum || '').toLowerCase();
    let creditChange = 0;
    if (rawStatusLower === 'iptal') {
      // Eğer current user oluşturan veya katılan ise iade almış demektir
      if (match.olusturan_id === userId || match.katilan_id === userId) {
        creditChange = entryFee; // iade pozitif gösterilir
      } else {
        creditChange = 0;
      }
    } else {
      creditChange = result === "won" ? entryFee : result === "lost" ? -entryFee : 0;
    }

    const rawStatus = (match.durum || "").toLowerCase();
    const status =
      rawStatus === "beklemede" || rawStatus === "oynanıyor"
        ? "pending"
        : rawStatus === "tamamlandi" || rawStatus === "tamamlandı"
          ? "completed"
          : rawStatus === "iptal"
            ? "cancelled"
            : rawStatus || "pending";

    return {
      id: match.id,
      game: match.oyun_turu || "Unknown",
      opponent: opponentName || (match.katilan_id ? "Unknown" : "Waiting"),
      result,
      creditAmount: creditChange,
      creditChange,
      date: formatDateTime(match.guncellenme_tarihi || match.olusturulma_tarihi),
      status,
    };
  });
};

export const mapTransactions = (transactions = [], balanceFallback = null) => {
  return transactions.map((transaction) => {
    const type =
      transaction.tip === "yukleme"
        ? "deposit"
        : transaction.tip === "harcama"
          ? "withdrawal"
          : transaction.tip || "";

    return {
      id: transaction.id,
      type,
      description: transaction.aciklama || "",
      amount: transaction.miktar ?? 0,
      balance: transaction.bakiye ?? balanceFallback,
      date: formatDateTime(transaction.tarih),
      game: transaction.oyun_turu || transaction.game || null,
    };
  });
};

export const buildWalletSummary = (transactions = [], currentBalance = 0) => {
  const totals = transactions.reduce(
    (acc, transaction) => {
      const amount = Number(transaction.miktar) || 0;
      if (amount > 0) {
        acc.totalEarnings += amount;
      }
      if (amount < 0) {
        acc.totalWithdrawals += Math.abs(amount);
      }
      return acc;
    },
    { totalEarnings: 0, totalWithdrawals: 0 }
  );

  return {
    currentBalance,
    totalEarnings: totals.totalEarnings,
    totalWithdrawals: totals.totalWithdrawals,
    pendingTransactions: 0,
  };
};

export { formatDateTime };
