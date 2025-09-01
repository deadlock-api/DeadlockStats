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
  const { data: profiles } = useSteamProfile({ accountIds: [props.accountId ?? 0] });
  if (!profiles) return null;
  return <SteamNameFromProfile profile={profiles[0] ?? undefined} />;
}

export function SteamNameFromProfile({ profile }: Pick<SteamNameProps, "profile">) {
  return <>{profile?.personaname ?? profile?.realname ?? profile?.account_id ?? "Unknown"}</>;
}
