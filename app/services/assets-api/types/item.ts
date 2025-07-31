export interface Item {
  id: number;
  class_name: string;
  name: string;
  image: string;
  image_webp: string;
  properties: {
    [key: string]: {
      prefix: string;
      label: string;
      postfix: string;
      conditional: string;
      icon: string;
    };
  };
}

export interface Upgrade extends Item {
  item_slot_type: "weapon" | "spirit" | "vitality";
  item_tier: 1 | 2 | 3 | 4;
  activation: "hold_toggle" | "instant_cast" | "on_button_is_down" | "passive" | "press" | "press_toggle";
  disabled?: boolean;
  description?: string;
  shop_image?: string;
  shop_image_webp?: string;
  shop_image_small?: string;
  shop_image_small_webp?: string;
}

export interface Ability extends Item {
  ability_type?: "innate" | "item" | "signature" | "ultimate" | "weapon";
  description?: {
    desc?: string;
    quip?: string;
    t1_desc?: string;
    t2_desc?: string;
    t3_desc?: string;
    active?: string;
    passive?: string;
  };
  videos?: {
    webm?: string;
    mp4?: string;
  };
}

export interface Weapon extends Item {}
