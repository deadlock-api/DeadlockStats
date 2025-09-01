import { useQuery } from "@tanstack/react-query";
import type { PlayersApiMateStatsRequest } from "deadlock-api-client/api";
import { api } from "src/services/api";

export const useMateStats = (query: PlayersApiMateStatsRequest) => {
  return useQuery({
    queryKey: ["api-mate-stats", query],
    queryFn: async () => {
      if (!query?.accountId) return [];
      const response = await api.players_api.mateStats(query);
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Error fetching mate stats: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 60 * 60 * 1000,
    networkMode: "offlineFirst",
  });
};
