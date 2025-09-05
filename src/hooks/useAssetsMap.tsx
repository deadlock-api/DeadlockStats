import { useQuery } from "@tanstack/react-query";
import { assetsApi } from "src/services/assets-api";

export const useAssetsMap = () => {
  return useQuery({
    queryKey: ["assets-map"],
    queryFn: async () => {
      const response = await assetsApi.default_api.getMapV1MapGet();
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Error fetching map: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 60 * 60 * 1000,
  });
};
