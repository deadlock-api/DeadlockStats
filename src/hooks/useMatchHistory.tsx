import { useQuery } from "@tanstack/react-query";
import type { PlayersApiMatchHistoryRequest } from "deadlock-api-client/api";
import { api } from "src/services/api";

export const useMatchHistory = (query: PlayersApiMatchHistoryRequest) => {
  return useQuery({
    queryKey: ["api-match-history", query],
    queryFn: async () => {
      if (!query.accountId) return [];
      const response = await api.players_api.matchHistory(query);
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Error fetching match history: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};
