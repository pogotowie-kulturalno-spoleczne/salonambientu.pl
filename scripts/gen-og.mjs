import sharp from 'sharp';

// KV-style OG image: warm-yellow canvas, sharp outer rect, rounded inner rect, wordmark.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="wash" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#fff4d0"/>
      <stop offset="100%" stop-color="#f3c962"/>
    </radialGradient>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="34"/>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="url(#wash)"/>
  <rect x="815" y="70" width="320" height="490" fill="#f8dd8f"/>
  <rect x="865" y="150" width="220" height="330" rx="110" fill="#fff4d0" filter="url(#glow)"/>
  <rect x="895" y="180" width="160" height="270" rx="80" fill="#fbe6a4"/>
  <text x="80" y="300" font-family="Inter Tight, Arial, sans-serif" font-size="96" font-weight="700" letter-spacing="-2" fill="#111">Salony</text>
  <text x="80" y="405" font-family="Inter Tight, Arial, sans-serif" font-size="96" font-weight="700" letter-spacing="-2" fill="#111">Ambientu</text>
  <text x="82" y="500" font-family="Inter Tight, Arial, sans-serif" font-size="30" font-weight="500" fill="#111">Muzyka ambient na zywo / Up To Date Festival</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og.png');
console.log('wrote public/og.png');
