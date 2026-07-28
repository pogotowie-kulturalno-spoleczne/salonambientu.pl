export interface Partner {
  /** accessible name; also the fallback text when there is no logo file */
  label: string;
  /** path under /public/logos */
  src?: string;
  href?: string;
  /** height on the 1080px Figma artboard, in px */
  height: number;
}

/**
 * The one partner database. Everything that shows a lockup — the site footer,
 * the funding block, an edition subpage — picks keys out of this map, so a
 * partner's name, link and logo are defined exactly once.
 *
 * Editions reference these keys in their YAML (`partners: [moak, agnella]`).
 */
export const partners = {
  utdf: {
    label: 'Up To Date Festival',
    src: '/logos/utdf.svg',
    href: 'https://uptodate.pl',
    height: 45,
  },
  mkidn: {
    label: 'Ministerstwo Kultury i Dziedzictwa Narodowego',
    src: '/logos/mkidn.svg',
    height: 40,
  },
  nimit: {
    label: 'Narodowy Instytut Muzyki i Tańca',
    src: '/logos/nimit.svg',
    height: 45,
  },
  agnella: {
    label: 'Agnella',
    src: '/logos/agnella.svg',
    href: 'https://agnella.pl',
    height: 35,
  },
  moak: { label: 'MOAK Wasilków', src: '/logos/moak.svg', height: 45 },
  harmony: { label: 'Harmony Oils', src: '/logos/harmony-oils.svg', height: 40 },
  dwby: {
    label: "Fundacja Don't Worry Be Myself",
    src: '/logos/fundacja-dont-worry.svg',
    height: 40,
  },
  drugidom: { label: 'Drugi Dom', src: '/logos/drugi-dom.svg', height: 32 },
  // No logo file yet — renders as its name until one lands.
  wodociagi: { label: 'Wodociągi Białostockie', height: 40 },
} as const satisfies Record<string, Partner>;

export type PartnerKey = keyof typeof partners;

/** Lockups in the site-wide poster footer, on every page. */
export const sitePartners: PartnerKey[] = ['utdf', 'agnella'];

/** Public funding marks — shown with the grant disclosure, not in the footer. */
export const funders: PartnerKey[] = ['mkidn', 'nimit'];

export function partnersByKey(keys: readonly string[]): Partner[] {
  return keys
    .map((key) => partners[key as PartnerKey])
    .filter((p): p is Partner => Boolean(p));
}

/** "A, B i C" — Polish list conjunction. */
export function partnerSentence(keys: readonly string[]): string {
  const names = partnersByKey(keys).map((p) => p.label);
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} i ${names.at(-1)}`;
}
