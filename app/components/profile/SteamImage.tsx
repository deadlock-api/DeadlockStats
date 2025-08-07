import { FontAwesome6 } from "@expo/vector-icons";
import { AutoImage } from "@/components/ui/AutoImage";
import { useSteamProfile } from "@/hooks/useSteamProfile";
import { useAppTheme } from "@/theme/context";

const DEFAULT_SIZE = 48;

export interface SteamImageProps {
  accountId: number;
  size?: number;
}

export function SteamImage(props: SteamImageProps) {
  const { theme } = useAppTheme();
  const { data: profile } = useSteamProfile(props.accountId);

  return (
    <>
      {profile?.avatar ? (
        <AutoImage
          source={{ uri: profile.avatar }}
          style={{
            width: props.size ?? DEFAULT_SIZE,
            height: props.size ?? DEFAULT_SIZE,
            borderRadius: (props.size ?? DEFAULT_SIZE) / 2,
          }}
        />
      ) : (
        <FontAwesome6 name="user" solid color={theme.colors.textDim} size={(props.size ?? DEFAULT_SIZE) / 2} />
      )}
    </>
  );
}
