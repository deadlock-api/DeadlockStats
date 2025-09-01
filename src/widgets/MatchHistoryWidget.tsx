import type { HeroV2 } from "assets-deadlock-api-client";
import type { PlayerMatchHistoryEntry } from "deadlock-api-client";
import type { JSX } from "react";
import { FlexWidget, ImageWidget, ListWidget, TextWidget } from "react-native-android-widget";
import { HERO_IMAGES } from "src/components/heroes/HeroImage";
import { formatMatchDuration, formatRelativeTime, isMatchWon } from "src/utils/matchHistoryStats";

export interface MatchHistoryWidgetProps {
  accountId?: number;
  matchHistory?: PlayerMatchHistoryEntry[];
  heroes?: HeroV2[];
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
        {props.matchHistory.slice(0, 30).map((match) => (
          <MatchHistoryItem key={match.match_id} match={match} heroes={props.heroes} />
        ))}
      </ListWidget>
    </FlexWidget>
  );
};

const MatchHistoryItem = ({ match, heroes }: { match: PlayerMatchHistoryEntry; heroes?: HeroV2[] }) => {
  const assetsHero = heroes?.find((h) => h.id === match.hero_id);
  if (!assetsHero) return null;
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: `deadlockstats://matches/${match.match_id}` }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 2,
        paddingHorizontal: 8,
        width: "match_parent",
      }}
    >
      <FlexWidget
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flexGap: 2,
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
          {/*<TextWidget*/}
          {/*  text={`${parseMatchMode(match.match_mode)}`}*/}
          {/*  style={{*/}
          {/*    color: "#B6ACA6",*/}
          {/*    fontSize: 11,*/}
          {/*  }}*/}
          {/*/>*/}
          <TextWidget
            text={`${(match.net_worth / 1000).toFixed(1)}k Souls | ${match.player_kills}/${match.player_deaths}/${match.player_assists} KDA`}
            style={{
              color: "#B6ACA6",
              fontSize: 11,
            }}
          />
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
            fontSize: 14,
            fontWeight: "bold",
            height: 20,
          }}
        />
        <TextWidget
          style={{
            color: "#B6ACA6",
            fontSize: 11,
          }}
          text={formatMatchDuration(match.match_duration_s)}
        />
        <TextWidget
          style={{
            color: "#B6ACA6",
            fontSize: 11,
          }}
          text={formatRelativeTime(match.start_time)}
        />
      </FlexWidget>
    </FlexWidget>
  );
};

const HeroImageWidget = ({ hero }: { hero: HeroV2 }) => {
  const image = HERO_IMAGES[hero.id] ?? `https:${hero.images.icon_image_small_webp}`;
  const getBackgroundColor = (hero: HeroV2 | undefined) => {
    if (!hero) return "transparent";
    return `rgba(${hero.colors.ui.join(",")}, 0.2)`;
  };
  return (
    <ImageWidget
      image={image}
      imageWidth={35}
      imageHeight={35}
      style={{
        backgroundColor: getBackgroundColor(hero),
        borderRadius: 8,
      }}
    />
  );
};

const HeroNameWidget = ({ hero }: { hero: HeroV2 }) => {
  return <TextWidget text={hero.name} style={{ color: "#ffffff", fontWeight: "bold", fontSize: 14 }} />;
};
