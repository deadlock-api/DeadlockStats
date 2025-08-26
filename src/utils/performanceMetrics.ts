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
 * @param value - The value to format
 * @param minValue - Minimum value in the dataset
 * @param maxValue - Maximum value in the dataset
 * @returns Formatted string for display
 */
export function formatYAxisLabel(value: number, minValue: number, maxValue: number): string {
  // If values are between 0 and 1, format as percentage
  if (0 <= minValue && minValue <= maxValue && maxValue <= 1) {
    return `${(100 * value).toFixed(0)}%`;
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
