export interface HeroStats {
  hero_id: number;
  matches_played: number;
  last_played: number;
  time_played: number;
  wins: number;
  ending_level: number;
  kills: number;
  deaths: number;
  assists: number;
  denies_per_match: number;
  kills_per_min: number;
  deaths_per_min: number;
  assists_per_min: number;
  denies_per_min: number;
  networth_per_min: number;
  last_hits_per_min: number;
  damage_per_min: number;
  damage_per_soul: number;
  damage_taken_per_min: number;
  damage_taken_per_soul: number;
  creeps_per_min: number;
  obj_damage_per_min: number;
  obj_damage_per_soul: number;
  accuracy: number;
  crit_shot_rate: number;
  matches: number[];
}
