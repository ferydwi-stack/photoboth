// Sticker & Emoticon definitions for Photobooth decorating
export interface Sticker {
  id: string;
  name: string;
  emojiChar?: string;
  url: string; // SVG data URI or reliable CDN URL
  category: "emoji" | "y2k" | "props" | "stamps";
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

export const STICKERS: Sticker[] = [
  // ===== EMOTICONS / EMOJIS =====
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

  // ===== Y2K & SPARKLES =====
  { id: "y2k-sparkles", name: "Magic Sparkles", emojiChar: "✨", url: `${TWEMOJI_BASE}/2728.svg`, category: "y2k" },
  { id: "y2k-star", name: "Glowing Star", emojiChar: "⭐", url: `${TWEMOJI_BASE}/2b50.svg`, category: "y2k" },
  { id: "y2k-dizzy", name: "Dizzy Swirl", emojiChar: "💫", url: `${TWEMOJI_BASE}/1f4ab.svg`, category: "y2k" },
  { id: "y2k-lightning", name: "Neon Bolt", emojiChar: "⚡", url: `${TWEMOJI_BASE}/26a1.svg`, category: "y2k" },
  { id: "y2k-cherry", name: "Cherries", emojiChar: "🍒", url: `${TWEMOJI_BASE}/1f352.svg`, category: "y2k" },
  { id: "y2k-blossom", name: "Sakura Blossom", emojiChar: "🌸", url: `${TWEMOJI_BASE}/1f338.svg`, category: "y2k" },
  { id: "y2k-butterfly", name: "Blue Butterfly", emojiChar: "🦋", url: `${TWEMOJI_BASE}/1f98b.svg`, category: "y2k" },
  { id: "y2k-cd", name: "Retro CD", emojiChar: "💿", url: `${TWEMOJI_BASE}/1f4bf.svg`, category: "y2k" },
  { id: "y2k-rainbow", name: "Rainbow", emojiChar: "🌈", url: `${TWEMOJI_BASE}/1f308.svg`, category: "y2k" },

  // ===== PROPS & ACCESSORIES =====
  { id: "pr-crown", name: "Gold Crown", emojiChar: "👑", url: `${TWEMOJI_BASE}/1f451.svg`, category: "props" },
  { id: "pr-halo", name: "Angel Halo", emojiChar: "😇", url: `${TWEMOJI_BASE}/1f607.svg`, category: "props" },
  { id: "pr-party-hat", name: "Party Cone", emojiChar: "🎉", url: `${TWEMOJI_BASE}/1f389.svg`, category: "props" },
  { id: "pr-ribbon", name: "Pink Bow Ribbon", emojiChar: "🎀", url: `${TWEMOJI_BASE}/1f380.svg`, category: "props" },
  { id: "pr-sunglasses", name: "Dark Shades", emojiChar: "🕶️", url: `${TWEMOJI_BASE}/1f576.svg`, category: "props" },
  { id: "pr-bunny-ears", name: "Bunny", emojiChar: "🐰", url: `${TWEMOJI_BASE}/1f430.svg`, category: "props" },
  { id: "pr-cat-face", name: "Cat Whisker", emojiChar: "🐱", url: `${TWEMOJI_BASE}/1f431.svg`, category: "props" },
  { id: "pr-camera", name: "Retro Camera", emojiChar: "📷", url: `${TWEMOJI_BASE}/1f4f7.svg`, category: "props" },

  // ===== TEXT STAMPS & DOODLES =====
  { id: "st-besties", name: "BESTIES", url: makeSvgStamp("BESTIES 💕", "#ffccd5", "#c9184a"), category: "stamps" },
  { id: "st-love-you", name: "LUV U", url: makeSvgStamp("LUV U ❤️", "#ffe5ec", "#ff4d6d"), category: "stamps" },
  { id: "st-vibes", name: "GOOD VIBES", url: makeSvgStamp("GOOD VIBES ✨", "#e0aaff", "#3c096c"), category: "stamps" },
  { id: "st-photoism", name: "PHOTOISM", url: makeSvgStamp("PHOTOISM 📷", "#1a1a1a", "#ffffff"), category: "stamps" },
  { id: "st-memories", name: "MEMORIES", url: makeSvgStamp("MEMORIES 🎞️", "#faedcd", "#7f5539"), category: "stamps" },
  { id: "st-seoul", name: "SEOUL 4-CUT", url: makeSvgStamp("SEOUL 4-CUT 🇰🇷", "#d8f3dc", "#1b4332"), category: "stamps" },
];