import { useQuery } from "@tanstack/react-query";
import { assetsApi } from "@/services/assets-api";

export const useAssetsAbility = (itemId: number | string) => {
  return useQuery({
    queryKey: ["assets-ability", itemId],
    queryFn: async () => {
      const response = await assetsApi.getAbility(itemId);
      if (response.ok) {
        return response.data;
      } else {
        throw new Error(`Error fetching ability: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    networkMode: "offlineFirst",
  });
};

export const useAssetsWeapon = (itemId: number) => {
  return useQuery({
    queryKey: ["assets-weapon", itemId],
    queryFn: async () => {
      const response = await assetsApi.getWeapon(itemId);
      if (response.ok) {
        return response.data;
      } else {
        throw new Error(`Error fetching weapon: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    networkMode: "offlineFirst",
  });
};
