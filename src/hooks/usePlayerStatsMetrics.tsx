import { useQuery } from "@tanstack/react-query";
import { api } from "src/services/api";

export const usePlayerStatsMetrics = (minUnixTimestamp?: number | null, steamId?: number | null) => {
  return useQuery({
    queryKey: ["api-player-stats-metrics", minUnixTimestamp, steamId],
    queryFn: async () => {
      const response = await api.getPlayerStatsMetrics(minUnixTimestamp, steamId);
      if (response.ok && response.data) {
        return response.data;
      } else {
        throw new Error(`Error fetching player stats metrics: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 60 * 60 * 1000,
  });
};
