import { useQuery, useQueryClient } from "@tanstack/react-query";
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
    staleTime: 60 * 60 * 1000,
    networkMode: "offlineFirst",
    enabled: !!steamId, // Only run query if steamId exists
  });
};

export const useSearchSteamProfile = (searchQuery?: string | null) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["api-steam-profile-search", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 3) {
        return [];
      }
      const response = await api.searchSteamProfile(searchQuery);
      if (response.ok && response.data) {
        // Cache the results in the query client
        for (const profile of response.data) {
          queryClient.setQueryData(["api-steam-profile", profile.account_id], profile);
        }
        return response.data;
      } else {
        throw new Error(`Error fetching steam profile: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 60 * 60 * 1000,
    networkMode: "offlineFirst",
  });
};
