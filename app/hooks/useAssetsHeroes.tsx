import { useQuery } from "@tanstack/react-query";
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
  return useQuery({
    queryKey: ["assets-hero", heroId],
    queryFn: async () => {
      const response = await assetsApi.getHeroes();
      if (response.ok) {
        const hero = response.data?.find((hero) => hero.id === heroId);
        if (!hero) {
          throw new Error(`Hero not found: ${heroId}`);
        }
        return hero;
      } else {
        throw new Error(`Error fetching hero: ${JSON.stringify(response)}`);
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    networkMode: "offlineFirst",
  });
};
