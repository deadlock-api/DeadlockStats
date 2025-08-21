import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export const useMatchMetadata = (matchId?: number | null) => {
  return useQuery({
    queryKey: ["api-match-metadata", matchId],
    queryFn: async () => {
      if (!matchId) {
        return null;
      }
      const response = await api.getMatchMetadata(matchId);
      if (response.ok) {
        return response.data?.match_info;
      } else {
        throw new Error(`Error fetching match metadata: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 60 * 60 * 1000,
  });
};
