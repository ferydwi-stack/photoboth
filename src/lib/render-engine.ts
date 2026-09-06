import { FrameDef } from "@/lib/frames";
import { PlacedSticker } from "@/lib/stickers";
import { LayoutType } from "@/store/photobooth-store";

// ===========================
// Color & Gradient Utilities
// ===========================

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ];
  }
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function lerpColor(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function bilinearColor(
  tl: [number, number, number], tr: [number, number, number],
  bl: [number, number, number], br: [number, number, number],
  u: number, v: number
): [number, number, number] {
  const top = lerpColor(tl, tr, u);
  const bot = lerpColor(bl, br, u);
  return lerpColor(top, bot, v);
}

// Rounded rectangle path helper
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Arch / Cathedral Dome Path Helper (Lengkungan Kubah Seni Seoul Estetik)
export function drawArchPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  const domeRadius = Math.min(w / 2, h / 2);
  const bottomRadius = Math.min(r, 14, Math.max(0, (h - domeRadius) / 2));

  ctx.beginPath();
  // Bottom-left corner
  ctx.moveTo(x + bottomRadius, y + h);
  // Bottom line to bottom-right
  ctx.lineTo(x + w - bottomRadius, y + h);
  ctx.quadraticCurveTo(x + w, y + h, x + w, y + h - bottomRadius);
  // Right side up to dome base
  ctx.lineTo(x + w, y + domeRadius);
  // Arch semicircle dome across top
  ctx.arc(x + w / 2, y + domeRadius, domeRadius, 0, Math.PI, true);
  // Left side down to bottom-left
  ctx.lineTo(x, y + h - bottomRadius);
  ctx.quadraticCurveTo(x, y + h, x + bottomRadius, y + h);
  ctx.closePath();
}

// Unified slot shape path selector
export function drawSlotPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
  shapeStyle?: string
) {
  if (shapeStyle === "arch") {
    drawArchPath(ctx, x, y, w, h, r);
  } else {
    roundRect(ctx, x, y, w, h, r);
  }
}

// Draw Washi Tape Strip at specific coordinates
export function drawWashiTape(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  length: number, width: number,
  angleDeg: number,
  color: string = "rgba(244, 114, 182, 0.85)"
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((angleDeg * Math.PI) / 180);

  const halfL = length / 2;
  const halfW = width / 2;

  ctx.shadowColor = "rgba(0, 0, 0, 0.14)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.88;

  // Draw tape body with zigzag torn ends
  ctx.beginPath();
  ctx.moveTo(-halfL, -halfW);
  // Top straight edge
  ctx.lineTo(halfL, -halfW);
  // Right zigzag torn edge
  ctx.lineTo(halfL + 3, -halfW + width * 0.25);
  ctx.lineTo(halfL - 2, -halfW + width * 0.5);
  ctx.lineTo(halfL + 3, -halfW + width * 0.75);
  ctx.lineTo(halfL, halfW);
  // Bottom straight edge
  ctx.lineTo(-halfL, halfW);
  // Left zigzag torn edge
  ctx.lineTo(-halfL - 3, halfW - width * 0.25);
  ctx.lineTo(-halfL + 2, halfW - width * 0.5);
  ctx.lineTo(-halfL - 3, halfW - width * 0.75);
  ctx.closePath();
  ctx.fill();

  // Subtle tape paper fibers / texture
  ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

// Draw Postage Stamp Perforations along outer perimeter
export function drawStampPerforations(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  holeR: number = 6,
  gap: number = 18
) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.globalCompositeOperation = "destination-out";

  // Top & Bottom edges
  for (let x = gap; x < w - gap / 2; x += gap) {
    ctx.beginPath();
    ctx.arc(x, 0, holeR, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, h, holeR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Left & Right edges
  for (let y = gap; y < h - gap / 2; y += gap) {
    ctx.beginPath();
    ctx.arc(0, y, holeR, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(w, y, holeR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Draw Wavy Ribbon Cutout decoration
export function drawWavyBorderDecor(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  color: string = "rgba(255, 255, 255, 0.7)"
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();

  // Left wavy accent
  const step = 20;
  for (let y = 30; y < h - 120; y += step) {
    const x = 12 + Math.sin(y / 10) * 4;
    if (y === 30) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Right wavy accent
  ctx.beginPath();
  for (let y = 30; y < h - 120; y += step) {
    const x = w - 12 + Math.sin(y / 10) * 4;
    if (y === 30) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

// ===========================
// Border & Background Drawing
// ===========================

function drawFrameBorder(
  ctx: CanvasRenderingContext2D, frame: FrameDef, w: number, h: number
) {
  if (frame.solidColor) {
    ctx.fillStyle = frame.solidColor;
    roundRect(ctx, 0, 0, w, h, frame.borderRadius);
    ctx.fill();
  } else {
    try {
      const imgData = ctx.createImageData(w, h);
      const tl = hexToRgb(frame.cornerColors.tl);
      const tr = hexToRgb(frame.cornerColors.tr);
      const bl = hexToRgb(frame.cornerColors.bl);
      const br = hexToRgb(frame.cornerColors.br);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const u = x / Math.max(1, w - 1);
          const v = y / Math.max(1, h - 1);
          const [r, g, b] = bilinearColor(tl, tr, bl, br, u, v);
          const idx = (y * w + x) * 4;
          imgData.data[idx] = r;
          imgData.data[idx + 1] = g;
          imgData.data[idx + 2] = b;
          imgData.data[idx + 3] = 255;
        }
      }

      const tmp = document.createElement("canvas");
      tmp.width = w;
      tmp.height = h;
      const tmpCtx = tmp.getContext("2d")!;
      tmpCtx.putImageData(imgData, 0, 0);

      ctx.save();
      roundRect(ctx, 0, 0, w, h, frame.borderRadius);
      ctx.clip();
      ctx.drawImage(tmp, 0, 0);
      ctx.restore();
    } catch {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, frame.cornerColors.tl);
      grad.addColorStop(1, frame.cornerColors.br);
      ctx.fillStyle = grad;
      roundRect(ctx, 0, 0, w, h, frame.borderRadius);
      ctx.fill();
    }
  }
}

// Draw 35mm film strip sprockets (holes) on left & right
function drawSprocketHoles(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  const holeW = 12;
  const holeH = 16;
  const step = 28;
  const offsetLeft = 10;
  const offsetRight = w - 10 - holeW;

  for (let y = 16; y < h - 16; y += step) {
    roundRect(ctx, offsetLeft, y, holeW, holeH, 4);
    ctx.fill();
    roundRect(ctx, offsetRight, y, holeW, holeH, 4);
    ctx.fill();
  }
  ctx.restore();
}

// Draw glitter/sparkles
function drawSparkleGlitter(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  const count = 45;
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const radius = Math.random() * 2.5 + 1;
    const alpha = Math.random() * 0.6 + 0.2;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Draw Album Art, Band Logos, and Signature Music Graphics
function drawMusicBandThemeGraphics(
  ctx: CanvasRenderingContext2D,
  frame: FrameDef,
  w: number,
  h: number,
  labelY: number
) {
  const theme = frame.musicTheme;
  if (!theme) return;

  ctx.save();

  switch (theme) {
    case "the1975": {
      // The 1975 Signature Neon Rectangle Box Outline
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 2.5;
      roundRect(ctx, w / 2 - 32, 6, 64, 18, 4);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("THE 1975", w / 2, 16);

      // Left Margin: Tape Time Code & Track
      ctx.save();
      ctx.translate(12, h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.font = "bold 8.5px monospace";
      ctx.textAlign = "center";
      ctx.fillText("BFIAFL // ABOUT YOU // NO. 1975-A1", 0, 0);
      ctx.restore();

      // Right Margin: Stereo Balance Indicator
      ctx.save();
      ctx.translate(w - 12, h / 2);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.font = "bold 8.5px monospace";
      ctx.textAlign = "center";
      ctx.fillText("[L] ━━━━●━━━━━ [R] STEREO", 0, 0);
      ctx.restore();
      break;
    }

    case "multo": {
      // Multo - Cup of Joe: Dark Romantic Crimson & Gothic Floral Rose Motif
      ctx.fillStyle = "#fed7aa";
      ctx.font = "italic bold 11px 'Georgia', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🥀 MULTO • CUP OF JOE 🥀", w / 2, 16);

      ctx.strokeStyle = "rgba(254, 215, 170, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 90, 22);
      ctx.lineTo(w / 2 + 90, 22);
      ctx.stroke();

      // Left & Right Margins: Filipino Indie Ballad Stamp
      ctx.save();
      ctx.translate(12, h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = "rgba(254, 215, 170, 0.35)";
      ctx.font = "italic 8.5px 'Georgia', serif";
      ctx.textAlign = "center";
      ctx.fillText("OPM HITS // KAHIT SA PANAGINIP LANG", 0, 0);
      ctx.restore();

      // Delicate Rose Petals in Corners
      ctx.strokeStyle = "rgba(254, 215, 170, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(20, 20, 8, 0, Math.PI);
      ctx.arc(w - 20, 20, 8, 0, Math.PI);
      ctx.stroke();
      break;
    }

    case "wavetoearth": {
      // wave to earth: Ocean Wave Ripples & Lo-fi Vinyl Grooves
      ctx.fillStyle = "#7dd3fc";
      ctx.font = "900 11px 'Nunito', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("wave to earth 🌊 seasons", w / 2, 16);

      // Smooth sinusoidal wave curves along side borders
      ctx.strokeStyle = "rgba(125, 211, 252, 0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let y = 30; y < h - 40; y += 40) {
        ctx.moveTo(10, y);
        ctx.bezierCurveTo(16, y + 10, 6, y + 20, 10, y + 30);
        ctx.moveTo(w - 10, y);
        ctx.bezierCurveTo(w - 6, y + 10, w - 16, y + 20, w - 10, y + 30);
      }
      ctx.stroke();

      // Vinyl record groove arc in top right corner
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      for (let r = 20; r <= 45; r += 7) {
        ctx.beginPath();
        ctx.arc(w, 0, r, Math.PI / 2, Math.PI);
        ctx.stroke();
      }
      break;
    }

    case "newjeans": {
      // NewJeans: Y2K Camcorder REC HUD & Bunny Ears Sparkles
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(20, 16, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("● REC  00:03:06 [SP]", 28, 16);

      ctx.textAlign = "right";
      ctx.fillText("1080p HD ✦ NewJeans 🐰", w - 16, 16);

      // Y2K Sparkle Stars along borders
      ctx.fillStyle = "rgba(233, 213, 255, 0.85)";
      ctx.font = "12px sans-serif";
      ctx.fillText("✦", 10, h / 3);
      ctx.fillText("✧", w - 16, h / 2.5);
      ctx.fillText("✦", 10, (h / 3) * 2);
      break;
    }

    case "arcticmonkeys": {
      // Arctic Monkeys: Iconic AM Oscillating Soundwave Frequency Pulse
      const centerY = 16;
      const waveCount = 21;
      const step = 4;
      const startX = w / 2 - (waveCount * step) / 2;

      ctx.lineWidth = 1.8;
      for (let i = 0; i < waveCount; i++) {
        const distFromCenter = Math.abs(i - Math.floor(waveCount / 2));
        const amp = Math.max(2, 12 - distFromCenter * 1.1);
        ctx.strokeStyle = distFromCenter < 3 ? "#f43f5e" : "rgba(255, 255, 255, 0.85)";
        ctx.beginPath();
        ctx.moveTo(startX + i * step, centerY - amp);
        ctx.lineTo(startX + i * step, centerY + amp);
        ctx.stroke();
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 10px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("AM", 16, 16);

      ctx.textAlign = "right";
      ctx.fillStyle = "#f43f5e";
      ctx.fillText("505", w - 16, 16);
      break;
    }

    case "taylorswift": {
      // Taylor Swift: Script "Lover" Glow & Floating Hearts
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(244, 114, 182, 0.8)";
      ctx.shadowBlur = 8;
      ctx.font = "italic bold 18px 'Georgia', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Lover ♡", w / 2, 17);
      ctx.restore();

      // Floating heart watermark outlines in corners
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("💖 TAYLOR SWIFT", 16, 17);
      ctx.textAlign = "right";
      ctx.fillText("ERA'S TOUR 💖", w - 16, 17);
      break;
    }

    case "sza": {
      // SZA: Deep Sea Marine SOS Watermark
      ctx.fillStyle = "#fde047";
      ctx.font = "900 11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚓ S • O • S // SNOOZE ⚓", w / 2, 16);

      ctx.strokeStyle = "rgba(253, 224, 71, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 80, 22);
      ctx.lineTo(w / 2 + 80, 22);
      ctx.stroke();
      break;
    }

    case "frankocean": {
      // Frank Ocean: Bauhaus Minimal Racing Stripes & Blonded Logo
      ctx.fillStyle = "#15803d";
      ctx.fillRect(16, 11, 16, 6);
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(34, 11, 16, 6);
      ctx.fillStyle = "#fef3c7";
      ctx.fillRect(52, 11, 16, 6);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("B L O N D E D", w / 2, 15);

      ctx.textAlign = "right";
      ctx.fillStyle = "#fdba74";
      ctx.font = "bold 9px monospace";
      ctx.fillText("PINK + WHITE 🍊", w - 16, 15);
      break;
    }
  }

  ctx.restore();
}

// Draw checkered pattern
function drawCheckeredPattern(
  ctx: CanvasRenderingContext2D, w: number, h: number, c1: string, c2: string
) {
  ctx.save();
  const sz = 24;
  for (let y = 0; y < h; y += sz) {
    for (let x = 0; x < w; x += sz) {
      ctx.fillStyle = (x / sz + y / sz) % 2 === 0 ? c1 : c2;
      ctx.fillRect(x, y, sz, sz);
    }
  }
  ctx.restore();
}

// Draw subtle inner shadow around photo slots
function drawInnerShadow(
  ctx: CanvasRenderingContext2D, x: number, y: number, pw: number, ph: number, r: number
) {
  ctx.save();
  roundRect(ctx, x, y, pw, ph, r);
  ctx.clip();
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 8;
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 4;
  roundRect(ctx, x - 2, y - 2, pw + 4, ph + 4, r);
  ctx.stroke();
  ctx.restore();
}

// Draw empty slot placeholder
function drawEmptySlot(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  slotNumber: number, innerRadius: number,
  shapeStyle?: string
) {
  ctx.save();
  drawSlotPath(ctx, x, y, w, h, innerRadius, shapeStyle);
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fill();

  ctx.strokeStyle = "rgba(45, 27, 78, 0.35)";
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 6]);
  drawSlotPath(ctx, x, y, w, h, innerRadius, shapeStyle);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(45, 27, 78, 0.6)";
  ctx.font = "bold 16px 'Nunito', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`+ Slot ${slotNumber} (Pilih Foto)`, x + w / 2, y + h / 2);
  ctx.restore();
}

// Draw image covering the slot without stretching (object-fit: cover)
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number,
  filterCss?: string
) {
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;

  const targetRatio = w / h;
  const imgRatio = imgW / imgH;

  let sx = 0, sy = 0, sw = imgW, sh = imgH;

  if (imgRatio > targetRatio) {
    sw = imgH * targetRatio;
    sx = (imgW - sw) / 2;
  } else {
    sh = imgW / targetRatio;
    sy = (imgH - sh) / 2;
  }

  if (filterCss && filterCss !== "none") {
    ctx.filter = filterCss;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.filter = "none";
}

// Draw branding header/footer stamp
function drawFrameStamp(
  ctx: CanvasRenderingContext2D,
  frame: FrameDef,
  w: number,
  labelY: number,
  labelH: number,
  title: string,
  subtitle: string,
  showDate: boolean
) {
  ctx.save();
  ctx.fillStyle = frame.labelBg;
  roundRect(ctx, frame.borderWidth / 2, labelY, w - frame.borderWidth, labelH - 8, frame.borderRadius / 1.5);
  ctx.fill();

  ctx.fillStyle = frame.labelText;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const centerY = labelY + labelH / 2;

  ctx.font = `900 24px ${frame.fontFamily}`;
  ctx.fillText(title || "KikoBooth", w / 2, centerY - 14);

  ctx.font = `700 13px ${frame.fontFamily}`;
  ctx.globalAlpha = 0.8;
  ctx.fillText(subtitle || "Seoul Photo Studio", w / 2, centerY + 8);

  if (showDate) {
    const dateStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    ctx.font = `600 11px ${frame.fontFamily}`;
    ctx.globalAlpha = 0.6;
    ctx.fillText(dateStr, w / 2, centerY + 25);
  }

  ctx.restore();
}

// Draw stickers on top of the strip
async function drawPlacedStickers(
  ctx: CanvasRenderingContext2D,
  stickers: PlacedSticker[],
  stripW: number,
  stripH: number,
  loadedImgs: Map<string, HTMLImageElement>
) {
  stickers.forEach((s) => {
    const x = (s.x / 100) * stripW;
    const y = (s.y / 100) * stripH;
    const baseSize = 68 * (s.scale || 1);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(((s.rotation || 0) * Math.PI) / 180);

    const img = loadedImgs.get(s.url);
    if (img) {
      const aspect =
        img.naturalWidth && img.naturalHeight
          ? img.naturalWidth / img.naturalHeight
          : 1;
      const drawW = aspect >= 1 ? baseSize * aspect : baseSize;
      const drawH = aspect >= 1 ? baseSize : baseSize / aspect;

      ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
      ctx.shadowBlur = 6;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    }
    ctx.restore();
  });
}

// Load unique sticker images into memory
export async function loadStickerImages(stickers: PlacedSticker[]): Promise<Map<string, HTMLImageElement>> {
  const unique = [...new Set(stickers.map((s) => s.url))];
  const pairs = await Promise.all(
    unique.map((url) =>
      new Promise<[string, HTMLImageElement]>((res) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => res([url, img]);
        img.onerror = () => res([url, img]);
        img.src = url;
      })
    )
  );
  return new Map(pairs);
}

// ===========================
// Layout Geometry Computation
// ===========================

export interface LayoutGeometry {
  baseWidth: number;
  baseHeight: number;
  slots: { x: number; y: number; w: number; h: number }[];
  labelY: number;
  labelH: number;
}

export function computeLayoutGeometry(
  layout: LayoutType,
  frame: FrameDef
): LayoutGeometry {
  const bw = frame.borderWidth;
  const gap = frame.gap;
  const labelH = 88;

  switch (layout) {
    case "strip-4": {
      // 1 column x 4 rows
      const sw = 440, sh = 310;
      const baseW = sw + bw * 2;
      const baseH = bw * 2 + sh * 4 + gap * 3 + labelH;
      const slots = [0, 1, 2, 3].map((i) => ({
        x: bw,
        y: bw + i * (sh + gap),
        w: sw,
        h: sh,
      }));
      return { baseWidth: baseW, baseHeight: baseH, slots, labelY: baseH - bw - labelH, labelH };
    }

    case "mosaic-4": {
      // 1 Hero Besar di atas (520x330) + 3 foto mini asimetris di bawah
      const sw = 520, heroH = 330;
      const miniH = 175;
      const miniW = Math.floor((sw - gap * 2) / 3);
      const lastMiniW = sw - (miniW + gap) * 2;
      const baseW = sw + bw * 2;
      const baseH = bw * 2 + heroH + gap + miniH + labelH;
      const slots = [
        { x: bw, y: bw, w: sw, h: heroH },
        { x: bw, y: bw + heroH + gap, w: miniW, h: miniH },
        { x: bw + miniW + gap, y: bw + heroH + gap, w: miniW, h: miniH },
        { x: bw + (miniW + gap) * 2, y: bw + heroH + gap, w: lastMiniW, h: miniH },
      ];
      return { baseWidth: baseW, baseHeight: baseH, slots, labelY: baseH - bw - labelH, labelH };
    }

    case "asym-split-3": {
      // 1 Portrait tinggi di kiri (Lookbook) + 2 Landscape bertumpuk di kanan
      const leftW = 270, totalH = 520;
      const rightW = 270;
      const rightH = Math.floor((totalH - gap) / 2);
      const rightH2 = totalH - gap - rightH;
      const baseW = bw * 2 + leftW + gap + rightW;
      const baseH = bw * 2 + totalH + labelH;
      const slots = [
        { x: bw, y: bw, w: leftW, h: totalH },
        { x: bw + leftW + gap, y: bw, w: rightW, h: rightH },
        { x: bw + leftW + gap, y: bw + rightH + gap, w: rightW, h: rightH2 },
      ];
      return { baseWidth: baseW, baseHeight: baseH, slots, labelY: baseH - bw - labelH, labelH };
    }

    case "zigzag-4": {
      // 4 Foto staggered zig-zag / nyeleneh dengan lebar & offset dinamis
      const baseInnerW = 500;
      const sh = 235;
      const baseW = baseInnerW + bw * 2;
      const baseH = bw * 2 + sh * 4 + gap * 3 + labelH;
      const slots = [
        { x: bw, y: bw, w: 430, h: sh },
        { x: bw + 70, y: bw + sh + gap, w: 430, h: sh },
        { x: bw + 20, y: bw + (sh + gap) * 2, w: 440, h: sh },
        { x: bw + 40, y: bw + (sh + gap) * 3, w: 460, h: sh },
      ];
      return { baseWidth: baseW, baseHeight: baseH, slots, labelY: baseH - bw - labelH, labelH };
    }

    case "cinema-receipt-3": {
      // Format Struk Belanja / Barcode Cafe Korea (3 Foto: 1 Hero + 2 Mini)
      const contentW = 460;
      const heroH = 290;
      const miniH = 220;
      const miniW = Math.floor((contentW - gap) / 2);
      const topReceiptMargin = 20;
      const baseW = contentW + bw * 2;
      const baseH = bw * 2 + topReceiptMargin + heroH + gap + miniH + labelH + 30;
      const slots = [
        { x: bw, y: bw + topReceiptMargin, w: contentW, h: heroH },
        { x: bw, y: bw + topReceiptMargin + heroH + gap, w: miniW, h: miniH },
        { x: bw + miniW + gap, y: bw + topReceiptMargin + heroH + gap, w: contentW - miniW - gap, h: miniH },
      ];
      return { baseWidth: baseW, baseHeight: baseH, slots, labelY: baseH - bw - labelH - 10, labelH };
    }

    case "polaroid-pile-3": {
      // Tumpukan Polaroid bersusun estetik (Scrapbook) dengan ukuran bervariasi
      const baseInnerW = 480;
      const baseW = baseInnerW + bw * 2;
      const h0 = 280, h1 = 290, h2 = 280;
      const overlap = 25;
      const baseH = bw * 2 + h0 + h1 + h2 - (overlap * 2) + labelH + 20;
      const slots = [
        { x: bw + 20, y: bw + 15, w: 390, h: h0 },
        { x: bw + 70, y: bw + 15 + h0 - overlap, w: 390, h: h1 },
        { x: bw + 30, y: bw + 15 + h0 - overlap + h1 - overlap, w: 390, h: h2 },
      ];
      return { baseWidth: baseW, baseHeight: baseH, slots, labelY: baseH - bw - labelH, labelH };
    }

    case "grid-4": {
      // 2 columns x 2 rows (Photoism / Haru Film Square)
      const sw = 390, sh = 280;
      const baseW = bw * 2 + sw * 2 + gap;
      const baseH = bw * 2 + sh * 2 + gap + labelH;
      const slots = [
        { x: bw, y: bw, w: sw, h: sh },
        { x: bw + sw + gap, y: bw, w: sw, h: sh },
        { x: bw, y: bw + sh + gap, w: sw, h: sh },
        { x: bw + sw + gap, y: bw + sh + gap, w: sw, h: sh },
      ];
      return { baseWidth: baseW, baseHeight: baseH, slots, labelY: baseH - bw - labelH, labelH };
    }

    case "strip-3": {
      // 1 column x 3 rows
      const sw = 440, sh = 310;
      const baseW = sw + bw * 2;
      const baseH = bw * 2 + sh * 3 + gap * 2 + labelH;
      const slots = [0, 1, 2].map((i) => ({
        x: bw,
        y: bw + i * (sh + gap),
        w: sw,
        h: sh,
      }));
      return { baseWidth: baseW, baseHeight: baseH, slots, labelY: baseH - bw - labelH, labelH };
    }

    case "grid-6": {
      // 2 columns x 3 rows (Poster)
      const sw = 390, sh = 275;
      const baseW = bw * 2 + sw * 2 + gap;
      const baseH = bw * 2 + sh * 3 + gap * 2 + labelH;
      const slots = [
        { x: bw, y: bw, w: sw, h: sh },
        { x: bw + sw + gap, y: bw, w: sw, h: sh },
        { x: bw, y: bw + sh + gap, w: sw, h: sh },
        { x: bw + sw + gap, y: bw + sh + gap, w: sw, h: sh },
        { x: bw, y: bw + (sh + gap) * 2, w: sw, h: sh },
        { x: bw + sw + gap, y: bw + (sh + gap) * 2, w: sw, h: sh },
      ];
      return { baseWidth: baseW, baseHeight: baseH, slots, labelY: baseH - bw - labelH, labelH };
    }

    case "duo-2": {
      // 1 column x 2 rows (Landscape Duo)
      const sw = 500, sh = 340;
      const baseW = sw + bw * 2;
      const baseH = bw * 2 + sh * 2 + gap + labelH;
      const slots = [0, 1].map((i) => ({
        x: bw,
        y: bw + i * (sh + gap),
        w: sw,
        h: sh,
      }));
      return { baseWidth: baseW, baseHeight: baseH, slots, labelY: baseH - bw - labelH, labelH };
    }

    case "single-1": {
      // 1 column x 1 row (Polaroid)
      const sw = 500, sh = 400;
      const baseW = sw + bw * 2;
      const baseH = bw * 2 + sh + labelH + 20;
      const slots = [{ x: bw, y: bw, w: sw, h: sh }];
      return { baseWidth: baseW, baseHeight: baseH, slots, labelY: baseH - bw - labelH, labelH };
    }

    default: {
      const sw = 440, sh = 310;
      const baseW = sw + bw * 2;
      const baseH = bw * 2 + sh * 4 + gap * 3 + labelH;
      const slots = [0, 1, 2, 3].map((i) => ({
        x: bw,
        y: bw + i * (sh + gap),
        w: sw,
        h: sh,
      }));
      return { baseWidth: baseW, baseHeight: baseH, slots, labelY: baseH - bw - labelH, labelH };
    }
  }
}

// ===========================
// Public Rendering Options & API
// ===========================

export interface RenderStripOpts {
  frame: FrameDef;
  layout?: LayoutType;
  title?: string;
  subtitle?: string;
  showDate?: boolean;
  filterCss?: string;
  brightness?: number;
  contrast?: number;
  stickers?: PlacedSticker[];
  scaleFactor?: number;
}

/**
 * Render Photobooth Strip/Grid to canvas
 * Strictly maintains slot shape and photo aspect ratio across all layouts!
 */
export async function renderFixed4CutStrip(
  canvas: HTMLCanvasElement,
  slotImages: (HTMLImageElement | null)[],
  opts: RenderStripOpts
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { frame, layout = "strip-4", scaleFactor = 1 } = opts;
  const geom = computeLayoutGeometry(layout, frame);

  // Set real canvas dimensions with scaling
  canvas.width = Math.round(geom.baseWidth * scaleFactor);
  canvas.height = Math.round(geom.baseHeight * scaleFactor);

  ctx.save();
  ctx.scale(scaleFactor, scaleFactor);

  // 1. Draw Border & Background
  if (frame.patternType === "checkered") {
    drawCheckeredPattern(ctx, geom.baseWidth, geom.baseHeight, frame.cornerColors.tl, frame.cornerColors.tr);
  } else {
    drawFrameBorder(ctx, frame, geom.baseWidth, geom.baseHeight);
  }

  // Draw Album Art, Logos, & Signature Music Theme Graphics
  if (frame.musicTheme) {
    drawMusicBandThemeGraphics(ctx, frame, geom.baseWidth, geom.baseHeight, geom.labelY);
  }

  // 2. Decorative Effects & Artistic Borders
  if (frame.hasSprockets) {
    drawSprocketHoles(ctx, geom.baseWidth, geom.baseHeight);
  }
  if (frame.shapeStyle === "wave") {
    drawWavyBorderDecor(ctx, geom.baseWidth, geom.baseHeight);
  }
  if (frame.hasGlitter || frame.hasSparkles) {
    drawSparkleGlitter(ctx, geom.baseWidth, geom.baseHeight);
  }

  // 3. Build Filter CSS
  const filterParts: string[] = [];
  if (opts.filterCss && opts.filterCss !== "none") filterParts.push(opts.filterCss);
  if (opts.brightness !== undefined && opts.brightness !== 100)
    filterParts.push(`brightness(${opts.brightness}%)`);
  if (opts.contrast !== undefined && opts.contrast !== 100)
    filterParts.push(`contrast(${opts.contrast}%)`);
  const combinedFilter = filterParts.join(" ") || "none";

  // 4. Render Photo Slots based on geometry and artistic shape
  const shapeStyle = frame.shapeStyle;
  const TILT_ANGLES = [-2.0, 1.8, -1.4, 2.0, -1.8, 1.5];

  geom.slots.forEach((slot, i) => {
    const photoImg = slotImages[i];
    const isTilted = shapeStyle === "collage-tilt" || layout === "polaroid-pile-3";
    const pileAngles = [-3.2, 2.5, -2.0];
    const tiltDeg = isTilted
      ? layout === "polaroid-pile-3"
        ? pileAngles[i % pileAngles.length]
        : TILT_ANGLES[i % TILT_ANGLES.length]
      : 0;
    const cx = slot.x + slot.w / 2;
    const cy = slot.y + slot.h / 2;

    ctx.save();

    if (isTilted) {
      ctx.translate(cx, cy);
      ctx.rotate((tiltDeg * Math.PI) / 180);
      ctx.translate(-cx, -cy);

      // Draw white polaroid backing card with soft drop shadow
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.18)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, slot.x - 7, slot.y - 7, slot.w + 14, slot.h + 14, 10);
      ctx.fill();
      ctx.restore();
    }

    if (photoImg) {
      ctx.save();
      drawSlotPath(ctx, slot.x, slot.y, slot.w, slot.h, frame.innerRadius, shapeStyle);
      ctx.clip();
      drawImageCover(ctx, photoImg, slot.x, slot.y, slot.w, slot.h, combinedFilter);
      ctx.restore();

      if (frame.hasInnerShadow) {
        drawInnerShadow(ctx, slot.x, slot.y, slot.w, slot.h, frame.innerRadius);
      }

      // Washi Tape Artistic Accent across corners
      if (shapeStyle === "washi-tape") {
        const tapeColor = frame.washiColor || "rgba(244, 114, 182, 0.85)";
        drawWashiTape(ctx, slot.x + 18, slot.y + 12, 60, 20, -26, tapeColor);
        drawWashiTape(ctx, slot.x + slot.w - 18, slot.y + slot.h - 12, 60, 20, -26, tapeColor);
      }
    } else {
      drawEmptySlot(ctx, slot.x, slot.y, slot.w, slot.h, i + 1, frame.innerRadius, shapeStyle);
    }

    ctx.restore();
  });

  // Postage Stamp Perforation Effect along borders
  if (shapeStyle === "stamp") {
    drawStampPerforations(ctx, geom.baseWidth, geom.baseHeight, 7, 20);
  }

  // 5. Draw Footer / Header Stamp
  drawFrameStamp(
    ctx,
    frame,
    geom.baseWidth,
    geom.labelY,
    geom.labelH,
    opts.title || "KikoBooth",
    opts.subtitle || "Seoul Photo Studio",
    opts.showDate !== false
  );

  // 6. Draw Stickers & Emojis
  if (opts.stickers && opts.stickers.length > 0) {
    const stickerImgs = await loadStickerImages(opts.stickers);
    await drawPlacedStickers(ctx, opts.stickers, geom.baseWidth, geom.baseHeight, stickerImgs);
  }

  ctx.restore();
}

// Utility: Image loader
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

// Utility: Download canvas as PNG
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const a = document.createElement("a");
  a.download = filename;
  a.href = canvas.toDataURL("image/png", 1.0);
  a.click();
}

// Utility: Format filename
export function generateFilename(name: string): string {
  const ts = new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-");
  return `${name.replace(/\s+/g, "-").toLowerCase()}_photobooth_${ts}.png`;
}

// Utility: Flip a base64 DataURL horizontally
export function flipImageDataUrl(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}