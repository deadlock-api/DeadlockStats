import { useQuery } from "@tanstack/react-query";
import { assetsApi } from "@/services/assets-api";

export const useAssetsMap = () => {
  return useQuery({
    queryKey: ["assets-map"],
    queryFn: async () => {
      const response = await assetsApi.getMap();
      if (response.ok) {
        return response.data;
      } else {
        throw new Error(`Error fetching map: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    networkMode: "offlineFirst",
  });
};
