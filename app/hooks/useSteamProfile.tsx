import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export const useSteamProfile = (steamId?: number | null) => {
  return useQuery({
    queryKey: ["api-steam-profile", steamId],
    queryFn: async () => {
      if (!steamId) {
        return null;
      }
      const response = await api.getSteamProfile(steamId);
      if (response.ok) {
        return response.data;
      } else {
        throw new Error(`Error fetching steam profile: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    networkMode: "offlineFirst",
    enabled: !!steamId, // Only run query if steamId exists
  });
};
