import type { RankV2 } from "assets-deadlock-api-client";

export interface BadgeInfo {
  tier: number;
  subtier: number;
  rank: RankV2;
}

/**
 * Parses a badge number to extract tier and subtier information
 * Badge format: last digit = subtier, preceding digits = tier
 * @param badgeNumber The badge number to parse
 * @param ranks Array of available ranks
 * @returns BadgeInfo object or null if invalid
 */
export function parseBadgeNumber(badgeNumber: number, ranks: RankV2[]): BadgeInfo | null {
  if (!badgeNumber || badgeNumber <= 0 || !ranks || ranks.length === 0) {
    return null;
  }

  const badgeStr = badgeNumber.toString();

  // Extract subtier (last digit) and tier (preceding digits)
  const subtier = parseInt(badgeStr.slice(-1), 10);
  const tierStr = badgeStr.slice(0, -1);
  const tier = tierStr ? parseInt(tierStr, 10) : 0;

  // Find the corresponding rank
  const rank = ranks.find((r) => r.tier === tier);

  if (!rank) {
    return null;
  }

  return {
    tier,
    subtier,
    rank,
  };
}
