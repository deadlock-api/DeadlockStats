import { useQuery } from "@tanstack/react-query";
import { deadlock_locale } from "@/i18n";
import { assetsApi } from "@/services/assets-api";

export const useAssetsAbilities = () => {
  return useQuery({
    queryKey: ["assets-ability", deadlock_locale],
    queryFn: async () => {
      const response = await assetsApi.getAbilities();
      if (response.ok) {
        return response.data;
      } else {
        throw new Error(`Error fetching abilities: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 60 * 60 * 1000,
    networkMode: "offlineFirst",
  });
};

export const useAssetsWeapon = (itemId: number) => {
  return useQuery({
    queryKey: ["assets-weapon", deadlock_locale, itemId],
    queryFn: async () => {
      const response = await assetsApi.getWeapon(itemId);
      if (response.ok) {
        return response.data;
      } else {
        throw new Error(`Error fetching weapon: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 60 * 60 * 1000,
    networkMode: "offlineFirst",
  });
};
