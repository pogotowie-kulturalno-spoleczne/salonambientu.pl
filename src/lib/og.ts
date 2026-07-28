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
const semibold = readFileSync(join(fontDir, 'InterTight-SemiBold.ttf'));
const medium = readFileSync(join(fontDir, 'InterTight-Medium.ttf'));
const regular = readFileSync(join(fontDir, 'InterTight-Regular.ttf'));

const INK = '#150015';

const GRANT_LINE =
  'Dofinansowano ze środków Ministra Kultury i Dziedzictwa Narodowego pochodzących ' +
  'z Funduszu Promocji Kultury w ramach programu „Muzyka”, realizowanego przez ' +
  'Narodowy Instytut Muzyki i Tańca.';

type Node = Record<string, unknown>;

const div = (style: Record<string, unknown>, children?: unknown): Node => ({
  type: 'div',
  props: children === undefined ? { style } : { style, children },
});

const text = (style: Record<string, unknown>, content: string): Node =>
  div({ display: 'flex', ...style }, content);

/**
 * The key visual, in its landscape proportions.
 *
 * Figma's cover-photo layout sits a 988x551 frame on the canvas and lays the
 * pill down inside it; the site uses the same ratios (75.1% / 57% of the
 * frame). Satori has no `filter: blur()`, so each shape is canvas-colored with
 * a wide, soft box-shadow in the glow color — the same read as a blurred
 * duplicate sitting behind it.
 */
function keyVisual(palette: ThemePalette): Node[] {
  const glow = `0 0 100px 26px ${palette.glow}`;

  const frame = { left: 96, top: 92, width: OG_WIDTH - 192, height: 442 };
  const pill = {
    width: Math.round(frame.width * 0.751),
    height: Math.round(frame.height * 0.57),
  };

  return [
    div({
      position: 'absolute',
      ...frame,
      borderRadius: 22,
      background: palette.canvas,
      boxShadow: glow,
      display: 'flex',
    }),
    div({
      position: 'absolute',
      left: frame.left + Math.round((frame.width - pill.width) / 2),
      top: frame.top + Math.round((frame.height - pill.height) / 2),
      ...pill,
      borderRadius: 9999,
      background: palette.canvas,
      boxShadow: glow,
      display: 'flex',
    }),
  ];
}

function shell(palette: ThemePalette, children: unknown[]): Node {
  return div(
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      display: 'flex',
      position: 'relative',
      background: palette.canvas,
      fontFamily: 'Inter Tight',
      color: INK,
    },
    [
      ...keyVisual(palette),
      div(
        {
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          padding: '46px 56px 40px',
        },
        children
      ),
    ]
  );
}

const grantNote = () =>
  text(
    {
      maxWidth: 720,
      fontSize: 13,
      fontWeight: 400,
      lineHeight: 1.35,
      opacity: 0.65,
    },
    GRANT_LINE
  );

/** Small line pair at the top: who invites, and when / where. */
function topRow(invitation: string | undefined, details: string[]): Node {
  return div(
    {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 40,
      fontSize: 21,
      fontWeight: 500,
      lineHeight: 1.3,
    },
    [
      text({ maxWidth: 340, flexDirection: 'column' }, invitation ?? ''),
      div(
        {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          textAlign: 'right',
        },
        details.map((line) => text({}, line))
      ),
    ]
  );
}

/** Title size that keeps a two-line headline inside the frame. */
function titleSize(title: string): number {
  if (title.length <= 22) return 96;
  if (title.length <= 32) return 80;
  return 68;
}

export interface EventOgInput {
  title: string;
  invitation?: string;
  details: string[];
  /** line-up, already split into name + optional "live" suffix */
  artists: { name: string; live: boolean }[];
  palette: ThemePalette;
}

/** Edition card, built like the edition's own cover photo. */
function eventCard(input: EventOgInput): Node {
  const size = titleSize(input.title);

  return shell(input.palette, [
    topRow(input.invitation, input.details),

    div({ display: 'flex', flexDirection: 'column', gap: 24 }, [
      text(
        {
          maxWidth: 900,
          fontSize: size,
          fontWeight: 600,
          lineHeight: 0.94,
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
        },
        input.title
      ),

      ...(input.artists.length > 0
        ? [
            div(
              { display: 'flex', flexDirection: 'column', lineHeight: 1.08 },
              input.artists.map((a) =>
                div(
                  {
                    display: 'flex',
                    alignItems: 'baseline',
                    fontSize: 34,
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    textTransform: 'uppercase',
                  },
                  [
                    text({}, a.name),
                    ...(a.live
                      ? [
                          text(
                            {
                              marginLeft: 10,
                              fontSize: 28,
                              fontWeight: 400,
                              textTransform: 'lowercase',
                              letterSpacing: 0,
                            },
                            'live'
                          ),
                        ]
                      : []),
                  ]
                )
              )
            ),
          ]
        : []),
    ]),

    grantNote(),
  ]);
}

export interface SiteOgInput {
  rows: { month: string; title: string; place: string }[];
  /** bottom-right stamp, e.g. "2026" */
  stamp: string;
  /** shown when some editions are still under wraps */
  more?: string;
  palette: ThemePalette;
}

/** Cycle card: the headline, the announced editions, the year. */
function siteCard(input: SiteOgInput): Node {
  return shell(input.palette, [
    text(
      {
        maxWidth: 900,
        fontSize: 70,
        fontWeight: 600,
        lineHeight: 0.94,
        letterSpacing: '-0.01em',
        textTransform: 'uppercase',
      },
      'Cykl Salonów Ambientu'
    ),

    // Narrower than the card so the place labels stay tied to their titles
    // instead of drifting to the far edge.
    div({ display: 'flex', flexDirection: 'column', gap: 18, width: 920 }, [
      ...input.rows.map((row) =>
        div({ display: 'flex', flexDirection: 'column' }, [
          text({ fontSize: 21, fontWeight: 400 }, row.month),
          div(
            {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 32,
              width: '100%',
            },
            [
              text(
                {
                  fontSize: 34,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                },
                row.title
              ),
              text({ fontSize: 28, fontWeight: 400 }, row.place),
            ]
          ),
        ])
      ),
      ...(input.more
        ? [text({ fontSize: 26, fontWeight: 400, opacity: 0.7 }, input.more)]
        : []),
    ]),

    div(
      {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 40,
        width: '100%',
      },
      [
        grantNote(),
        text(
          {
            fontSize: 76,
            fontWeight: 600,
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
          },
          input.stamp
        ),
      ]
    ),
  ]);
}

async function render(node: Node): Promise<Buffer> {
  const svg = await satori(node as Parameters<typeof satori>[0], {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [
      { name: 'Inter Tight', data: semibold, weight: 600, style: 'normal' },
      { name: 'Inter Tight', data: medium, weight: 500, style: 'normal' },
      { name: 'Inter Tight', data: regular, weight: 400, style: 'normal' },
    ],
  });

  return sharp(Buffer.from(svg)).png().toBuffer();
}

export const renderEventOg = (input: EventOgInput) => render(eventCard(input));
export const renderSiteOg = (input: SiteOgInput) => render(siteCard(input));
