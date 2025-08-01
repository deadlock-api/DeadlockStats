import { useSteamProfile } from "@/hooks/useSteamProfile";

export interface SteamNameProps {
  steamId: number | null;
}

export function SteamName(props: SteamNameProps) {
  const { data: steamProfile } = useSteamProfile(props.steamId);
  return <>{steamProfile?.personaname ?? steamProfile?.realname ?? steamProfile?.account_id}</>;
}
