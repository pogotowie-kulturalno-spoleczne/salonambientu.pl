import { getCollection, type CollectionEntry } from 'astro:content';
import { paletteFor, type ThemePalette } from './themes';

export type EventData = CollectionEntry<'events'>['data'];

/**
 * An edition plus its background palette key.
 *
 * Secret editions get a positional key (`e3`) rather than their slug — the key
 * is rendered into `data-theme` and the injected CSS, so using the id there
 * would publish the very city the blurred row is hiding.
 */
export type EventView = EventData & { themeKey: string; palette: ThemePalette };

function withThemeKeys(events: EventData[]): EventView[] {
  return events.map((e) => {
    const themeKey = e.colorTheme ?? e.id;
    return {
      ...e,
      themeKey,
      // An edition's own poster pair wins; otherwise a generated placeholder.
      palette: e.colors ?? paletteFor(themeKey),
    };
  });
}

/**
 * Data-access seam for events.
 *
 * Backed by Astro content collections (JSON/YAML) for now. To move to a
 * WordPress + GraphQL source later, swap the bodies of these functions only,
 * keeping the returned shape (`EventData`) stable — pages/components stay put.
 */

/** Sortable timestamp: the exact day when known, else the 1st of the month. */
export function eventTime(e: EventData): number {
  return (e.date ?? new Date(`${e.month}-01T00:00:00Z`)).getTime();
}

function byTimeAsc(a: EventData, b: EventData) {
  return eventTime(a) - eventTime(b) || a.order - b.order;
}

/** All editions, oldest to newest (archive order). */
export async function getAllEvents(): Promise<EventView[]> {
  const entries = await getCollection('events');
  return withThemeKeys(entries.map((e) => e.data).sort(byTimeAsc));
}

/** Only upcoming editions, soonest first. */
export async function getUpcomingEvents(): Promise<EventView[]> {
  const now = Date.now();
  return (await getAllEvents()).filter((e) => eventTime(e) >= now);
}

export async function getEventById(id: string): Promise<EventView | undefined> {
  return (await getAllEvents()).find((e) => e.id === id);
}

/** Announced editions only — the ones that get a subpage and structured data. */
export async function getPublicEvents(): Promise<EventView[]> {
  return (await getAllEvents()).filter((e) => !e.secret);
}

export interface MonthGroup {
  /** "2026-10" */
  month: string;
  /** "Październik" — capitalised Polish month name */
  label: string;
  events: EventView[];
}

const monthFormat = new Intl.DateTimeFormat('pl-PL', {
  month: 'long',
  timeZone: 'UTC',
});

/** Poster list order: editions bucketed under one heading per month. */
export function groupByMonth(events: EventView[]): MonthGroup[] {
  const groups = new Map<string, MonthGroup>();

  for (const event of events) {
    let group = groups.get(event.month);
    if (!group) {
      const name = monthFormat.format(new Date(`${event.month}-01T00:00:00Z`));
      group = {
        month: event.month,
        label: name.charAt(0).toUpperCase() + name.slice(1),
        events: [],
      };
      groups.set(event.month, group);
    }
    group.events.push(event);
  }

  return [...groups.values()].sort((a, b) => a.month.localeCompare(b.month));
}
