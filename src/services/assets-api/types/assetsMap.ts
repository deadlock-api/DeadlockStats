export interface AssetsMap {
  radius: number;
  images: {
    minimap: string;
    plain: string;
    background: string;
    frame: string;
    mid: string;
  };
  objective_positions: {
    [key: string]: {
      left_relative: number;
      top_relative: number;
    };
  };
  zipline_paths: Path[];
}

export interface Path {
  origin: [number, number, number];
  color: string;
  P0_points: [number, number, number][];
  P1_points: [number, number, number][];
  P2_points: [number, number, number][];
}
