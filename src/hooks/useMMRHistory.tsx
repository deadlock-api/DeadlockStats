import { useQuery } from "@tanstack/react-query";
import type { MMRApiMmrHistoryRequest } from "deadlock-api-client";
import { api } from "src/services/api";

export const useMMRHistory = (query: MMRApiMmrHistoryRequest) => {
  return useQuery({
    queryKey: ["api-mmr-history", query],
    queryFn: async () => {
      if (!query?.accountId) return [];
      const response = await api.mmr_api.mmrHistory(query);
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Error fetching mmr history: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 30 * 60 * 1000,
  });
};
