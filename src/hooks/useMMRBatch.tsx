import { useQuery } from "@tanstack/react-query";
import type { MMRApiMmrRequest } from "deadlock-api-client";
import { api } from "src/services/api";

export const useMMRBatch = (query: MMRApiMmrRequest) => {
  return useQuery({
    queryKey: ["api-mmr-batch", query],
    queryFn: async () => {
      if (!query?.accountIds || !query?.accountIds[0]) return [];
      const response = await api.mmr_api.mmr(query);
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Error fetching mmr: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 30 * 60 * 1000,
  });
};
