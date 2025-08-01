import type { MatchHistory } from "@/services/api/types/match_history";

/**
 * Filters match history to only include matches from the last 30 days
 * @param matches Array of match history objects
 * @returns Filtered array of matches from the last 30 days
 */
export function filterLast30Days(matches: MatchHistory[]): MatchHistory[] {
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  return matches.filter((match) => match.start_time >= thirtyDaysAgo);
}

/**
 * Calculates win rate percentage from match results
 * @param matches Array of match history objects
 * @returns Win rate as a percentage (0-100)
 */
export function calculateWinRate(matches: MatchHistory[]): number {
  if (matches.length === 0) return 0;

  const wins = matches.filter((match) => match.match_result === 1).length;
  return Math.round((wins / matches.length) * 100);
}

/**
 * Calculates KDA (Kill/Death/Assist) statistics
 * @param matches Array of match history objects
 * @returns Object with total kills, deaths, assists, and KDA ratio
 */
export function calculateKDA(matches: MatchHistory[]): {
  kills: number;
  deaths: number;
  assists: number;
  ratio: number;
} {
  if (matches.length === 0) {
    return { kills: 0, deaths: 0, assists: 0, ratio: 0 };
  }

  const totals = matches.reduce(
    (acc, match) => ({
      kills: acc.kills + match.player_kills,
      deaths: acc.deaths + match.player_deaths,
      assists: acc.assists + match.player_assists,
    }),
    { kills: 0, deaths: 0, assists: 0 },
  );

  // Calculate KDA ratio: (Kills + Assists) / Deaths
  // If deaths is 0, use 1 to avoid division by zero
  const ratio = totals.deaths === 0 ? totals.kills + totals.assists : (totals.kills + totals.assists) / totals.deaths;

  return {
    ...totals,
    ratio: Math.round(ratio * 100) / 100, // Round to 2 decimal places
  };
}

/**
 * Calculates average net worth across all matches
 * @param matches Array of match history objects
 * @returns Average net worth rounded to nearest integer
 */
export function calculateAverageNetWorth(matches: MatchHistory[]): number {
  if (matches.length === 0) return 0;

  const totalNetWorth = matches.reduce((sum, match) => sum + match.net_worth, 0);
  return Math.round(totalNetWorth / matches.length);
}

/**
 * Calculates average match duration in minutes
 * @param matches Array of match history objects
 * @returns Average match duration in minutes, rounded to 1 decimal place
 */
export function calculateAverageMatchDuration(matches: MatchHistory[]): number {
  if (matches.length === 0) return 0;

  const totalDuration = matches.reduce((sum, match) => sum + match.match_duration_s, 0);
  const averageSeconds = totalDuration / matches.length;
  const averageMinutes = averageSeconds / 60;

  return Math.round(averageMinutes * 10) / 10; // Round to 1 decimal place
}

/**
 * Gets most played heroes with their play count and win rate
 * @param matches Array of match history objects
 * @returns Array of hero statistics sorted by play count (descending)
 */
export function getMostPlayedHeroes(matches: MatchHistory[]): Array<{
  heroId: number;
  playCount: number;
  winRate: number;
}> {
  if (matches.length === 0) return [];

  // Group matches by hero_id
  const heroStats = matches.reduce(
    (acc, match) => {
      const heroId = match.hero_id;

      if (!acc[heroId]) {
        acc[heroId] = {
          playCount: 0,
          wins: 0,
        };
      }

      acc[heroId].playCount++;
      if (match.match_result === 1) {
        acc[heroId].wins++;
      }

      return acc;
    },
    {} as Record<number, { playCount: number; wins: number }>,
  );

  // Convert to array and calculate win rates
  return Object.entries(heroStats)
    .map(([heroId, stats]) => ({
      heroId: parseInt(heroId, 10),
      playCount: stats.playCount,
      winRate: Math.round((stats.wins / stats.playCount) * 100),
    }))
    .sort((a, b) => b.playCount - a.playCount); // Sort by play count descending
}

/**
 * Formats a number with appropriate suffixes (K, M, etc.)
 * @param num Number to format
 * @returns Formatted string with suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Formats duration in minutes to a readable string
 * @param minutes Duration in minutes
 * @returns Formatted duration string (e.g., "25.5 min")
 */
export function formatDuration(minutes: number): string {
  return `${minutes} min`;
}
