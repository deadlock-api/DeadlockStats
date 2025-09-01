import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { PlayersApiSteamRequest, PlayersApiSteamSearchRequest } from "deadlock-api-client/api";
import { api } from "src/services/api";

export const useSteamProfile = (query: PlayersApiSteamRequest) => {
  return useQuery({
    queryKey: ["api-steam-profile", query],
    queryFn: async () => {
      if (!query.accountId) return null;
      const response = await api.players_api.steam(query);
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Error fetching steam profile: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 60 * 60 * 1000,
    networkMode: "offlineFirst",
  });
};

export const useSearchSteamProfile = (query: PlayersApiSteamSearchRequest) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["api-steam-profile-search", query],
    queryFn: async () => {
      if (!query || query.searchQuery.length < 3) {
        return [];
      }
      const response = await api.players_api.steamSearch(query);
      if (response.status === 200 && response.data) {
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
