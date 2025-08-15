import { useSteamProfile } from "@/hooks/useSteamProfile";
import type { SteamProfile } from "@/services/api/types/steam_profile";

export interface SteamNameProps {
  profile?: SteamProfile;
  accountId?: number;
}

export function SteamName({ profile, accountId }: SteamNameProps) {
  if (profile) return <>{profile?.personaname ?? profile?.realname ?? profile?.account_id ?? "Unknown"}</>;
  else return <SteamNameFetch accountId={accountId} />;
}

export function SteamNameFetch(props: Pick<SteamNameProps, "accountId">) {
  const { data: profile } = useSteamProfile(props.accountId);
  return <>{profile?.personaname ?? profile?.realname ?? profile?.account_id ?? "Unknown"}</>;
}
