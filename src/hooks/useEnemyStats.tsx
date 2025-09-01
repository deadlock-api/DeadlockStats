import { useQuery } from "@tanstack/react-query";
import type { PlayersApiEnemyStatsRequest } from "deadlock-api-client/api";
import { api } from "src/services/api";

export const useEnemyStats = (query: PlayersApiEnemyStatsRequest) => {
  return useQuery({
    queryKey: ["api-enemy-stats", query],
    queryFn: async () => {
      if (!query.accountId) return [];
      const response = await api.players_api.enemyStats(query);
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Error fetching enemy stats: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 60 * 60 * 1000,
    networkMode: "offlineFirst",
  });
};
