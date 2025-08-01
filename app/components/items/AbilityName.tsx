import { Text } from "@/components/ui/Text";
import { useAssetsAbility } from "@/hooks/useAssetsitems";

export interface AbilityNameProps {
  ability_class_name: string;
  fontSize?: number;
}

export function AbilityName(props: AbilityNameProps) {
  const { data: ability } = useAssetsAbility(props.ability_class_name);
  return (
    <Text numberOfLines={1} style={{ fontSize: props.fontSize }}>
      {ability?.name}
    </Text>
  );
}
