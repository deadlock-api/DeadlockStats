export interface Hero {
  id: number;
  class_name: string;
  name: string;
  description: {
    lore?: string;
    role?: string;
    playstyle?: string;
  };
  images: {
    icon_hero_card?: string;
    icon_hero_card_webp?: string;
    icon_image_small?: string;
    icon_image_small_webp?: string;
    minimap_image?: string;
    minimap_image_webp?: string;
    selection_image?: string;
    selection_image_webp?: string;
    top_bar_image?: string;
    top_bar_image_webp?: string;
  };
  items: {
    weapon_primary?: string;
    weapon_secondary?: string;
    weapon_melee?: string;
    ability_mantle?: string;
    ability_jump?: string;
    ability_slide?: string;
    ability_zip_line?: string;
    ability_zip_line_boost?: string;
    ability_climb_rope?: string;
    ability_innate1?: string;
    ability_innate2?: string;
    ability_innate3?: string;
    signature1?: string;
    signature2?: string;
    signature3?: string;
    signature4?: string;
  };
  colors: {
    glow_enemy: [number, number, number];
    glow_friendly: [number, number, number];
    glow_team1: [number, number, number];
    glow_team2: [number, number, number];
    ui: [number, number, number];
  };
  disabled: boolean;
  player_selectable: boolean;
  in_development: boolean;
}
