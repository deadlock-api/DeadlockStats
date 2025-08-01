import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { assetsApi } from "@/services/assets-api";

export const useAssetsHeroes = () => {
  return useQuery({
    queryKey: ["assets-heroes"],
    queryFn: async () => {
      const response = await assetsApi.getHeroes();
      if (response.ok) {
        return response.data?.filter((h) => !h.in_development).sort((a, b) => a.name.localeCompare(b.name));
      } else {
        throw new Error(`Error fetching heroes: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    networkMode: "offlineFirst",
  });
};

export const useAssetsHero = (heroId: number) => {
  const heroes = useAssetsHeroes();
  // @ts-ignore
  heroes.data = useMemo(() => heroes.data?.find((h) => h.id === heroId), [heroes.data, heroId]);
  return heroes;
};
