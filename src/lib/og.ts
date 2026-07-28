import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import type { ThemePalette } from './themes';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// Read off the project root: these endpoints only run at build time, and the
// bundled chunk lives somewhere else entirely, so import.meta.url is no good.
const fontDir = join(process.cwd(), 'src/assets/fonts');
const medium = readFileSync(join(fontDir, 'InterTight-Medium.ttf'));
const regular = readFileSync(join(fontDir, 'InterTight-Regular.ttf'));

interface OgInput {
  title: string;
  /** small line under the title, e.g. "Sierpień 2026 · Chałupy" */
  subtitle?: string;
  /** bottom-right stamp, e.g. "2026" */
  stamp?: string;
  palette: ThemePalette;
}

/**
 * Social card built from the landscape key visual.
 *
 * Satori has no `filter: blur()`, so the halo is a large, soft box-shadow in
 * the glow color behind a canvas-colored shape — the same read as the site,
 * where a blurred duplicate sits behind each sharp shape.
 */
function card({ title, subtitle, stamp, palette }: OgInput) {
  const glowShadow = `0 0 90px 30px ${palette.glow}`;

  return {
    type: 'div',
    props: {
      style: {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        display: 'flex',
        position: 'relative',
        background: palette.canvas,
        fontFamily: 'Inter Tight',
        color: '#150015',
      },
      children: [
        // Glow rectangle.
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 48,
              left: 56,
              right: 56,
              bottom: 48,
              borderRadius: 28,
              background: palette.canvas,
              boxShadow: glowShadow,
              display: 'flex',
            },
          },
        },
        // Laid-down pill, as in the landscape Figma layout.
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 168,
              left: 300,
              width: 600,
              height: 294,
              borderRadius: 9999,
              background: palette.canvas,
              boxShadow: glowShadow,
              display: 'flex',
            },
          },
        },
        // Content.
        {
          type: 'div',
          props: {
            style: {
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '100%',
              padding: '0 110px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: title.length > 34 ? 68 : 84,
                    fontWeight: 500,
                    lineHeight: 1,
                    letterSpacing: '-0.01em',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    justifyContent: 'center',
                  },
                  children: title,
                },
              },
              ...(subtitle
                ? [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          justifyContent: 'center',
                          marginTop: 28,
                          fontSize: 30,
                          fontWeight: 400,
                        },
                        children: subtitle,
                      },
                    },
                  ]
                : []),
            ],
          },
        },
        ...(stamp
          ? [
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    right: 96,
                    bottom: 66,
                    display: 'flex',
                    fontSize: 52,
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                  },
                  children: stamp,
                },
              },
            ]
          : []),
      ],
    },
  };
}

export async function renderOgPng(input: OgInput): Promise<Buffer> {
  const svg = await satori(card(input) as Parameters<typeof satori>[0], {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [
      { name: 'Inter Tight', data: medium, weight: 500, style: 'normal' },
      { name: 'Inter Tight', data: regular, weight: 400, style: 'normal' },
    ],
  });

  return sharp(Buffer.from(svg)).png().toBuffer();
}
