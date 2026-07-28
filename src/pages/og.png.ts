import type { APIRoute } from 'astro';
import { getAllEvents } from '../lib/events';
import { renderOgPng } from '../lib/og';
import { defaultPalette } from '../lib/themes';

export const GET: APIRoute = async () => {
  const events = await getAllEvents();
  const years = [...new Set(events.map((e) => e.month.slice(0, 4)))].join('/');

  const png = await renderOgPng({
    title: 'Cykl Salonów Ambientu',
    subtitle: 'Muzyka ambient na żywo',
    stamp: years,
    palette: defaultPalette,
  });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
