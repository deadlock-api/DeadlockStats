import { type TextStyle, View, type ViewStyle } from "react-native";
import { Text } from "@/components/ui/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

export interface StatItemProps {
  label: string;
  value: string;
}

export function StatItem({ label, value }: StatItemProps) {
  const { themed } = useAppTheme();
  return (
    <View style={themed($statItem)}>
      <Text style={themed($statLabel)} size="xxs" text={label} />
      <Text size="sm" weight="medium" text={value} />
    </View>
  );
}

const $statItem: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral100,
  flexGrow: 1,
});

const $statLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
});
