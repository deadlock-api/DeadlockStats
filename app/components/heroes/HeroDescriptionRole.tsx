import { useAssetsHero } from "@/hooks/useAssetsHeroes";

export interface HeroDescriptionRoleProps {
  heroId: number;
  fontSize?: number;
}

export function HeroDescriptionRole(props: HeroDescriptionRoleProps) {
  const { data: hero } = useAssetsHero(props.heroId);

  return <>{hero?.description?.role}</>;
}
