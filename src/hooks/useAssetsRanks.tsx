import { useQuery } from "@tanstack/react-query";
import { deadlock_locale } from "src/i18n";
import { assetsApi } from "src/services/assets-api";

export const useAssetsRanks = () => {
  return useQuery({
    queryKey: ["assets-ranks"],
    queryFn: async () => {
      const response = await assetsApi.default_api.getRanksV2RanksGet({
        language: deadlock_locale,
      });
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Error fetching ranks: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 60 * 60 * 1000,
    networkMode: "offlineFirst",
  });
};
