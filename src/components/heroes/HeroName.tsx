import type { HeroV2 } from "assets-deadlock-api-client";
import { useAssetsHero } from "src/hooks/useAssetsHeroes";

export interface HeroNameProps {
  heroId?: number;
  hero?: HeroV2;
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
