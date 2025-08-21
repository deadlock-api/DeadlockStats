import { useQuery } from "@tanstack/react-query";
import { api } from "src/services/api";

export const useMateStats = (
  steamId: number | null,
  query?: { minUnixTimestamp?: number | null; sameParty?: boolean; minMatchesPlayed?: number },
) => {
  return useQuery({
    queryKey: ["api-mate-stats", steamId, query?.minUnixTimestamp, query?.sameParty, query?.minMatchesPlayed],
    queryFn: async () => {
      if (!steamId) {
        return [];
      }
      const response = await api.getMateStats(steamId, {
        min_unix_timestamp: query?.minUnixTimestamp ?? undefined,
        same_party: query?.sameParty ?? false,
        min_matches_played: query?.minMatchesPlayed ?? undefined,
      });
      if (response.ok) {
        return response.data;
      } else {
        throw new Error(`Error fetching mate stats: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 60 * 60 * 1000,
    networkMode: "offlineFirst",
  });
};
