import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export const useMatchHistory = (steamId: number | null) => {
  if (!steamId) {
    throw new Error("Steam ID is required");
  }
  return useQuery({
    queryKey: ["api-match-history", steamId],
    queryFn: async () => {
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
