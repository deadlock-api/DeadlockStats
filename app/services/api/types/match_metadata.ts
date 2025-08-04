export type MatchMetadata = {
  match_info: MatchInfo;
};

export interface MatchInfo {
  match_id?: number;
  duration_s?: number;
  winning_team?: LobbyTeam;
  players: Players[];
  start_time?: number;
  match_mode?: MatchMode;
  objectives: Objective[];
  match_paths?: PathsData;
  damage_matrix?: DamageMatrix;
  custom_user_stats: CustomUserStatInfo[];
  mid_boss: MidBoss[];
  average_badge_team0?: number;
  average_badge_team1?: number;
}

export interface Players {
  account_id?: number;
  player_slot?: number;
  death_details: Deaths[];
  items: Items[];
  stats: PlayerStats[];
  team?: LobbyTeam;
  kills?: number;
  deaths?: number;
  assists?: number;
  net_worth?: number;
  hero_id?: number;
  last_hits?: number;
  denies?: number;
  ability_points?: number;
  party?: number;
  assigned_lane?: number;
  level?: number;
  ability_stats: AbilityStat[];
  stats_type_stat: number[];
  abandon_match_time_s?: number;
}

export interface Deaths {
  game_time_s?: number;
  killer_player_slot?: number;
  death_pos?: Position;
  killer_pos?: Position;
  death_duration_s?: number;
}

export interface Objective {
  legacy_objective_id?: EObjective;
  destroyed_time_s?: number;
  creep_damage?: number;
  creep_damage_mitigated?: number;
  player_damage?: number;
  player_damage_mitigated?: number;
  first_damage_time_s?: number;
  team_objective_id?: TeamObjective;
  team?: LobbyTeam;
}

export interface Items {
  game_time_s?: number;
  item_id?: number;
  upgrade_id?: number;
  sold_time_s?: number;
  flags?: number;
  imbued_ability_id?: number;
}

export interface PathsData {
  version?: number;
  interval_s?: number;
  x_resolution?: number;
  y_resolution?: number;
  paths: Path[];
}

export interface DamageMatrix {
  damage_dealers: DamageDealer[];
  sample_time_s: number[];
  source_details?: SourceDetails;
}

export interface CustomUserStatInfo {
  name?: string;
  id?: number;
}

export interface MidBoss {
  team_killed?: LobbyTeam;
  team_claimed?: LobbyTeam;
  destroyed_time_s?: number;
}

export interface PlayerStats {
  time_stamp_s?: number;
  net_worth?: number;
  gold_player?: number;
  gold_player_orbs?: number;
  gold_lane_creep_orbs?: number;
  gold_neutral_creep_orbs?: number;
  gold_boss?: number;
  gold_boss_orb?: number;
  gold_treasure?: number;
  gold_denied?: number;
  gold_death_loss?: number;
  gold_lane_creep?: number;
  gold_neutral_creep?: number;
  kills?: number;
  deaths?: number;
  assists?: number;
  creep_kills?: number;
  neutral_kills?: number;
  possible_creeps?: number;
  creep_damage?: number;
  player_damage?: number;
  neutral_damage?: number;
  boss_damage?: number;
  denies?: number;
  player_healing?: number;
  ability_points?: number;
  self_healing?: number;
  player_damage_taken?: number;
  max_health?: number;
  weapon_power?: number;
  tech_power?: number;
  shots_hit?: number;
  shots_missed?: number;
  damage_absorbed?: number;
  absorption_provided?: number;
  hero_bullets_hit?: number;
  hero_bullets_hit_crit?: number;
  heal_prevented?: number;
  heal_lost?: number;
  gold_sources: GoldSource[];
  custom_user_stats: CustomUserStat[];
  damage_mitigated?: number;
  level?: number;
}

export interface AbilityStat {
  ability_id?: number;
  ability_value?: number;
}

export interface Position {
  x?: number;
  y?: number;
  z?: number;
}

export interface Path {
  player_slot?: number;
  x_min?: number;
  y_min?: number;
  x_max?: number;
  y_max?: number;
  x_pos: number[];
  y_pos: number[];
  alive: boolean[];
  health: number[];
  combat_type: CombatType[];
  move_type: MoveType[];
}

export interface DamageDealer {
  dealer_player_slot?: number;
  damage_sources: DamageSource[];
}

export interface SourceDetails {
  stat_type: StatType[];
  source_name: string[];
}

export interface GoldSource {
  source?: EGoldSource;
  kills?: number;
  damage?: number;
  gold?: number;
  gold_orbs?: number;
}

export interface DamageSource {
  damage_to_players: DamageToPlayer[];
  source_details_index?: number;
}

export interface CustomUserStat {
  value?: number;
  id?: number;
}

export interface DamageToPlayer {
  target_player_slot?: number;
  damage: number[];
}

export enum EGoldSource {
  Players = 1,
  LaneCreeps = 2,
  Neutrals = 3,
  Bosses = 4,
  Treasure = 5,
  Assists = 6,
  Denies = 7,
  TeamBonus = 8,
  UNRECOGNIZED = -1,
}
export enum StatType {
  Damage = 0,
  Healing = 1,
  HealPrevented = 2,
  Mitigated = 3,
  LethalDamage = 4,
  UNRECOGNIZED = -1,
}

export enum CombatType {
  Out = 0,
  Player = 1,
  EnemyNPC = 2,
  Neutral = 3,
  UNRECOGNIZED = -1,
}
export enum MoveType {
  Normal = 0,
  Ability = 1,
  AbilityDebuff = 2,
  GroundDash = 3,
  Slide = 4,
  RopeClimbing = 5,
  Ziplining = 6,
  InAir = 7,
  AirDash = 8,
  UNRECOGNIZED = -1,
}
export enum TeamObjective {
  Core = 0,
  Tier1_Lane1 = 1,
  Tier1_Lane2 = 2,
  Tier1_Lane3 = 3,
  Tier1_Lane4 = 4,
  Tier2_Lane1 = 5,
  Tier2_Lane2 = 6,
  Tier2_Lane3 = 7,
  Tier2_Lane4 = 8,
  Titan = 9,
  TitanShieldGenerator_1 = 10,
  TitanShieldGenerator_2 = 11,
  BarrackBoss_Lane1 = 12,
  BarrackBoss_Lane2 = 13,
  BarrackBoss_Lane3 = 14,
  BarrackBoss_Lane4 = 15,
  UNRECOGNIZED = -1,
}

export enum EObjective {
  Team0_Core = 0,
  Team0_Tier1_Lane1 = 1,
  Team0_Tier1_Lane2 = 2,
  Team0_Tier1_Lane3 = 3,
  Team0_Tier1_Lane4 = 4,
  Team0_Tier2_Lane1 = 5,
  Team0_Tier2_Lane2 = 6,
  Team0_Tier2_Lane3 = 7,
  Team0_Tier2_Lane4 = 8,
  Team0_Titan = 9,
  Team0_TitanShieldGenerator_1 = 10,
  Team0_TitanShieldGenerator_2 = 11,
  Team0_BarrackBoss_Lane1 = 12,
  Team0_BarrackBoss_Lane2 = 13,
  Team0_BarrackBoss_Lane3 = 14,
  Team0_BarrackBoss_Lane4 = 15,
  Team1_Core = 16,
  Team1_Tier1_Lane1 = 17,
  Team1_Tier1_Lane2 = 18,
  Team1_Tier1_Lane3 = 19,
  Team1_Tier1_Lane4 = 20,
  Team1_Tier2_Lane1 = 21,
  Team1_Tier2_Lane2 = 22,
  Team1_Tier2_Lane3 = 23,
  Team1_Tier2_Lane4 = 24,
  Team1_Titan = 25,
  Team1_TitanShieldGenerator_1 = 26,
  Team1_TitanShieldGenerator_2 = 27,
  Team1_BarrackBoss_Lane1 = 28,
  Team1_BarrackBoss_Lane2 = 29,
  Team1_BarrackBoss_Lane3 = 30,
  Team1_BarrackBoss_Lane4 = 31,
  Neutral_Mid = 32,
  UNRECOGNIZED = -1,
}
export enum LobbyTeam {
  Team0 = 0,
  Team1 = 1,
  Spectator = 16,
  UNRECOGNIZED = -1,
}
export enum MatchMode {
  Invalid = 0,
  Unranked = 1,
  PrivateLobby = 2,
  CoopBot = 3,
  Ranked = 4,
  ServerTest = 5,
  Tutorial = 6,
  HeroLabs = 7,
  UNRECOGNIZED = -1,
}
