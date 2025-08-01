export interface MatchHistory {
  account_id: number;
  match_id: number;
  hero_id: number;
  hero_level: number;
  start_time: number; // unix timestamp
  game_mode: number;
  match_mode: number;
  player_team: number;
  player_kills: number;
  player_deaths: number;
  player_assists: number;
  denies: number;
  net_worth: number;
  last_hits: number;
  team_abandoned: boolean | null;
  abandoned_time_s: number | null;
  match_duration_s: number;
  match_result: number;
  objectives_mask_team0: number;
  objectives_mask_team1: number;
}
