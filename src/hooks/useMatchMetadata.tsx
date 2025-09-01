import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { MatchesApiMetadataRequest } from "deadlock-api-client/api";
import { api } from "src/services/api";
import type { MatchMetadata } from "src/services/api/types/match_metadata";

export const useMatchMetadata = (query: MatchesApiMetadataRequest) => {
  return useQuery({
    queryKey: ["api-match-metadata", query],
    queryFn: async () => {
      if (!query.matchId) return null;
      const response = (await api.matches_api.metadata(query)) as unknown as AxiosResponse<MatchMetadata>;
      if (response.status === 200) {
        return response.data?.match_info;
      } else {
        throw new Error(`Error fetching match metadata: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 60 * 60 * 1000,
  });
};
