import { useAssetsHero } from "src/hooks/useAssetsHeroes";
import type { Hero } from "src/services/assets-api/types/hero";

export interface HeroNameProps {
  heroId?: number;
  hero?: Hero;
}

export function HeroName(props: HeroNameProps) {
  if (props.hero) return <HeroNameFromAssets hero={props.hero} />;
  else if (props.heroId) return <HeroNameFetch heroId={props.heroId} />;
  else return <></>;
}

export function HeroNameFetch({ heroId }: Pick<HeroNameProps, "heroId">) {
  const { data: hero } = useAssetsHero(heroId ?? 0);
  return <HeroNameFromAssets hero={hero} />;
}

export function HeroNameFromAssets({ hero }: Pick<HeroNameProps, "hero">) {
  return <>{hero?.name}</>;
}
