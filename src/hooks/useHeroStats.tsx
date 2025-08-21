import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export const useHeroStats = (steamId: number | null, minUnixTimestamp?: number | null) => {
  return useQuery({
    queryKey: ["api-hero-stats", steamId, minUnixTimestamp],
    queryFn: async () => {
      if (!steamId) {
        return [];
      }
      const response = await api.getHeroStats(steamId, minUnixTimestamp);
      if (response.ok) {
        return response.data;
      } else {
        throw new Error(`Error fetching hero stats: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 60 * 60 * 1000,
    networkMode: "offlineFirst",
  });
};
