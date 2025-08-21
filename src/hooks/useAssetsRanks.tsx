import { useQuery } from "@tanstack/react-query";
import { assetsApi } from "src/services/assets-api";

export const useAssetsRanks = () => {
  return useQuery({
    queryKey: ["assets-ranks"],
    queryFn: async () => {
      const response = await assetsApi.getRanks();
      if (response.ok) {
        return response.data;
      } else {
        throw new Error(`Error fetching ranks: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 60 * 60 * 1000,
    networkMode: "offlineFirst",
  });
};
