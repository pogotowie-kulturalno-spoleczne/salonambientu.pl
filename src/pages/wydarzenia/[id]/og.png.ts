import type { APIRoute } from 'astro';
import { getPublicEvents, type EventView } from '../../../lib/events';
import { renderEventOg } from '../../../lib/og';

/** Announced editions only — a secret edition gets no card, as it gets no page. */
export async function getStaticPaths() {
  const events = await getPublicEvents();
  return events.map((event) => ({ params: { id: event.id }, props: { event } }));
}

const monthFormat = new Intl.DateTimeFormat('pl-PL', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const dayFormat = new Intl.DateTimeFormat('pl-PL', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export const GET: APIRoute = async ({ props }) => {
  const event = props.event as EventView;

  const when = event.date
    ? dayFormat.format(event.date)
    : monthFormat.format(new Date(`${event.month}-01T00:00:00Z`));
  const whenLabel = when.charAt(0).toUpperCase() + when.slice(1);

  const details =
    event.details ??
    [whenLabel, event.venue, event.location, event.time].filter(
      (line): line is string => Boolean(line)
    );

  const png = await renderEventOg({
    title: event.title,
    invitation: event.invitation,
    details,
    artists: event.artists.map((a) => {
      const match = a.name.match(/^(.*?)\s+live$/i);
      return match ? { name: match[1], live: true } : { name: a.name, live: false };
    }),
    palette: event.palette,
  });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
