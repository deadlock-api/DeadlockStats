import type { Rank } from "src/services/assets-api/types/rank";

export interface BadgeInfo {
  tier: number;
  subtier: number;
  rank: Rank;
}

/**
 * Parses a badge number to extract tier and subtier information
 * Badge format: last digit = subtier, preceding digits = tier
 * @param badgeNumber The badge number to parse
 * @param ranks Array of available ranks
 * @returns BadgeInfo object or null if invalid
 */
export function parseBadgeNumber(badgeNumber: number, ranks: Rank[]): BadgeInfo | null {
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

/**
 * Calculates the average badge for a team
 * @param playerBadges Array of badge numbers from team players
 * @returns Average badge number rounded to nearest integer
 */
export function calculateAverageBadge(playerBadges: (number | undefined)[]): number | undefined {
  const validBadges = playerBadges.filter((badge): badge is number => badge !== undefined && badge > 0);

  if (validBadges.length === 0) {
    return undefined;
  }

  const sum = validBadges.reduce((acc, badge) => acc + badge, 0);
  return Math.round(sum / validBadges.length);
}

/**
 * Gets the display name for a badge
 * @param badgeNumber The badge number
 * @param ranks Array of available ranks
 * @returns Display name string
 */
export function getBadgeDisplayName(badgeNumber: number | undefined, ranks: Rank[]): string {
  if (!badgeNumber || !ranks) {
    return "Unranked";
  }

  const badgeInfo = parseBadgeNumber(badgeNumber, ranks);
  if (!badgeInfo) {
    return "Unranked";
  }

  return badgeInfo.subtier > 0 ? `${badgeInfo.rank.name} ${badgeInfo.subtier}` : badgeInfo.rank.name;
}

/**
 * Compares two badge numbers for sorting
 * @param a First badge number
 * @param b Second badge number
 * @returns Comparison result for sorting (higher badges first)
 */
export function compareBadges(a: number | undefined, b: number | undefined): number {
  // Treat undefined as 0 for comparison
  const badgeA = a ?? 0;
  const badgeB = b ?? 0;

  return badgeB - badgeA; // Higher badges first
}
