import { useSteamProfile } from "src/hooks/useSteamProfile";
import type { SteamProfile } from "src/services/api/types/steam_profile";

export interface SteamNameProps {
  profile?: SteamProfile;
  accountId?: number;
}

export function SteamName({ profile, accountId }: SteamNameProps) {
  if (profile) return <SteamNameFromProfile profile={profile} />;
  else return <SteamNameFetch accountId={accountId} />;
}

export function SteamNameFetch(props: Pick<SteamNameProps, "accountId">) {
  const { data: profile } = useSteamProfile(props.accountId);
  return <SteamNameFromProfile profile={profile ?? undefined} />;
}

export function SteamNameFromProfile({ profile }: Pick<SteamNameProps, "profile">) {
  return <>{profile?.personaname ?? profile?.realname ?? profile?.account_id ?? "Unknown"}</>;
}
