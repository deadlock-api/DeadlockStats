import { FontAwesome6 } from "@expo/vector-icons";
import type { SteamProfile } from "deadlock-api-client";
import { AutoImage } from "src/components/ui/AutoImage";
import { useSteamProfile } from "src/hooks/useSteamProfile";
import { useAppTheme } from "src/theme/context";

const DEFAULT_SIZE = 48;

export interface SteamImageProps {
  accountId?: number;
  profile?: SteamProfile;
  size?: number;
}

export function SteamImage(props: SteamImageProps) {
  if (props.profile) return <SteamImageProfile profile={props.profile} size={props.size} />;
  else return <SteamImageFetch accountId={props.accountId} size={props.size} />;
}

export function SteamImageFetch({ accountId, size }: Omit<SteamImageProps, "account">) {
  const { data: profile } = useSteamProfile({ accountId: accountId ?? 0 });

  if (!profile) return null;
  return <SteamImageProfile profile={profile} size={size} />;
}

export function SteamImageProfile({ profile, size }: Omit<SteamImageProps, "accountId">) {
  const { theme } = useAppTheme();

  if (!profile?.avatar) {
    return <FontAwesome6 name="user" solid color={theme.colors.textDim} size={(size ?? DEFAULT_SIZE) / 2} />;
  }

  return (
    <AutoImage
      source={{ uri: profile.avatar }}
      style={{
        width: size ?? DEFAULT_SIZE,
        height: size ?? DEFAULT_SIZE,
        borderRadius: (size ?? DEFAULT_SIZE) / 2,
      }}
    />
  );
}
