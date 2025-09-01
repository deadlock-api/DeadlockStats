import { useQuery } from "@tanstack/react-query";
import type { AnalyticsApiPlayerStatsMetricsRequest } from "deadlock-api-client/api";
import { api } from "src/services/api";

export const usePlayerStatsMetrics = (query: AnalyticsApiPlayerStatsMetricsRequest) => {
  return useQuery({
    queryKey: ["api-player-stats-metrics", query],
    queryFn: async () => {
      const response = await api.analytics_api.playerStatsMetrics(query);
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        throw new Error(`Error fetching player stats metrics: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 60 * 60 * 1000,
  });
};
