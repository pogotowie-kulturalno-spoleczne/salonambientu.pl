/**
 * Per-event color pair for the layered key-visual background.
 *
 * Each event supplies just TWO colors:
 *   canvas - the background field, and the fill of the sharp shapes
 *   glow   - the blurred halo that bleeds out from behind those shapes
 *
 * From the Figma key visual: the sharp rectangle and pill are filled with the
 * SAME color as the canvas; they only read because a blurred duplicate sits
 * behind each one.
 *
 * An edition can override the pair in its YAML (`colors:`) — that's how a
 * poster's own palette gets in. Everything else falls back to the default.
 */

export type ThemeKey = string;

export interface ThemePalette {
  canvas: string;
  glow: string;
}

/** Warm yellow — the house pair, used by every edition without its own. */
export const defaultPalette: ThemePalette = {
  canvas: '#f3c962',
  glow: '#fffdf0',
};

/** The pair from the 2026 cycle poster, kept for reference. */
export const cyclePalette: ThemePalette = {
  canvas: '#c6b2cd',
  glow: '#ffd1c8',
};

export function paletteFor(_key: ThemeKey): ThemePalette {
  return defaultPalette;
}

/** CSS var blocks for the given palettes, injected by the layout. */
export function themeBlocks(
  entries: { key: ThemeKey; palette: ThemePalette }[]
): string {
  const seen = new Set<string>();
  return entries
    .filter(({ key }) => !seen.has(key) && seen.add(key))
    .map(
      ({ key, palette }) =>
        `#poster-bg[data-theme="${key}"]{--canvas:${palette.canvas};--glow:${palette.glow};}`
    )
    .join('');
}
