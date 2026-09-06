// Sticker & Emoticon definitions for Photobooth decorating
export interface Sticker {
  id: string;
  name: string;
  emojiChar?: string;
  url: string; // SVG data URI or reliable CDN URL
  category: "emoji" | "y2k" | "props" | "stamps" | "music";
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  url: string;
  x: number; // percentage 0-100 relative to strip
  y: number; // percentage 0-100 relative to strip
  scale: number;
  rotation: number;
}

export const STICKER_CATEGORIES = [
  { id: "music", name: "Lagu & Musik Hits", emoji: "🎵" },
  { id: "emoji", name: "Emoticon & Ekspresi", emoji: "🥰" },
  { id: "y2k", name: "Y2K & Sparkle", emoji: "✨" },
  { id: "props", name: "Props & Aksesoris", emoji: "👑" },
  { id: "stamps", name: "Stempel Teks", emoji: "🏷️" },
] as const;

const TWEMOJI_BASE = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg";

// Helper for inline SVG stamps so they load instantly without external dependencies
function makeSvgStamp(text: string, bgColor: string, textColor: string, border: string = "#2d1b4e"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="48" viewBox="0 0 160 48">
    <rect x="3" y="3" width="154" height="42" rx="21" fill="${bgColor}" stroke="${border}" stroke-width="3"/>
    <text x="80" y="28" font-family="'Nunito', sans-serif" font-size="16" font-weight="900" fill="${textColor}" text-anchor="middle" dominant-baseline="middle" letter-spacing="1.5">${text}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 1. Spotify / Music Player Widget SVG Generator
function makeSpotifyPlayerSvg(
  title: string,
  artist: string,
  currentTime: string,
  totalTime: string,
  progressPct: number,
  bgColor: string = "#121212",
  accentColor: string = "#1db954",
  coverEmoji: string = "🎵"
): string {
  const barW = 160;
  const activeW = Math.round((barW * progressPct) / 100);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="84" viewBox="0 0 280 84">
    <defs>
      <filter id="p-shadow" x="-5%" y="-5%" width="110%" height="120%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.3)"/>
      </filter>
      <linearGradient id="cover-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${accentColor}"/>
        <stop offset="100%" stop-color="#191414"/>
      </linearGradient>
    </defs>
    <!-- Background card -->
    <rect x="2" y="2" width="276" height="80" rx="16" fill="${bgColor}" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" filter="url(#p-shadow)"/>
    
    <!-- Album Cover Thumbnail -->
    <rect x="12" y="14" width="56" height="56" rx="10" fill="url(#cover-grad)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <text x="40" y="47" font-size="24" text-anchor="middle" dominant-baseline="middle">${coverEmoji}</text>
    
    <!-- Title & Artist -->
    <text x="80" y="27" font-family="'Nunito', -apple-system, sans-serif" font-size="13" font-weight="900" fill="#ffffff">${title}</text>
    <text x="80" y="41" font-family="'Nunito', -apple-system, sans-serif" font-size="10.5" font-weight="700" fill="rgba(255,255,255,0.65)">${artist}</text>
    
    <!-- Heart Icon -->
    <path d="M 256 24 C 253 20 247 21 245 24 C 243 21 237 20 234 24 C 230 28 235 34 245 39 C 255 34 260 28 256 24 Z" fill="${accentColor}"/>

    <!-- Progress bar -->
    <rect x="80" y="52" width="${barW}" height="4" rx="2" fill="rgba(255,255,255,0.22)"/>
    <rect x="80" y="52" width="${activeW}" height="4" rx="2" fill="${accentColor}"/>
    <circle cx="${80 + activeW}" cy="54" r="4.5" fill="#ffffff"/>

    <!-- Timestamps & Player controls -->
    <text x="80" y="69" font-family="monospace" font-size="8.5" fill="rgba(255,255,255,0.55)">${currentTime}</text>
    <text x="240" y="69" font-family="monospace" font-size="8.5" fill="rgba(255,255,255,0.55)" text-anchor="end">${totalTime}</text>

    <!-- Mini Play Button -->
    <circle cx="160" cy="67" r="8" fill="#ffffff"/>
    <polygon points="158,63 164,67 158,71" fill="${bgColor}"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 2. Aesthetic Lyric Badge SVG Generator
function makeLyricBadgeSvg(
  artist: string,
  song: string,
  quote: string,
  emoji: string = "🎵",
  bgGradient1: string = "#1c1917",
  bgGradient2: string = "#0c0a09",
  borderColor: string = "#e7e5e4",
  textColor: string = "#fafaf9"
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="82" viewBox="0 0 280 82">
    <defs>
      <linearGradient id="badge-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradient1}"/>
        <stop offset="100%" stop-color="${bgGradient2}"/>
      </linearGradient>
    </defs>
    <!-- Outer Card -->
    <rect x="3" y="3" width="274" height="76" rx="14" fill="url(#badge-bg)" stroke="${borderColor}" stroke-width="2"/>
    
    <!-- Left Accent Strip -->
    <rect x="12" y="14" width="4" height="54" rx="2" fill="${borderColor}"/>

    <!-- Header info -->
    <text x="24" y="24" font-family="'Nunito', -apple-system, sans-serif" font-size="10" font-weight="900" fill="${borderColor}" letter-spacing="1.2">
      ${emoji} ${artist.toUpperCase()} • ${song.toUpperCase()}
    </text>

    <!-- Quote Lyrics -->
    <text x="24" y="44" font-family="Georgia, serif" font-size="12.5" font-style="italic" font-weight="bold" fill="${textColor}">
      "${quote}"
    </text>

    <!-- Footer soundwave -->
    <g transform="translate(24, 56)" fill="${borderColor}" opacity="0.8">
      <rect x="0" y="2" width="2.5" height="10" rx="1"/>
      <rect x="5" y="0" width="2.5" height="14" rx="1"/>
      <rect x="10" y="4" width="2.5" height="8" rx="1"/>
      <rect x="15" y="1" width="2.5" height="12" rx="1"/>
      <rect x="20" y="5" width="2.5" height="6" rx="1"/>
      <rect x="25" y="0" width="2.5" height="14" rx="1"/>
      <rect x="30" y="3" width="2.5" height="9" rx="1"/>
      <text x="38" y="11" font-family="monospace" font-size="8" font-weight="bold" fill="${borderColor}">03:42 // SOUNDTRACK</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 3. Realistic Vinyl Record Disk SVG Generator
function makeVinylRecordSvg(
  labelTitle: string,
  labelArtist: string,
  labelColor: string = "#ff4d6d"
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
    <defs>
      <!-- Vinyl Sheen -->
      <radialGradient id="vinyl-base" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#1a1a1a"/>
        <stop offset="60%" stop-color="#0d0d0d"/>
        <stop offset="100%" stop-color="#000000"/>
      </radialGradient>
      <linearGradient id="sheen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.18)"/>
        <stop offset="50%" stop-color="rgba(255,255,255,0.01)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0.18)"/>
      </linearGradient>
    </defs>
    <!-- Outer Vinyl Body -->
    <circle cx="80" cy="80" r="76" fill="url(#vinyl-base)" stroke="#333333" stroke-width="2"/>
    
    <!-- Concentric Grooves -->
    <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
    <circle cx="80" cy="80" r="64" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <circle cx="80" cy="80" r="58" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <circle cx="80" cy="80" r="52" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    <circle cx="80" cy="80" r="46" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
    <circle cx="80" cy="80" r="40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>

    <!-- Light Sheen Reflection -->
    <path d="M 10 80 A 70 70 0 0 1 150 80 Z" fill="url(#sheen)"/>
    <path d="M 150 80 A 70 70 0 0 1 10 80 Z" fill="url(#sheen)"/>

    <!-- Center Record Label -->
    <circle cx="80" cy="80" r="28" fill="${labelColor}" stroke="#ffffff" stroke-width="2"/>
    <text x="80" y="74" font-family="'Nunito', sans-serif" font-size="7.5" font-weight="900" fill="#ffffff" text-anchor="middle">${labelTitle}</text>
    <text x="80" y="84" font-family="'Nunito', sans-serif" font-size="6" font-weight="700" fill="rgba(255,255,255,0.85)" text-anchor="middle">${labelArtist}</text>

    <!-- Spindle Hole -->
    <circle cx="80" cy="80" r="6" fill="#000000" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 4. Retro Mixtape Cassette SVG Generator
function makeCassetteTapeSvg(title: string, artist: string, tapeColor: string = "#fef08a"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="130" viewBox="0 0 200 130">
    <defs>
      <linearGradient id="cass-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#262626"/>
        <stop offset="100%" stop-color="#171717"/>
      </linearGradient>
    </defs>
    <!-- Cassette Body -->
    <rect x="4" y="4" width="192" height="122" rx="10" fill="url(#cass-bg)" stroke="#404040" stroke-width="2.5"/>
    
    <!-- Screws in corners -->
    <circle cx="12" cy="12" r="2" fill="#737373"/>
    <circle cx="188" cy="12" r="2" fill="#737373"/>
    <circle cx="12" cy="118" r="2" fill="#737373"/>
    <circle cx="188" cy="118" r="2" fill="#737373"/>

    <!-- Paper Label Strip -->
    <rect x="18" y="16" width="164" height="66" rx="6" fill="${tapeColor}" stroke="#1f2937" stroke-width="1.5"/>
    
    <!-- Title & Artist handwritten feel -->
    <text x="26" y="32" font-family="'Courier New', monospace" font-size="11" font-weight="900" fill="#111827">SIDE A: ${title}</text>
    <text x="26" y="44" font-family="'Courier New', monospace" font-size="8.5" font-weight="bold" fill="#374151">${artist}</text>
    <line x1="24" y1="48" x2="176" y2="48" stroke="#d1d5db" stroke-width="1" stroke-dasharray="3 2"/>

    <!-- Center Tape Window -->
    <rect x="52" y="52" width="96" height="34" rx="4" fill="#0a0a0a" stroke="#4b5563" stroke-width="1.5"/>
    
    <!-- Left & Right Spools -->
    <circle cx="74" cy="69" r="11" fill="#ffffff" stroke="#9ca3af" stroke-width="2"/>
    <circle cx="74" cy="69" r="4" fill="#111827"/>
    <circle cx="126" cy="69" r="11" fill="#ffffff" stroke="#9ca3af" stroke-width="2"/>
    <circle cx="126" cy="69" r="4" fill="#111827"/>
    <rect x="85" y="66" width="30" height="6" fill="#78350f" opacity="0.8"/>

    <!-- Bottom Trapezoid indent -->
    <polygon points="40,126 160,126 145,98 55,98" fill="#1f2937" stroke="#374151" stroke-width="1"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 5. Song Barcode & Soundwave Graphic
function makeBarcodeSoundwaveSvg(songTitle: string, artist: string, code: string = "7 39281 94820 4"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="64" viewBox="0 0 220 64">
    <rect x="2" y="2" width="216" height="60" rx="8" fill="#ffffff" stroke="#18181b" stroke-width="2"/>
    <text x="10" y="16" font-family="'Nunito', sans-serif" font-size="9" font-weight="900" fill="#09090b">${songTitle.toUpperCase()} // ${artist.toUpperCase()}</text>
    
    <!-- Barcode Bars -->
    <g transform="translate(10, 22)" fill="#09090b">
      <rect x="0" y="0" width="2" height="24"/>
      <rect x="4" y="0" width="3" height="24"/>
      <rect x="9" y="0" width="1" height="24"/>
      <rect x="12" y="0" width="4" height="24"/>
      <rect x="18" y="0" width="2" height="24"/>
      <rect x="22" y="0" width="1" height="24"/>
      <rect x="25" y="0" width="3" height="24"/>
      <rect x="30" y="0" width="2" height="24"/>
      <rect x="34" y="0" width="1" height="24"/>
      <rect x="38" y="0" width="4" height="24"/>
      <rect x="44" y="0" width="2" height="24"/>
      <rect x="48" y="0" width="3" height="24"/>
      <rect x="53" y="0" width="1" height="24"/>
      <rect x="56" y="0" width="2" height="24"/>
      <rect x="60" y="0" width="4" height="24"/>
      <rect x="66" y="0" width="1" height="24"/>
      <rect x="70" y="0" width="3" height="24"/>
      <rect x="75" y="0" width="2" height="24"/>
      <rect x="79" y="0" width="4" height="24"/>
      <rect x="85" y="0" width="1" height="24"/>
      <rect x="88" y="0" width="3" height="24"/>
      <rect x="93" y="0" width="2" height="24"/>
      <rect x="97" y="0" width="4" height="24"/>
      <rect x="103" y="0" width="2" height="24"/>
      <rect x="107" y="0" width="1" height="24"/>
      <rect x="110" y="0" width="3" height="24"/>
      <rect x="115" y="0" width="2" height="24"/>
      <rect x="120" y="0" width="4" height="24"/>
      <rect x="126" y="0" width="1" height="24"/>
      <rect x="130" y="0" width="3" height="24"/>
      <rect x="135" y="0" width="2" height="24"/>
      <rect x="140" y="0" width="4" height="24"/>
      <rect x="146" y="0" width="2" height="24"/>
      <rect x="150" y="0" width="1" height="24"/>
      <rect x="154" y="0" width="3" height="24"/>
      <rect x="160" y="0" width="2" height="24"/>
      <rect x="164" y="0" width="4" height="24"/>
      <rect x="170" y="0" width="2" height="24"/>
      <rect x="175" y="0" width="3" height="24"/>
      <rect x="180" y="0" width="2" height="24"/>
      <rect x="185" y="0" width="4" height="24"/>
      <rect x="192" y="0" width="2" height="24"/>
      <rect x="196" y="0" width="3" height="24"/>
    </g>
    <text x="110" y="55" font-family="monospace" font-size="8" font-weight="bold" fill="#52525b" text-anchor="middle">${code}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 6. Concert Ticket VIP Pass SVG Generator
function makeConcertTicketSvg(tour: string, artist: string, city: string = "SEOUL // JAKARTA"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="74" viewBox="0 0 250 74">
    <defs>
      <linearGradient id="tix-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#4f46e5"/>
        <stop offset="100%" stop-color="#7c3aed"/>
      </linearGradient>
    </defs>
    <!-- Main Ticket Body -->
    <rect x="3" y="3" width="244" height="68" rx="10" fill="url(#tix-grad)" stroke="#ffffff" stroke-width="2"/>
    
    <!-- Perforated Tear Line -->
    <line x1="180" y1="3" x2="180" y2="71" stroke="#ffffff" stroke-width="2" stroke-dasharray="4 3"/>

    <!-- Left Content -->
    <text x="16" y="24" font-family="'Nunito', sans-serif" font-size="13" font-weight="900" fill="#ffffff">★ ${artist.toUpperCase()}</text>
    <text x="16" y="40" font-family="'Nunito', sans-serif" font-size="9" font-weight="bold" fill="rgba(255,255,255,0.85)">${tour} • ${city}</text>
    <text x="16" y="56" font-family="monospace" font-size="8" font-weight="bold" fill="#fde047">ADMIT ONE // VIP ALL ACCESS</text>

    <!-- Stub Content -->
    <text x="212" y="26" font-family="'Nunito', sans-serif" font-size="8" font-weight="900" fill="#ffffff" text-anchor="middle">SECTION</text>
    <text x="212" y="42" font-family="'Nunito', sans-serif" font-size="14" font-weight="900" fill="#fde047" text-anchor="middle">A-01</text>
    <text x="212" y="56" font-family="monospace" font-size="7" font-weight="bold" fill="rgba(255,255,255,0.7)" text-anchor="middle">№ 8402</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const STICKERS: Sticker[] = [
  // ===== 1. HIT SONGS & MUSIC (ABOUT YOU, MULTO, ETC.) =====
  {
    id: "mus-the1975-player",
    name: "Spotify: About You (The 1975)",
    url: makeSpotifyPlayerSvg("About You", "The 1975", "02:45", "05:26", 52, "#18181b", "#1db954", "🖤"),
    category: "music",
  },
  {
    id: "mus-the1975-lyric",
    name: "Lyric: About You (The 1975)",
    url: makeLyricBadgeSvg("The 1975", "About You", "Do you think I have forgotten about you?", "🖤", "#18181b", "#09090b", "#e4e4e7", "#ffffff"),
    category: "music",
  },
  {
    id: "mus-multo-player",
    name: "Spotify: Multo (Cup of Joe)",
    url: makeSpotifyPlayerSvg("Multo", "Cup of Joe", "01:24", "04:12", 34, "#271c19", "#f59e0b", "🥀"),
    category: "music",
  },
  {
    id: "mus-multo-lyric",
    name: "Lyric: Multo (Cup of Joe)",
    url: makeLyricBadgeSvg("Cup of Joe", "Multo", "Kahit sa panaginip lang, makasama ka...", "🥀", "#3f2d27", "#1c1411", "#fed7aa", "#fff7ed"),
    category: "music",
  },
  {
    id: "mus-wte-player",
    name: "Spotify: Seasons (wave to earth)",
    url: makeSpotifyPlayerSvg("seasons", "wave to earth", "01:50", "03:40", 50, "#16202c", "#38bdf8", "🌊"),
    category: "music",
  },
  {
    id: "mus-wte-lyric",
    name: "Lyric: Seasons (wave to earth)",
    url: makeLyricBadgeSvg("wave to earth", "seasons", "I can't be your love, cause I'm afraid", "🌊", "#0f172a", "#020617", "#7dd3fc", "#f0f9ff"),
    category: "music",
  },
  {
    id: "mus-newjeans-player",
    name: "Spotify: Ditto (NewJeans)",
    url: makeSpotifyPlayerSvg("Ditto", "NewJeans", "02:10", "03:06", 70, "#1e1b4b", "#c084fc", "🐰"),
    category: "music",
  },
  {
    id: "mus-newjeans-lyric",
    name: "Lyric: Ditto (NewJeans)",
    url: makeLyricBadgeSvg("NewJeans", "Ditto", "Stay in the middle, like you a little", "🐰", "#312e81", "#1e1b4b", "#e9d5ff", "#ffffff"),
    category: "music",
  },
  {
    id: "mus-arctic-player",
    name: "Spotify: 505 (Arctic Monkeys)",
    url: makeSpotifyPlayerSvg("505", "Arctic Monkeys", "03:15", "04:13", 77, "#1c1917", "#f43f5e", "🎸"),
    category: "music",
  },
  {
    id: "mus-arctic-lyric",
    name: "Lyric: 505 (Arctic Monkeys)",
    url: makeLyricBadgeSvg("Arctic Monkeys", "505", "I'm going back to 505...", "🎸", "#292524", "#0c0a09", "#fda4af", "#fff1f2"),
    category: "music",
  },
  {
    id: "mus-swift-player",
    name: "Spotify: Lover (Taylor Swift)",
    url: makeSpotifyPlayerSvg("Lover", "Taylor Swift", "02:05", "03:41", 56, "#4a044e", "#f472b6", "💖"),
    category: "music",
  },
  {
    id: "mus-swift-lyric",
    name: "Lyric: Lover (Taylor Swift)",
    url: makeLyricBadgeSvg("Taylor Swift", "Lover", "Can I go where you go? Can we always be this close?", "💖", "#701a75", "#4a044e", "#fbcfe8", "#ffffff"),
    category: "music",
  },
  {
    id: "mus-sza-lyric",
    name: "Lyric: Snooze (SZA)",
    url: makeLyricBadgeSvg("SZA", "Snooze", "I can't lose when I'm with you", "🌙", "#18181b", "#09090b", "#fde047", "#fef9c3"),
    category: "music",
  },
  {
    id: "mus-frank-lyric",
    name: "Lyric: Pink + White (Frank Ocean)",
    url: makeLyricBadgeSvg("Frank Ocean", "Pink + White", "That's the way everyday goes, every time", "🍊", "#292524", "#1c1917", "#fdba74", "#fff7ed"),
    category: "music",
  },
  {
    id: "mus-vinyl-the1975",
    name: "Piringan Vinyl: The 1975",
    url: makeVinylRecordSvg("THE 1975", "ABOUT YOU", "#18181b"),
    category: "music",
  },
  {
    id: "mus-vinyl-multo",
    name: "Piringan Vinyl: Multo",
    url: makeVinylRecordSvg("MULTO", "CUP OF JOE", "#b91c1c"),
    category: "music",
  },
  {
    id: "mus-vinyl-wte",
    name: "Piringan Vinyl: wave to earth",
    url: makeVinylRecordSvg("WAVE TO EARTH", "SEASONS", "#0284c7"),
    category: "music",
  },
  {
    id: "mus-cassette-mixtape",
    name: "Kaset Pita: Late Night Vibes",
    url: makeCassetteTapeSvg("About You / Multo", "Indie Chill Hits", "#fef08a"),
    category: "music",
  },
  {
    id: "mus-cassette-pink",
    name: "Kaset Pita: Lover Pop Hits",
    url: makeCassetteTapeSvg("Lover / Ditto", "Sweet Mix 2024", "#fbcfe8"),
    category: "music",
  },
  {
    id: "mus-barcode-aboutyou",
    name: "Barcode: The 1975 - About You",
    url: makeBarcodeSoundwaveSvg("About You", "The 1975", "1 97500 29384 1"),
    category: "music",
  },
  {
    id: "mus-barcode-multo",
    name: "Barcode: Cup of Joe - Multo",
    url: makeBarcodeSoundwaveSvg("Multo", "Cup of Joe", "2 02409 58192 7"),
    category: "music",
  },
  {
    id: "mus-ticket-the1975",
    name: "Tiket Konser: The 1975 World Tour",
    url: makeConcertTicketSvg("AT THEIR VERY BEST TOUR", "The 1975", "JAKARTA // ASIA"),
    category: "music",
  },
  {
    id: "mus-ticket-wte",
    name: "Tiket Konser: wave to earth",
    url: makeConcertTicketSvg("THE FIRST ERA TOUR", "wave to earth", "SEOUL // INTL"),
    category: "music",
  },

  // ===== 2. EMOTICONS / EMOJIS =====
  { id: "em-heart", name: "Red Heart", emojiChar: "❤️", url: `${TWEMOJI_BASE}/2764.svg`, category: "emoji" },
  { id: "em-sparkling-heart", name: "Sparkle Heart", emojiChar: "💖", url: `${TWEMOJI_BASE}/1f496.svg`, category: "emoji" },
  { id: "em-two-hearts", name: "Two Hearts", emojiChar: "💕", url: `${TWEMOJI_BASE}/1f495.svg`, category: "emoji" },
  { id: "em-heart-eyes", name: "Heart Eyes", emojiChar: "😍", url: `${TWEMOJI_BASE}/1f60d.svg`, category: "emoji" },
  { id: "em-kiss", name: "Blowing Kiss", emojiChar: "😘", url: `${TWEMOJI_BASE}/1f618.svg`, category: "emoji" },
  { id: "em-wink", name: "Wink Tongue", emojiChar: "😜", url: `${TWEMOJI_BASE}/1f61c.svg`, category: "emoji" },
  { id: "em-pleading", name: "Pleading Cute", emojiChar: "🥺", url: `${TWEMOJI_BASE}/1f97a.svg`, category: "emoji" },
  { id: "em-party-face", name: "Party Horn", emojiChar: "🥳", url: `${TWEMOJI_BASE}/1f973.svg`, category: "emoji" },
  { id: "em-cool", name: "Cool Sunglasses", emojiChar: "😎", url: `${TWEMOJI_BASE}/1f60e.svg`, category: "emoji" },
  { id: "em-crying-laugh", name: "Joy Laugh", emojiChar: "😂", url: `${TWEMOJI_BASE}/1f602.svg`, category: "emoji" },
  { id: "em-cat-heart", name: "Cat Heart Eyes", emojiChar: "😻", url: `${TWEMOJI_BASE}/1f63b.svg`, category: "emoji" },
  { id: "em-fire", name: "Hot Fire", emojiChar: "🔥", url: `${TWEMOJI_BASE}/1f525.svg`, category: "emoji" },

  // ===== 3. Y2K & SPARKLES =====
  { id: "y2k-sparkles", name: "Magic Sparkles", emojiChar: "✨", url: `${TWEMOJI_BASE}/2728.svg`, category: "y2k" },
  { id: "y2k-star", name: "Glowing Star", emojiChar: "⭐", url: `${TWEMOJI_BASE}/2b50.svg`, category: "y2k" },
  { id: "y2k-dizzy", name: "Dizzy Swirl", emojiChar: "💫", url: `${TWEMOJI_BASE}/1f4ab.svg`, category: "y2k" },
  { id: "y2k-lightning", name: "Neon Bolt", emojiChar: "⚡", url: `${TWEMOJI_BASE}/26a1.svg`, category: "y2k" },
  { id: "y2k-cherry", name: "Cherries", emojiChar: "🍒", url: `${TWEMOJI_BASE}/1f352.svg`, category: "y2k" },
  { id: "y2k-blossom", name: "Sakura Blossom", emojiChar: "🌸", url: `${TWEMOJI_BASE}/1f338.svg`, category: "y2k" },
  { id: "y2k-butterfly", name: "Blue Butterfly", emojiChar: "🦋", url: `${TWEMOJI_BASE}/1f98b.svg`, category: "y2k" },
  { id: "y2k-cd", name: "Retro CD", emojiChar: "💿", url: `${TWEMOJI_BASE}/1f4bf.svg`, category: "y2k" },
  { id: "y2k-rainbow", name: "Rainbow", emojiChar: "🌈", url: `${TWEMOJI_BASE}/1f308.svg`, category: "y2k" },

  // ===== 4. PROPS & ACCESSORIES =====
  { id: "pr-crown", name: "Gold Crown", emojiChar: "👑", url: `${TWEMOJI_BASE}/1f451.svg`, category: "props" },
  { id: "pr-halo", name: "Angel Halo", emojiChar: "😇", url: `${TWEMOJI_BASE}/1f607.svg`, category: "props" },
  { id: "pr-party-hat", name: "Party Cone", emojiChar: "🎉", url: `${TWEMOJI_BASE}/1f389.svg`, category: "props" },
  { id: "pr-ribbon", name: "Pink Bow Ribbon", emojiChar: "🎀", url: `${TWEMOJI_BASE}/1f380.svg`, category: "props" },
  { id: "pr-sunglasses", name: "Dark Shades", emojiChar: "🕶️", url: `${TWEMOJI_BASE}/1f576.svg`, category: "props" },
  { id: "pr-bunny-ears", name: "Bunny", emojiChar: "🐰", url: `${TWEMOJI_BASE}/1f430.svg`, category: "props" },
  { id: "pr-cat-face", name: "Cat Whisker", emojiChar: "🐱", url: `${TWEMOJI_BASE}/1f431.svg`, category: "props" },
  { id: "pr-camera", name: "Retro Camera", emojiChar: "📷", url: `${TWEMOJI_BASE}/1f4f7.svg`, category: "props" },

  // ===== 5. TEXT STAMPS & DOODLES =====
  { id: "st-besties", name: "BESTIES", url: makeSvgStamp("BESTIES 💕", "#ffccd5", "#c9184a"), category: "stamps" },
  { id: "st-love-you", name: "LUV U", url: makeSvgStamp("LUV U ❤️", "#ffe5ec", "#ff4d6d"), category: "stamps" },
  { id: "st-vibes", name: "GOOD VIBES", url: makeSvgStamp("GOOD VIBES ✨", "#e0aaff", "#3c096c"), category: "stamps" },
  { id: "st-photoism", name: "PHOTOISM", url: makeSvgStamp("PHOTOISM 📷", "#1a1a1a", "#ffffff"), category: "stamps" },
  { id: "st-memories", name: "MEMORIES", url: makeSvgStamp("MEMORIES 🎞️", "#faedcd", "#7f5539"), category: "stamps" },
  { id: "st-seoul", name: "SEOUL 4-CUT", url: makeSvgStamp("SEOUL 4-CUT 🇰🇷", "#d8f3dc", "#1b4332"), category: "stamps" },
];