// Sticker definitions using URLs or SVG strings instead of emojis
export interface Sticker {
  id: string;
  name: string;
  url: string; // public URL to SVG/PNG
  category: "y2k" | "cute" | "love" | "props" | "text";
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  url: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number;
  rotation: number;
}

export const STICKER_CATEGORIES = [
  { id: "y2k", name: "Y2K" },
  { id: "cute", name: "Cute" },
  { id: "love", name: "Love" },
  { id: "props", name: "Props" },
  { id: "text", name: "Text" },
] as const;

// Base URLs for stickers (we use high-quality open-source SVGs from unpkg/raw.githubusercontent or similar reliable CDNs)
// For production, these should ideally be downloaded into public/stickers/
const CDN_BASE = "https://raw.githubusercontent.com/lucide-icons/lucide/main/icons";
const TWEMOJI_BASE = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg";

export const STICKERS: Sticker[] = [
  // Y2K & Stars
  { id: "s1", name: "Sparkles", url: `${TWEMOJI_BASE}/2728.svg`, category: "y2k" },
  { id: "s2", name: "Dizzy", url: `${TWEMOJI_BASE}/1f4ab.svg`, category: "y2k" },
  { id: "s3", name: "Star", url: `${TWEMOJI_BASE}/2b50.svg`, category: "y2k" },
  { id: "s4", name: "Lightning", url: `${TWEMOJI_BASE}/26a1.svg`, category: "y2k" },
  { id: "s5", name: "Fire", url: `${TWEMOJI_BASE}/1f525.svg`, category: "y2k" },
  
  // Cute
  { id: "c1", name: "Ribbon", url: `${TWEMOJI_BASE}/1f380.svg`, category: "cute" },
  { id: "c2", name: "Cherry Blossom", url: `${TWEMOJI_BASE}/1f338.svg`, category: "cute" },
  { id: "c3", name: "Magic Wand", url: `${TWEMOJI_BASE}/1fa84.svg`, category: "cute" },
  { id: "c4", name: "Butterfly", url: `${TWEMOJI_BASE}/1f98b.svg`, category: "cute" },
  { id: "c5", name: "Cloud", url: `${TWEMOJI_BASE}/2601.svg`, category: "cute" },

  // Love
  { id: "l1", name: "Red Heart", url: `${TWEMOJI_BASE}/2764.svg`, category: "love" },
  { id: "l2", name: "Sparkling Heart", url: `${TWEMOJI_BASE}/1f496.svg`, category: "love" },
  { id: "l3", name: "Two Hearts", url: `${TWEMOJI_BASE}/1f495.svg`, category: "love" },
  { id: "l4", name: "Heart Arrow", url: `${TWEMOJI_BASE}/1f498.svg`, category: "love" },
  { id: "l5", name: "Kiss", url: `${TWEMOJI_BASE}/1f48b.svg`, category: "love" },

  // Props (Glasses, Hats)
  { id: "p1", name: "Crown", url: `${TWEMOJI_BASE}/1f451.svg`, category: "props" },
  { id: "p2", name: "Party Hat", url: `${TWEMOJI_BASE}/1f973.svg`, category: "props" },
  { id: "p3", name: "Sunglasses", url: `${TWEMOJI_BASE}/1f576.svg`, category: "props" },
  { id: "p4", name: "Goggles", url: `${TWEMOJI_BASE}/1f97d.svg`, category: "props" },
  { id: "p5", name: "Halo", url: `${TWEMOJI_BASE}/1f607.svg`, category: "props" }, // Angel halo

  // Text / Expressions
  { id: "t1", name: "100", url: `${TWEMOJI_BASE}/1f4af.svg`, category: "text" },
  { id: "t2", name: "Anger", url: `${TWEMOJI_BASE}/1f4a2.svg`, category: "text" },
  { id: "t3", name: "Speech Bubble", url: `${TWEMOJI_BASE}/1f4ac.svg`, category: "text" },
  { id: "t4", name: "Zzz", url: `${TWEMOJI_BASE}/1f4a4.svg`, category: "text" },
  { id: "t5", name: "Sweat", url: `${TWEMOJI_BASE}/1f4a6.svg`, category: "text" },
];