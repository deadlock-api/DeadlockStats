import { useSteamProfile } from "@/hooks/useSteamProfile";

export interface SteamNameProps {
  accountId?: number;
  fontSize?: number;
}

export function SteamName(props: SteamNameProps) {
  const { data: profile } = useSteamProfile(props.accountId);

  return <>{profile?.personaname ?? profile?.realname ?? profile?.account_id ?? "Unknown"}</>;
}
