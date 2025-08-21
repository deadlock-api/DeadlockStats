import { useQuery } from "@tanstack/react-query";
import { api } from "src/services/api";

export const useEnemyStats = (
  steamId: number | null,
  query?: { minUnixTimestamp?: number | null; minMatchesPlayed?: number },
) => {
  return useQuery({
    queryKey: ["api-enemy-stats", steamId, query?.minUnixTimestamp, query?.minMatchesPlayed],
    queryFn: async () => {
      if (!steamId) {
        return [];
      }
      const response = await api.getEnemyStats(steamId, {
        min_unix_timestamp: query?.minUnixTimestamp ?? undefined,
        min_matches_played: query?.minMatchesPlayed ?? undefined,
      });
      if (response.ok) {
        return response.data;
      } else {
        throw new Error(`Error fetching enemy stats: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 60 * 60 * 1000,
    networkMode: "offlineFirst",
  });
};
