export type Metrics = {
  avg: number;
  std: number;
  percentile1: number;
  percentile5: number;
  percentile10: number;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile90: number;
  percentile95: number;
  percentile99: number;
};

export type PlayerStatsMetrics = {
  [key: string]: Metrics;
};
