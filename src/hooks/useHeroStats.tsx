import { useQuery } from "@tanstack/react-query";
import type { PlayersApiPlayerHeroStatsRequest } from "deadlock-api-client/api";
import { api } from "src/services/api";

export const useHeroStats = (query: PlayersApiPlayerHeroStatsRequest) => {
  return useQuery({
    queryKey: ["api-hero-stats", query],
    queryFn: async () => {
      if (!query.accountIds || !query.accountIds[0]) return [];
      const response = await api.players_api.playerHeroStats(query);
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Error fetching hero stats: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 60 * 60 * 1000,
  });
};
