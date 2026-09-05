// Frame definitions with rich visual properties
// Each frame is rendered on canvas with special effects

export interface FrameDef {
  id: string;
  name: string;
  emoji: string;
  category: "classic" | "korean" | "elegant" | "fun" | "dark" | "y2k";
  // Corner colors for gradient interpolation (Korean glitter style)
  cornerColors: { tl: string; tr: string; bl: string; br: string };
  // Label area
  labelBg: string;
  labelText: string;
  // Sizing
  borderWidth: number;
  borderRadius: number;
  innerRadius: number;
  gap: number; // gap between photos in strip/grid
  // Font
  fontFamily: string;
  // Effects
  hasGlitter: boolean;
  hasSparkles: boolean;
  hasSprockets: boolean; // film strip holes
  hasInnerShadow: boolean;
  // Optional solid/gradient override (if not using corner interpolation)
  solidColor?: string;
  patternType?: "none" | "dots" | "hearts" | "stars" | "stripes" | "checkered";
}

export const FRAMES: FrameDef[] = [
  // ===== CLASSIC =====
  {
    id: "classic-white",
    name: "Classic White",
    emoji: "⬜",
    category: "classic",
    cornerColors: { tl: "#ffffff", tr: "#ffffff", bl: "#ffffff", br: "#ffffff" },
    labelBg: "#ffffff",
    labelText: "#333333",
    borderWidth: 36,
    borderRadius: 4,
    innerRadius: 2,
    gap: 10,
    fontFamily: "'Georgia', serif",
    hasGlitter: false,
    hasSparkles: false,
    hasSprockets: false,
    hasInnerShadow: true,
    solidColor: "#ffffff",
  },
  {
    id: "polaroid-cream",
    name: "Polaroid",
    emoji: "📷",
    category: "classic",
    cornerColors: { tl: "#faf8f0", tr: "#f5f0e0", bl: "#f0ead0", br: "#ede5c8" },
    labelBg: "#faf8f0",
    labelText: "#5a5040",
    borderWidth: 30,
    borderRadius: 4,
    innerRadius: 0,
    gap: 0,
    fontFamily: "'Georgia', serif",
    hasGlitter: false,
    hasSparkles: false,
    hasSprockets: false,
    hasInnerShadow: true,
    solidColor: "#faf8f0",
  },

  // ===== KOREAN =====
  {
    id: "korean-pink",
    name: "Pink Dream",
    emoji: "🌸",
    category: "korean",
    cornerColors: { tl: "#ffb6c1", tr: "#ff69b4", bl: "#dda0dd", br: "#ff1493" },
    labelBg: "#fff0f5",
    labelText: "#c71585",
    borderWidth: 32,
    borderRadius: 12,
    innerRadius: 8,
    gap: 10,
    fontFamily: "'Nunito', sans-serif",
    hasGlitter: true,
    hasSparkles: true,
    hasSprockets: false,
    hasInnerShadow: false,
  },
  {
    id: "korean-blue",
    name: "Ocean Sky",
    emoji: "🌊",
    category: "korean",
    cornerColors: { tl: "#87ceeb", tr: "#4169e1", bl: "#00bfff", br: "#1e90ff" },
    labelBg: "#f0f8ff",
    labelText: "#1e3a5f",
    borderWidth: 32,
    borderRadius: 12,
    innerRadius: 8,
    gap: 10,
    fontFamily: "'Nunito', sans-serif",
    hasGlitter: true,
    hasSparkles: true,
    hasSprockets: false,
    hasInnerShadow: false,
  },

  // ===== NEW DESIGN FRAMES =====
  {
    id: "scrapbook-cute",
    name: "Scrapbook",
    emoji: "📓",
    category: "fun",
    cornerColors: { tl: "#fdfbf7", tr: "#fdfbf7", bl: "#fdfbf7", br: "#fdfbf7" },
    labelBg: "#fdfbf7",
    labelText: "#8b6cb0",
    borderWidth: 40,
    borderRadius: 0,
    innerRadius: 0,
    gap: 15,
    fontFamily: "'Nunito', sans-serif",
    hasGlitter: false,
    hasSparkles: false,
    hasSprockets: false,
    hasInnerShadow: true,
    patternType: "dots",
    solidColor: "#fdfbf7",
  },
  {
    id: "checkered-pink",
    name: "Pink Checker",
    emoji: "🏁",
    category: "y2k",
    cornerColors: { tl: "#ff69b4", tr: "#ffffff", bl: "#ff69b4", br: "#ffffff" },
    labelBg: "#ff69b4",
    labelText: "#ffffff",
    borderWidth: 32,
    borderRadius: 16,
    innerRadius: 8,
    gap: 12,
    fontFamily: "'Nunito', sans-serif",
    hasGlitter: false,
    hasSparkles: false,
    hasSprockets: false,
    hasInnerShadow: true,
    patternType: "checkered",
  },
  {
    id: "y2k-cyber",
    name: "Y2K Cyber",
    emoji: "💿",
    category: "y2k",
    cornerColors: { tl: "#0a0a0a", tr: "#0a0a0a", bl: "#0a0a0a", br: "#0a0a0a" },
    labelBg: "#0a0a0a",
    labelText: "#00ffff",
    borderWidth: 40,
    borderRadius: 20,
    innerRadius: 10,
    gap: 16,
    fontFamily: "'Courier New', monospace",
    hasGlitter: true,
    hasSparkles: false,
    hasSprockets: false,
    hasInnerShadow: false,
    solidColor: "#0a0a0a",
  },

  // ===== ELEGANT =====
  {
    id: "wedding-gold",
    name: "Wedding Gold",
    emoji: "💍",
    category: "elegant",
    cornerColors: { tl: "#d4af37", tr: "#ffd700", bl: "#b8860b", br: "#daa520" },
    labelBg: "#1a1a2e",
    labelText: "#d4af37",
    borderWidth: 28,
    borderRadius: 8,
    innerRadius: 4,
    gap: 10,
    fontFamily: "'Georgia', serif",
    hasGlitter: true,
    hasSparkles: true,
    hasSprockets: false,
    hasInnerShadow: true,
  },

  // ===== DARK =====
  {
    id: "film-noir",
    name: "Film Strip",
    emoji: "🎬",
    category: "dark",
    cornerColors: { tl: "#1a1a1a", tr: "#1a1a1a", bl: "#1a1a1a", br: "#1a1a1a" },
    labelBg: "#1a1a1a",
    labelText: "#ff4444",
    borderWidth: 36,
    borderRadius: 0,
    innerRadius: 0,
    gap: 12,
    fontFamily: "'Courier New', monospace",
    hasGlitter: false,
    hasSparkles: false,
    hasSprockets: true,
    hasInnerShadow: false,
    solidColor: "#1a1a1a",
  },
];

export const FRAME_CATEGORIES = [
  { id: "all", name: "Semua", emoji: "✨" },
  { id: "classic", name: "Classic", emoji: "📷" },
  { id: "korean", name: "Korean", emoji: "🇰🇷" },
  { id: "y2k", name: "Y2K", emoji: "💿" },
  { id: "elegant", name: "Elegant", emoji: "💎" },
  { id: "fun", name: "Fun", emoji: "🎉" },
  { id: "dark", name: "Dark", emoji: "🌙" },
] as const;
