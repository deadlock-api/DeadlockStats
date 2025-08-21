import { useQuery } from "@tanstack/react-query";
import { api } from "src/services/api";

export const useMatchHistory = (steamId: number | null) => {
  return useQuery({
    queryKey: ["api-match-history", steamId],
    queryFn: async () => {
      if (!steamId) {
        return [];
      }
      const response = await api.getMatchHistory(steamId);
      if (response.ok) {
        return response.data;
      } else {
        throw new Error(`Error fetching match history: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 5 * 60 * 1000,
    networkMode: "offlineFirst",
  });
};
