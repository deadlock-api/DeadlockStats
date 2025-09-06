import type { ImageRequireSource } from "react-native";
import { AutoImage } from "src/components/ui/AutoImage";
import { useAssetsRanks } from "src/hooks/useAssetsRanks";

const DEFAULT_SIZE = 40;

const RANK_IMAGES = {
  0: require("@assets/ranks/0.webp"),
  11: require("@assets/ranks/11.webp"),
  12: require("@assets/ranks/12.webp"),
  13: require("@assets/ranks/13.webp"),
  14: require("@assets/ranks/14.webp"),
  15: require("@assets/ranks/15.webp"),
  16: require("@assets/ranks/16.webp"),
  21: require("@assets/ranks/21.webp"),
  22: require("@assets/ranks/22.webp"),
  23: require("@assets/ranks/23.webp"),
  24: require("@assets/ranks/24.webp"),
  25: require("@assets/ranks/25.webp"),
  26: require("@assets/ranks/26.webp"),
  31: require("@assets/ranks/31.webp"),
  32: require("@assets/ranks/32.webp"),
  33: require("@assets/ranks/33.webp"),
  34: require("@assets/ranks/34.webp"),
  35: require("@assets/ranks/35.webp"),
  36: require("@assets/ranks/36.webp"),
  41: require("@assets/ranks/41.webp"),
  42: require("@assets/ranks/42.webp"),
  43: require("@assets/ranks/43.webp"),
  44: require("@assets/ranks/44.webp"),
  45: require("@assets/ranks/45.webp"),
  46: require("@assets/ranks/46.webp"),
  51: require("@assets/ranks/51.webp"),
  52: require("@assets/ranks/52.webp"),
  53: require("@assets/ranks/53.webp"),
  54: require("@assets/ranks/54.webp"),
  55: require("@assets/ranks/55.webp"),
  56: require("@assets/ranks/56.webp"),
  61: require("@assets/ranks/61.webp"),
  62: require("@assets/ranks/62.webp"),
  63: require("@assets/ranks/63.webp"),
  64: require("@assets/ranks/64.webp"),
  65: require("@assets/ranks/65.webp"),
  66: require("@assets/ranks/66.webp"),
  71: require("@assets/ranks/71.webp"),
  72: require("@assets/ranks/72.webp"),
  73: require("@assets/ranks/73.webp"),
  74: require("@assets/ranks/74.webp"),
  75: require("@assets/ranks/75.webp"),
  76: require("@assets/ranks/76.webp"),
  81: require("@assets/ranks/81.webp"),
  82: require("@assets/ranks/82.webp"),
  83: require("@assets/ranks/83.webp"),
  84: require("@assets/ranks/84.webp"),
  85: require("@assets/ranks/85.webp"),
  86: require("@assets/ranks/86.webp"),
  91: require("@assets/ranks/91.webp"),
  92: require("@assets/ranks/92.webp"),
  93: require("@assets/ranks/93.webp"),
  94: require("@assets/ranks/94.webp"),
  95: require("@assets/ranks/95.webp"),
  96: require("@assets/ranks/96.webp"),
  101: require("@assets/ranks/101.webp"),
  102: require("@assets/ranks/102.webp"),
  103: require("@assets/ranks/103.webp"),
  104: require("@assets/ranks/104.webp"),
  105: require("@assets/ranks/105.webp"),
  106: require("@assets/ranks/106.webp"),
  111: require("@assets/ranks/111.webp"),
  112: require("@assets/ranks/112.webp"),
  113: require("@assets/ranks/113.webp"),
  114: require("@assets/ranks/114.webp"),
  115: require("@assets/ranks/115.webp"),
  116: require("@assets/ranks/116.webp"),
} as Record<number, ImageRequireSource>;

export interface RankImageProps {
  rank: number;
  size?: number;
}

const division = (rank: number) => Math.floor(rank / 10);
const subrank = (rank: number) => rank % 10;

export function RankImage(props: RankImageProps) {
  const { data: ranks } = useAssetsRanks();

  const rank = ranks?.find((r) => r.tier === division(props.rank));
  // @ts-expect-error
  const image = rank?.images[`small_subrank${subrank(props.rank)}_webp`] as string;

  return (
    <AutoImage
      source={RANK_IMAGES[props.rank] ?? { uri: image }}
      style={[
        {
          width: props.size ?? DEFAULT_SIZE,
          height: props.size ?? DEFAULT_SIZE,
        },
      ]}
    />
  );
}
