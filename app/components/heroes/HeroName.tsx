import { useAssetsHero } from "@/hooks/useAssetsHeroes";

export interface HeroNameProps {
  heroId: number;
  fontSize?: number;
}

export function HeroName(props: HeroNameProps) {
  const { data: hero } = useAssetsHero(props.heroId);

  return <>{hero?.name}</>;
}
