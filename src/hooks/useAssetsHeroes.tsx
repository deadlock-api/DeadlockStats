import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { deadlock_locale } from "src/i18n";
import { assetsApi } from "src/services/assets-api";

export const useAssetsHeroes = () => {
  return useQuery({
    queryKey: ["assets-heroes"],
    queryFn: async () => {
      const response = await assetsApi.heroes_api.getHeroesV2HeroesGet({
        onlyActive: true,
        language: deadlock_locale,
      });
      if (response.status === 200) {
        return response.data?.filter((h) => !h.in_development).sort((a, b) => a.name.localeCompare(b.name));
      } else {
        throw new Error(`Error fetching heroes: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 60 * 60 * 1000,
    networkMode: "offlineFirst",
  });
};

export const useAssetsHero = (heroId: number) => {
  const heroes = useAssetsHeroes();
  const hero = useMemo(() => heroes.data?.find((h) => h.id === heroId), [heroes.data, heroId]);
  return { ...heroes, data: hero };
};
