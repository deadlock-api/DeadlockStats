import { SPACING_MULTIPLIER } from "src/theme/spacingDark";

/**
  Use these spacings for margins/paddings and other whitespace throughout your app.
 */
export const spacing = {
  xxxxs: SPACING_MULTIPLIER,
  xxxs: 2 * SPACING_MULTIPLIER,
  xxs: 4 * SPACING_MULTIPLIER,
  xs: 8 * SPACING_MULTIPLIER,
  sm: 12 * SPACING_MULTIPLIER,
  md: 16 * SPACING_MULTIPLIER,
  lg: 24 * SPACING_MULTIPLIER,
  xl: 32 * SPACING_MULTIPLIER,
  xxl: 48 * SPACING_MULTIPLIER,
  xxxl: 64 * SPACING_MULTIPLIER,
} as const;
