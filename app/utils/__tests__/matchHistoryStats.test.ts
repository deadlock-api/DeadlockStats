import type { MatchHistory } from "@/services/api/types/match_history";
import {
  calculateAverageMatchDuration,
  calculateAverageNetWorth,
  calculateKDA,
  calculateWinRate,
  filterLast7Days,
  formatDuration,
  formatMatchDuration,
  formatNumber,
  formatRelativeTime,
  getHeroStats,
  isMatchWon
} from "../matchHistoryStats";

// Mock match history data for testing
const mockMatches: MatchHistory[] = [
  {
    account_id: 123,
    match_id: 1,
    hero_id: 1,
    hero_level: 25,
    start_time: Math.floor(Date.now() / 1000) - 10 * 24 * 60 * 60, // 10 days ago
    game_mode: 1,
    match_mode: 1,
    player_team: 0,
    player_kills: 10,
    player_deaths: 5,
    player_assists: 8,
    denies: 20,
    net_worth: 25000,
    last_hits: 150,
    team_abandoned: false,
    abandoned_time_s: null,
    match_duration_s: 1800, // 30 minutes
    match_result: 0, // win (player_team === match_result)
    objectives_mask_team0: 0,
    objectives_mask_team1: 0,
  },
  {
    account_id: 123,
    match_id: 2,
    hero_id: 2,
    hero_level: 20,
    start_time: Math.floor(Date.now() / 1000) - 20 * 24 * 60 * 60, // 20 days ago
    game_mode: 1,
    match_mode: 1,
    player_team: 1,
    player_kills: 5,
    player_deaths: 10,
    player_assists: 12,
    denies: 15,
    net_worth: 18000,
    last_hits: 120,
    team_abandoned: false,
    abandoned_time_s: null,
    match_duration_s: 2400, // 40 minutes
    match_result: 0, // loss (player_team !== match_result)
    objectives_mask_team0: 0,
    objectives_mask_team1: 0,
  },
];

describe("matchHistoryStats", () => {
  describe("formatMatchDuration", () => {
    it("should format seconds to MM:SS format", () => {
      expect(formatMatchDuration(1800)).toBe("30:00");
      expect(formatMatchDuration(2465)).toBe("41:05");
      expect(formatMatchDuration(65)).toBe("1:05");
    });
  });

  describe("isMatchWon", () => {
    it("should return true when player_team equals match_result", () => {
      const winMatch = { ...mockMatches[0], player_team: 0, match_result: 0 };
      expect(isMatchWon(winMatch)).toBe(true);
    });

    it("should return false when player_team does not equal match_result", () => {
      const lossMatch = { ...mockMatches[1], player_team: 1, match_result: 0 };
      expect(isMatchWon(lossMatch)).toBe(false);
    });
  });

  describe("formatRelativeTime", () => {
    const now = Math.floor(Date.now() / 1000);

    it("should format recent times correctly", () => {
      expect(formatRelativeTime(now - 30)).toBe("Just now");
      expect(formatRelativeTime(now - 120)).toBe("2 minutes ago");
      expect(formatRelativeTime(now - 3600)).toBe("1 hour ago");
      expect(formatRelativeTime(now - 7200)).toBe("2 hours ago");
      expect(formatRelativeTime(now - 86400)).toBe("1 day ago");
      expect(formatRelativeTime(now - 172800)).toBe("2 days ago");
      expect(formatRelativeTime(now - 604800)).toBe("1 week ago");
    });

    it("should format old dates as absolute dates", () => {
      const oldTimestamp = now - 30 * 24 * 60 * 60; // 30 days ago
      const result = formatRelativeTime(oldTimestamp);
      // Should be a date format (handles different locales)
      expect(result).toMatch(/\d{1,2}[./]\d{1,2}[./]\d{4}/);
    });
  });

  describe("filterLast30Days", () => {
    it("should filter matches to only include those from the last 30 days", () => {
      const result = filterLast7Days(mockMatches);
      expect(result).toHaveLength(2);
      expect(result.map((m) => m.match_id)).toEqual([1, 2]);
    });

    it("should return empty array for empty input", () => {
      const result = filterLast7Days([]);
      expect(result).toEqual([]);
    });
  });

  describe("calculateWinRate", () => {
    it("should calculate correct win rate percentage", () => {
      const matches = [
        { ...mockMatches[0], player_team: 0, match_result: 0 }, // win
        { ...mockMatches[1], player_team: 1, match_result: 0 }, // loss
      ];
      const result = calculateWinRate(matches);
      expect(result).toBe(50); // 1 win out of 2 matches = 50%
    });

    it("should return 0 for empty matches", () => {
      const result = calculateWinRate([]);
      expect(result).toBe(0);
    });
  });

  describe("calculateKDA", () => {
    it("should calculate correct KDA statistics", () => {
      const result = calculateKDA(mockMatches);

      expect(result.kills).toBe(15); // 10 + 5
      expect(result.deaths).toBe(15); // 5 + 10
      expect(result.assists).toBe(20); // 8 + 12
      expect(result.ratio).toBe(2.33); // (15 + 20) / 15 = 2.33
    });

    it("should handle zero deaths correctly", () => {
      const noDeathsMatches = mockMatches.map((m) => ({ ...m, player_deaths: 0 }));
      const result = calculateKDA(noDeathsMatches);

      expect(result.deaths).toBe(0);
      expect(result.ratio).toBe(result.kills + result.assists); // Should not divide by zero
    });

    it("should return zeros for empty matches", () => {
      const result = calculateKDA([]);
      expect(result).toEqual({ kills: 0, deaths: 0, assists: 0, ratio: 0 });
    });
  });

  describe("calculateAverageNetWorth", () => {
    it("should calculate correct average net worth", () => {
      const result = calculateAverageNetWorth(mockMatches);
      expect(result).toBe(21500); // (25000 + 18000) / 2 = 21500
    });

    it("should return 0 for empty matches", () => {
      const result = calculateAverageNetWorth([]);
      expect(result).toBe(0);
    });
  });

  describe("calculateAverageMatchDuration", () => {
    it("should calculate correct average duration in minutes", () => {
      const result = calculateAverageMatchDuration(mockMatches);
      expect(result).toBe(35.0); // (1800 + 2400) / 2 / 60 = 35 minutes
    });

    it("should return 0 for empty matches", () => {
      const result = calculateAverageMatchDuration([]);
      expect(result).toBe(0);
    });
  });

  describe("getMostPlayedHeroes", () => {
    it("should return heroes sorted by play count", () => {
      const matches = [
        { ...mockMatches[0], hero_id: 1, player_team: 0, match_result: 0 }, // Hero 1 win
        { ...mockMatches[1], hero_id: 1, player_team: 0, match_result: 0 }, // Hero 1 win
        { ...mockMatches[0], hero_id: 2, player_team: 1, match_result: 0 }, // Hero 2 loss
      ];

      const result = getHeroStats(matches);

      expect(result).toHaveLength(2);
      expect(result[0].heroId).toBe(1); // Hero 1 played 2 times
      expect(result[0].playCount).toBe(2);
      expect(result[0].winRate).toBe(100); // 2 wins out of 2 matches

      expect(result[1].heroId).toBe(2); // Hero 2 played 1 time
      expect(result[1].playCount).toBe(1);
      expect(result[1].winRate).toBe(0); // 0 wins out of 1 match
    });

    it("should return empty array for empty matches", () => {
      const result = getHeroStats([]);
      expect(result).toEqual([]);
    });
  });

  describe("formatNumber", () => {
    it("should format large numbers with suffixes", () => {
      expect(formatNumber(1500)).toBe("1.5K");
      expect(formatNumber(1500000)).toBe("1.5M");
      expect(formatNumber(500)).toBe("500");
    });
  });

  describe("formatDuration", () => {
    it("should format duration with min suffix", () => {
      expect(formatDuration(25.5)).toBe("25.5 min");
      expect(formatDuration(60)).toBe("60 min");
    });
  });
});
