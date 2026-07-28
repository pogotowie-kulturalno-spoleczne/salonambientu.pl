import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** Line-up entry: a bare name, or a name plus a link (SoundCloud etc.). */
const artist = z.union([
  z.string().transform((name) => ({ name, url: undefined as string | undefined })),
  z.object({ name: z.string(), url: z.string().url().optional() }),
]);

const events = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/events' }),
  schema: z.object({
    /** slug used for hover wiring and the subpage URL, e.g. "wasilkow" */
    id: z.string(),
    /** full headline, e.g. "VII NADRZECZNY SALON AMBIENTU" */
    title: z.string(),
    /** right-hand label in the poster list, e.g. "k. Białegostoku" */
    location: z.string(),
    /** month the edition runs in, "YYYY-MM" — the poster list groups by this */
    month: z.string().regex(/^\d{4}-\d{2}$/),

    /** roman-numeral edition, e.g. "VII" (optional split-out) */
    edition: z.string().optional(),
    /** city, when it differs from the poster location label */
    city: z.string().optional(),
    /** exact day, once announced; the list falls back to `month` without it */
    date: z.coerce.date().optional(),
    /** display time range, e.g. "17:00–21:00" */
    time: z.string().optional(),
    venue: z.string().optional(),
    address: z.string().optional(),
    artists: z.array(artist).default([]),
    organizers: z.array(z.string()).optional(),
    /** top-left note on the subpage, e.g. "UTDF & Drugi Dom zapraszają na:" */
    invitation: z.string().optional(),
    /** top-right note; falls back to date / venue / location / time */
    details: z.array(z.string()).optional(),
    /** edition-only partners, named in a sentence on the subpage */
    partners: z.array(z.string()).default([]),
    fbUrl: z.string().url().optional(),

    /** tiebreaker inside one month, low first (poster order) */
    order: z.number().default(0),
    /**
     * Unannounced edition: the poster shows a hard-coded placeholder instead
     * of a title, no subpage is generated, and nothing real about it lives in
     * this repo. Flip to false and fill in the fields once it goes public.
     */
    secret: z.boolean().default(false),

    /** background palette key; defaults to the edition id */
    colorTheme: z.string().optional(),
    /** exact key-visual pair off the edition's poster; overrides the default */
    colors: z
      .object({
        canvas: z.string(),
        glow: z.string(),
      })
      .optional(),
    /** paths under /public/logos, shown on the subpage */
    partnerLogos: z.array(z.string()).default([]),
  }),
});

export const collections = { events };
