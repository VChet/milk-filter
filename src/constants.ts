type ColorPalette = [number, number, number][];
type BrightnessThreshold = [number, number];

export enum FilterType {
  INSIDE = 1,
  OUTSIDE = 2
}

export const COLOR_PALETTE: Record<keyof typeof FilterType, ColorPalette> = {
  INSIDE: [[0, 0, 0], [102, 0, 31], [137, 0, 146]],
  OUTSIDE: [[0, 0, 0], [92, 36, 60], [203, 43, 43]]
};
export const BRIGHTNESS_THRESHOLD: Record<keyof typeof FilterType, BrightnessThreshold> = {
  INSIDE: [120, 200],
  OUTSIDE: [90, 150]
};
