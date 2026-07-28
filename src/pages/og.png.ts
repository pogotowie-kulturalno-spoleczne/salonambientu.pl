import type { APIRoute } from 'astro';
import { getAllEvents, groupByMonth } from '../lib/events';
import { renderSiteOg } from '../lib/og';
import { defaultPalette } from '../lib/themes';

export const GET: APIRoute = async () => {
  const events = await getAllEvents();
  const stamp = [...new Set(events.map((e) => e.month.slice(0, 4)))].join('/');

  // Announced editions only. Unannounced ones are summarised, never hinted at.
  const announced = events.filter((e) => !e.secret);
  const rows = groupByMonth(announced).flatMap((group) =>
    group.events.map((e) => ({
      month: group.label,
      title: e.title,
      place: e.location,
    }))
  );

  const hidden = events.length - announced.length;

  const png = await renderSiteOg({
    rows,
    stamp,
    more: hidden > 0 ? `+ ${hidden} kolejne edycje` : undefined,
    palette: defaultPalette,
  });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
