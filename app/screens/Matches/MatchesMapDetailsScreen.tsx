import { FontAwesome6 } from "@expo/vector-icons";
import { Canvas, Image, Shadow, useImage } from "@shopify/react-native-skia";
import { type FC, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, useWindowDimensions, View, type ViewStyle } from "react-native";
import { HeroImage } from "@/components/heroes/HeroImage";
import { SteamName } from "@/components/profile/SteamName";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useAssetsHeroes } from "@/hooks/useAssetsHeroes";
import { useAssetsMap } from "@/hooks/useAssetsMap";
import { useMatchMetadata } from "@/hooks/useMatchMetadata";
import { translate } from "@/i18n/translate";
import type { MatchesStackScreenProps } from "@/navigators/MatchesNavigator";
import { LobbyTeam } from "@/services/api/types/match_metadata";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { formatMatchDuration } from "@/utils/matchHistoryStats";
import { clamp, lerp } from "@/utils/numbers";

const SMOOTHING_FACTOR = 3;
const MAX_PLAYSPEED = 10;

export const MatchesMapDetailsScreen: FC<MatchesStackScreenProps<"MapDetails">> = (props) => {
  const { themed, theme } = useAppTheme();
  const { navigation } = props;
  const { width, height } = useWindowDimensions();
  const [gameTime, setGameTime] = useState(0);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [play, setPlay] = useState(false);
  const minimapSize = Math.min(width, height) * 0.8;
  let playSpeedTimer: NodeJS.Timeout | null = null;

  // biome-ignore lint/correctness/useExhaustiveDependencies: Unmount
  useEffect(() => {
    if (!navigation.isFocused()) {
      setPlaySpeed(0);
      setPlay(false);
    }
  }, [navigation.isFocused()]);

  const matchId = props.route.params.matchId;
  if (!matchId) props.navigation.navigate({ name: "List", params: {} });

  const { data: matchData, isLoading, error } = useMatchMetadata(matchId);
  const { data: mapData } = useAssetsMap();
  const { data: heroesData } = useAssetsHeroes();

  const minimap = useImage(require("@assets/map/minimap.webp") ?? mapData?.images.minimap);

  // Player Data & Hero Images
  const [heroImageUrls, heroColors, heroIds, slotAccountIds, slotTeam1] = useMemo(() => {
    const getAssetsHeroImage = (heroId: number) =>
      heroesData?.find((h) => h.id === heroId)?.images.minimap_image_webp ?? "";
    return [
      Object.fromEntries(
        matchData?.players.filter((p) => p.hero_id).map((p) => [p.player_slot, getAssetsHeroImage(p.hero_id ?? 1)]) ??
          [],
      ),
      Object.fromEntries(
        matchData?.players
          .filter((p) => p.hero_id)
          .map((p) => [p.player_slot, heroesData?.find((h) => h.id === p.hero_id)?.colors.ui.join(",")]) ?? [],
      ),
      Object.fromEntries(matchData?.players.map((p) => [p.player_slot, p.hero_id]) ?? []),
      Object.fromEntries(matchData?.players.map((p) => [p.player_slot, p.account_id]) ?? []),
      Object.fromEntries(matchData?.players.map((p) => [p.player_slot, p.team === LobbyTeam.Team1]) ?? []),
    ];
  }, [matchData?.players, heroesData]);

  const heroImages = Object.fromEntries(Object.entries(heroImageUrls).map(([slot, url]) => [slot, useImage(url)]));

  // Minimap Coordinates
  const { minX, maxX, minY, maxY, xResolution, yResolution } = useMemo(() => {
    const paths = matchData?.match_paths?.paths ?? [];
    return {
      minX: Math.min(...paths.map((p) => p.x_min ?? 0)),
      maxX: Math.max(...paths.map((p) => p.x_max ?? 1)),
      minY: Math.min(...paths.map((p) => p.y_min ?? 0)),
      maxY: Math.max(...paths.map((p) => p.y_max ?? 1)),
      xResolution: matchData?.match_paths?.x_resolution ?? 16383,
      yResolution: matchData?.match_paths?.y_resolution ?? 16383,
    };
  }, [matchData?.match_paths]);

  const playerPositions = matchData?.match_paths?.paths.map((p) => {
    const getInterpolatedValue = (arr: number[], time: number) => {
      const idx = Math.floor(time);
      const nextIdx = Math.min(idx + 1, arr.length - 1);
      const [prev, next] = [arr[idx], arr[nextIdx]];
      if (prev <= 0.01 || next <= 0.01) return 0;
      return lerp(prev ?? 0, next ?? 0, time - idx);
    };

    const xPos = getInterpolatedValue(p.x_pos, gameTime);
    const yPos = getInterpolatedValue(p.y_pos, gameTime);
    const health = getInterpolatedValue(p.health, gameTime);
    const pathWidth = (p.x_max ?? 1) - (p.x_min ?? 0);
    const pathHeight = (p.y_max ?? 1) - (p.y_min ?? 0);
    const xScaled = (xPos / xResolution) * pathWidth + (p.x_min ?? 0) - 2300;
    const xRelPos = (xScaled - minX) / (maxX - minX);
    const yScaled = (yPos / yResolution) * pathHeight + (p.y_min ?? 0);
    const yRelPos = (yScaled - minY) / (maxY - minY);
    return {
      player_slot: p.player_slot,
      x: clamp(xRelPos, 0, 1),
      y: clamp(yRelPos, 0, 1),
      health,
    };
  });
  const heroImgSize = minimapSize / 15;
  const heroImagesCanvas = playerPositions
    ?.filter((p) => p.health > 0)
    .map((p) => (
      <Image
        key={p.player_slot}
        image={heroImages[p.player_slot ?? 0]}
        x={p.x * minimapSize - heroImgSize / 2}
        y={(1 - p.y) * minimapSize - heroImgSize / 2}
        width={heroImgSize}
        height={heroImgSize}
      >
        <Shadow blur={5} dx={0} dy={0} color={`rgb(${heroColors[p.player_slot ?? 0]})`} />
      </Image>
    ));

  // biome-ignore lint/correctness/useExhaustiveDependencies: PlaySpeed is the only dependency
  useEffect(() => {
    if (!play) {
      if (playSpeedTimer) clearInterval(playSpeedTimer);
    } else {
      if (playSpeed > 0 && gameTime >= (matchData?.duration_s ?? 0)) {
        setGameTime(matchData?.duration_s ?? 0);
        setPlay(false);
        if (playSpeedTimer) clearInterval(playSpeedTimer);
      } else if (playSpeed < 0 && gameTime <= 0) {
        setGameTime(0);
        setPlay(false);
        if (playSpeedTimer) clearInterval(playSpeedTimer);
      }
    }
    if (playSpeed !== 0) {
      playSpeedTimer = setInterval(
        () => {
          if (play && ((playSpeed > 0 && gameTime < (matchData?.duration_s ?? 0)) || (playSpeed < 0 && gameTime > 0)))
            setGameTime((p) => Math.max(0, p + Math.sign(playSpeed) / SMOOTHING_FACTOR));
        },
        1000 / SMOOTHING_FACTOR / Math.abs(playSpeed),
      );
    } else if (playSpeedTimer) clearInterval(playSpeedTimer);
    return () => {
      if (playSpeedTimer) clearInterval(playSpeedTimer);
    };
  }, [play, playSpeed, matchData?.duration_s]);

  const happenedEvents = useMemo(
    () =>
      matchData?.players
        .flatMap((p) =>
          p.death_details.map((d) => ({
            game_time_s: d.game_time_s,
            killer_team_1: slotTeam1[d.killer_player_slot ?? 0],
            team1_player_slot: slotTeam1[d.killer_player_slot ?? 0] ? d.killer_player_slot : p.player_slot,
            team2_player_slot: slotTeam1[d.killer_player_slot ?? 0] ? p.player_slot : d.killer_player_slot,
          })),
        )
        .filter((e) => e.game_time_s && e.game_time_s <= gameTime)
        .sort((a, b) => (b.game_time_s ?? 0) - (a.game_time_s ?? 0)),
    [matchData?.players, slotTeam1, gameTime],
  );

  if (isLoading) {
    return (
      <Screen preset="scroll" contentContainerStyle={$styles.container}>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={theme.colors.tint} />
          <Text preset="subheading" style={{ marginTop: theme.spacing.md }} tx="matchDetailsScreen:loadingMessage" />
        </View>
      </Screen>
    );
  }

  if (error || !matchData || !matchData.players) {
    return (
      <Screen preset="scroll" contentContainerStyle={$styles.container}>
        <View style={themed($errorContainer)}>
          <Text preset="heading" style={{ color: theme.colors.error }} tx="matchDetailsScreen:errorTitle" />
          <Text style={{ marginTop: theme.spacing.sm, textAlign: "center" }} tx="matchDetailsScreen:errorMessage" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$styles.container}>
      <View style={{ flexDirection: "column", gap: theme.spacing.sm }}>
        <Text preset="subheading" style={{ textAlign: "center" }}>
          {translate("matchDetailsScreen:title")} {matchId}
        </Text>
        <Canvas style={{ width: minimapSize, height: minimapSize, alignSelf: "center" }}>
          <Image image={minimap} x={0} y={0} width={minimapSize} height={minimapSize} />
          {heroImagesCanvas}
        </Canvas>

        <View
          style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center", gap: theme.spacing.sm }}
        >
          <Text>Game Time: {formatMatchDuration(Math.floor(gameTime))}</Text>
          <Text>Play Speed: {playSpeed}x</Text>
        </View>
        <View
          style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: theme.spacing.md }}
        >
          <Button
            preset="filled"
            onPress={() => setPlaySpeed(Math.max(playSpeed - 1, -MAX_PLAYSPEED))}
            style={{ flex: 1 }}
          >
            <FontAwesome6 name="backward" solid color={theme.colors.text} size={24} />
          </Button>
          <Button preset="filled" onPress={() => setPlay(!play)} style={{ flex: 1 }}>
            <FontAwesome6 name={play ? "pause" : "play"} solid color={theme.colors.text} size={24} />
          </Button>
          <Button
            preset="filled"
            onPress={() => setPlaySpeed(Math.min(playSpeed + 1, MAX_PLAYSPEED))}
            style={{ flex: 1 }}
          >
            <FontAwesome6 name="forward" solid color={theme.colors.text} size={24} />
          </Button>
        </View>
        <ScrollView
          style={{
            flexDirection: "column",
            maxHeight: height * 0.25,
            backgroundColor: theme.colors.palette.neutral100,
            borderRadius: theme.spacing.xs,
            paddingHorizontal: theme.spacing.xs,
            paddingVertical: theme.spacing.sm,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text
            preset="subheading"
            style={{
              marginBottom: theme.spacing.sm,
              textAlign: "center",
              color: theme.colors.textDim,
            }}
          >
            Kill Feed
          </Text>
          {happenedEvents
            ?.filter(
              (e) =>
                e.team1_player_slot &&
                e.team2_player_slot &&
                slotAccountIds[e.team1_player_slot] &&
                slotAccountIds[e.team2_player_slot],
            )
            .map((e) => (
              <View
                key={`${e.game_time_s}-${e.team1_player_slot}-${e.team2_player_slot}`}
                style={{
                  flexDirection: "row",
                  gap: theme.spacing.xs,
                  padding: theme.spacing.xs,
                  borderRadius: theme.spacing.xxs,
                  marginBottom: theme.spacing.xxs,
                }}
              >
                {/* Timestamp */}
                <Text
                  style={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    color: theme.colors.textDim,
                    minWidth: 40,
                  }}
                  numberOfLines={1}
                >
                  {formatMatchDuration(e.game_time_s ?? 0, true)}
                </Text>

                {/* Kill event content */}
                <View
                  style={{
                    flexDirection: "row",
                    gap: theme.spacing.xs,
                    alignItems: "center",
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  {/* Team 1 section */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: theme.spacing.xxs,
                      justifyContent: "flex-end",
                    }}
                  >
                    {/* Hero avatar for killer */}
                    <HeroImage heroId={heroIds[e.team1_player_slot ?? 0] ?? 1} size={24} />

                    {/* Killer name */}
                    <Text
                      size="xs"
                      numberOfLines={1}
                      style={{
                        color: e.killer_team_1 ? theme.colors.palette.success400 : theme.colors.palette.failure400,
                        width: 90,
                        fontWeight: "600",
                        textAlign: "right",
                      }}
                    >
                      <SteamName accountId={slotAccountIds[e.team1_player_slot ?? 0]} />
                    </Text>
                  </View>

                  {/* Kill icon */}
                  <View
                    style={{
                      backgroundColor: theme.colors.palette.angry500,
                      borderRadius: 10,
                      padding: 4,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesome6 name="skull" solid color={theme.colors.palette.neutral100} size={12} />
                  </View>

                  {/* Victim section */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: theme.spacing.xxs,
                    }}
                  >
                    {/* Victim name */}
                    <Text
                      size="xs"
                      numberOfLines={1}
                      style={{
                        color: e.killer_team_1 ? theme.colors.palette.failure400 : theme.colors.palette.success400,
                        width: 90,
                        fontWeight: "600",
                      }}
                    >
                      <SteamName accountId={slotAccountIds[e.team2_player_slot ?? 0]} />
                    </Text>

                    {/* Hero avatar for victim */}
                    <HeroImage heroId={heroIds[e.team2_player_slot ?? 1] ?? 1} size={24} />
                  </View>
                </View>
              </View>
            ))}

          {happenedEvents?.length === 0 && (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: theme.spacing.lg,
              }}
            >
              <FontAwesome6
                name="clock"
                solid
                color={theme.colors.textDim}
                size={24}
                style={{ marginBottom: theme.spacing.xs }}
              />
              <Text
                size="sm"
                style={{
                  color: theme.colors.textDim,
                  textAlign: "center",
                }}
              >
                No kills yet at this time
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Screen>
  );
};

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xl,
});

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xl,
});
