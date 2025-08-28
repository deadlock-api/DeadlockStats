import type { Metrics } from "src/services/api/types/player_stats_metrics";

export const NAMES_MAP: Record<string, string> = {
  accuracy: "Accuracy",
  assists: "Assists",
  boss_damage: "Boss Dmg",
  boss_damage_per_min: "Boss Dmg/min",
  crit_shot_rate: "Crit Rate",
  deaths: "Deaths",
  denies: "Denies",
  healing: "Healing",
  healing_per_min: "Heal/min",
  kd: "K/D",
  kda: "KDA",
  kills: "Kills",
  kills_plus_assists: "Kill-Participation",
  last_hits: "Last Hits",
  net_worth: "Net Worth",
  net_worth_per_min: "Net/min",
  neutral_damage: "Neutral Dmg",
  neutral_damage_per_min: "Neutral Dmg/min",
  player_damage: "Player Dmg",
  player_damage_per_health: "Dmg/Health",
  player_damage_per_min: "Player Dmg/min",
  player_damage_taken_per_min: "Dmg Taken/min",
  player_healing: "Player Heal",
  player_healing_per_min: "Player Heal/min",
  self_healing: "Self Heal",
  self_healing_per_min: "Self Heal/min",
};
export const LOWER_IS_BETTER_NAMES: Set<keyof typeof NAMES_MAP> = new Set(["Deaths", "Dmg Taken/min"]);

/**
 * Chart data point for performance visualization
 */
export interface ChartDataPoint extends Record<string, unknown> {
  percentile: number;
  community: number;
  player: number;
}

/**
 * Calculates the min and max values from chart data
 * @param data - Chart data points
 * @returns Object with min and max values
 */
export function calculateDataRange(data: ChartDataPoint[]): { minValue: number; maxValue: number } {
  const minValue = Math.min(...data.map((d) => d.community));
  const maxValue = Math.max(...data.map((d) => d.community));
  return { minValue, maxValue };
}

/**
 * Formats Y-axis labels for the chart based on value range
 * @param minValue - Minimum value in the dataset
 * @param maxValue - Maximum value in the dataset
 * @param value - The value to format
 * @returns Formatted string for display
 */
export function formatYAxisLabel(minValue: number, maxValue: number, value: number): string {
  // If values are between 0 and 1, format as percentage
  if (0 <= minValue && minValue <= maxValue && maxValue <= 1) {
    return `${(100 * value).toFixed(0)}%`;
  }

  // if values are between -100 and 100, format as decimal
  if (-100 <= minValue && minValue <= maxValue && maxValue <= 100) {
    return value.toFixed(2);
  }

  // If values are >= 1000, format with 'k' suffix
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value < 10000 ? 1 : 0)}k`;
  }

  // Default formatting for other values
  return value.toFixed(0);
}

/**
 * Formats X-axis labels for percentile display
 * @param value - The percentile value
 * @returns Formatted string with percentage symbol
 */
export function formatXAxisLabel(value: number): string {
  return `${value}%`;
}

export const getCommunityPercentileRank = (value: number, communityMetrics: Metrics, isLowerBetter: boolean) => {
  const keyToPercentile = (k: keyof Metrics) => Number(k.replace("percentile", ""));
  let pcts = Object.keys(communityMetrics).filter((k) => k.startsWith("percentile")) as (keyof Metrics)[];

  if (isLowerBetter) pcts = pcts.sort((a, b) => keyToPercentile(a) - keyToPercentile(b));
  else pcts = pcts.sort((a, b) => keyToPercentile(b) - keyToPercentile(a));

  let [lowerBound, upperBound]: [keyof Metrics, keyof Metrics] = isLowerBetter
    ? ["percentile1", "percentile99"]
    : ["percentile99", "percentile1"];
  for (let i = 0; i < pcts.length - 1; i++) {
    if (
      isLowerBetter
        ? communityMetrics[pcts[i]] <= value && value <= communityMetrics[pcts[i + 1]]
        : communityMetrics[pcts[i]] > value && value > communityMetrics[pcts[i + 1]]
    ) {
      lowerBound = pcts[i];
      upperBound = pcts[i + 1];
      break;
    }
  }
  // Linear Interpolation
  const [y1, y2] = [communityMetrics[lowerBound], communityMetrics[upperBound]];
  const [x1, x2] = [keyToPercentile(lowerBound), keyToPercentile(upperBound)];
  const m = (y2 - y1) / (x2 - x1);
  const b = y1 - m * x1;
  const x = (value - b) / m;
  return isLowerBetter ? 100 - x : x;
};
