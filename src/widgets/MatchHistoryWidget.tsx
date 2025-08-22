import type { JSX } from "react";
import { FlexWidget, ImageWidget, ListWidget, TextWidget } from "react-native-android-widget";
import { HERO_IMAGES } from "src/components/heroes/HeroImage";
import type { MatchHistory } from "src/services/api/types/match_history";
import type { Hero } from "src/services/assets-api/types/hero";
import { formatMatchDuration, formatRelativeTime, isMatchWon } from "src/utils/matchHistoryStats";

export interface MatchHistoryWidgetProps {
  accountId?: number;
  matchHistory?: MatchHistory[];
  heroes?: Hero[];
}

export const MatchHistoryWidget = (props: MatchHistoryWidgetProps): JSX.Element => {
  if (!props.accountId) {
    return <TextWidget text="No Account ID" />;
  }
  if (!props.matchHistory) {
    return <TextWidget text="No Match History" />;
  }
  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.68)",
      }}
    >
      <ListWidget>
        {props.matchHistory.slice(0, 20).map((match) => (
          <MatchHistoryItem key={match.match_id} match={match} heroes={props.heroes} />
        ))}
      </ListWidget>
    </FlexWidget>
  );
};

const MatchHistoryItem = ({ match, heroes }: { match: MatchHistory; heroes?: Hero[] }) => {
  const assetsHero = heroes?.find((h) => h.id === match.hero_id);
  if (!assetsHero) return null;
  return (
    <FlexWidget
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingHorizontal: 16,
        width: "match_parent",
      }}
    >
      <FlexWidget
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flexGap: 4,
        }}
      >
        <HeroImageWidget hero={assetsHero} />
        <FlexWidget
          style={{
            flexDirection: "column",
            justifyContent: "space-around",
          }}
        >
          <HeroNameWidget hero={assetsHero} />
          <TextWidget text={match.match_id.toString()} style={{ color: "#ffffff" }} />
        </FlexWidget>
      </FlexWidget>
      <FlexWidget
        style={{
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "space-around",
        }}
      >
        <TextWidget
          text={isMatchWon(match) ? "Victory" : "Defeat"}
          style={{
            color: isMatchWon(match) ? "#42C765" : "#C03403",
          }}
        />
        <TextWidget
          style={{
            color: "#B6ACA6",
          }}
          text={formatMatchDuration(match.match_duration_s)}
        />
        <TextWidget
          style={{
            color: "#B6ACA6",
          }}
          text={formatRelativeTime(match.start_time)}
        />
      </FlexWidget>
    </FlexWidget>
  );
};

const HeroImageWidget = ({ hero }: { hero: Hero }) => {
  const image = HERO_IMAGES[hero.id] ?? `https:${hero.images.icon_image_small_webp}`;
  const getBackgroundColor = (hero: Hero | undefined) => {
    if (!hero) return "transparent";
    return `rgba(${hero.colors.ui.join(",")}, 0.3)`;
  };
  return (
    <ImageWidget
      image={image}
      imageWidth={40}
      imageHeight={40}
      style={{
        backgroundColor: getBackgroundColor(hero),
      }}
    />
  );
};

const HeroNameWidget = ({ hero }: { hero: Hero }) => {
  return <TextWidget text={hero.name} style={{ color: "#ffffff" }} />;
};
