import type { SteamProfile } from "deadlock-api-client";
import { useSteamProfile } from "src/hooks/useSteamProfile";

export interface SteamNameProps {
  profile?: SteamProfile;
  accountId?: number;
}

export function SteamName({ profile, accountId }: SteamNameProps) {
  if (profile) return <SteamNameFromProfile profile={profile} />;
  else return <SteamNameFetch accountId={accountId} />;
}

export function SteamNameFetch(props: Pick<SteamNameProps, "accountId">) {
  const { data: profile } = useSteamProfile({ accountId: props.accountId ?? 0 });
  return <SteamNameFromProfile profile={profile ?? undefined} />;
}

export function SteamNameFromProfile({ profile }: Pick<SteamNameProps, "profile">) {
  return <>{profile?.personaname ?? profile?.realname ?? profile?.account_id ?? "Unknown"}</>;
}
