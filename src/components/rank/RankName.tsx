import { useAssetsRanks } from "src/hooks/useAssetsRanks";

export interface RankNameProps {
  rank?: number;
  rankName?: string;
}

export const division = (rank: number) => Math.floor(rank / 10);
export const subrank = (rank: number) => (rank % 10).toFixed(0);

export function RankName(props: RankNameProps) {
  if (props.rankName) return <RankNameFromAssets rankName={props.rankName} />;
  else if (props.rank) return <RankNameFetch rank={props.rank} />;
  else return null;
}

export function RankNameFetch({ rank }: Pick<RankNameProps, "rank">) {
  const { data: ranks } = useAssetsRanks();
  const assetsRank = ranks?.find((r) => rank && r.tier === division(rank));
  const rankName = `${assetsRank?.name} ${subrank(rank ?? 1)}`;
  return <RankNameFromAssets rankName={rankName} />;
}

export function RankNameFromAssets({ rankName }: Pick<RankNameProps, "rankName">) {
  return <>{rankName}</>;
}
