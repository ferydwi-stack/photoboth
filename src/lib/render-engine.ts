import { FrameDef } from "@/lib/frames";
import { PlacedSticker } from "@/lib/stickers";

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
    // Bilinear gradient interpolation across 4 corners for ultra smooth aesthetic pastel
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
      // Fallback to simple linear gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, frame.cornerColors.tl);
      grad.addColorStop(1, frame.cornerColors.br);
      ctx.fillStyle = grad;
      roundRect(ctx, 0, 0, w, h, frame.borderRadius);
      ctx.fill();
    }
  }
}

// Draw 35mm film strip sprockets (holes) on left & right sides
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

// Draw empty slot placeholder when slot has no photo yet
function drawEmptySlot(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  slotNumber: number, innerRadius: number
) {
  ctx.save();
  roundRect(ctx, x, y, w, h, innerRadius);
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fill();

  ctx.strokeStyle = "rgba(45, 27, 78, 0.35)";
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Slot number & instruction text
  ctx.fillStyle = "rgba(45, 27, 78, 0.6)";
  ctx.font = "bold 18px 'Nunito', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`+ Slot ${slotNumber} (Pilih Foto)`, x + w / 2, y + h / 2);
  ctx.restore();
}

// Draw image covering the slot perfectly without stretching (object-fit: cover)
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
    // Image is wider than slot: crop left & right
    sw = imgH * targetRatio;
    sx = (imgW - sw) / 2;
  } else {
    // Image is taller than slot: crop top & bottom
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
  // Semi-transparent label background or solid
  ctx.fillStyle = frame.labelBg;
  roundRect(ctx, frame.borderWidth / 2, labelY, w - frame.borderWidth, labelH - 8, frame.borderRadius / 1.5);
  ctx.fill();

  ctx.fillStyle = frame.labelText;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const centerY = labelY + labelH / 2;

  // Title
  ctx.font = `900 24px ${frame.fontFamily}`;
  ctx.fillText(title || "KikoBooth", w / 2, centerY - 14);

  // Subtitle + Tagline
  ctx.font = `700 13px ${frame.fontFamily}`;
  ctx.globalAlpha = 0.8;
  ctx.fillText(subtitle || "Seoul Photo Studio", w / 2, centerY + 8);

  // Date
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
    const size = 68 * (s.scale || 1);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(((s.rotation || 0) * Math.PI) / 180);

    const img = loadedImgs.get(s.url);
    if (img) {
      ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
      ctx.shadowBlur = 6;
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
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
// Public Rendering Options & API
// ===========================

export interface RenderStripOpts {
  frame: FrameDef;
  title?: string;
  subtitle?: string;
  showDate?: boolean;
  filterCss?: string;
  brightness?: number;
  contrast?: number;
  stickers?: PlacedSticker[];
  scaleFactor?: number; // 1 for preview, 2.5 for high-res export
}

// Fixed dimensions for the Photobooth Strip
export const STRIP_CONFIG = {
  slotWidth: 440,
  slotHeight: 310,
  labelHeight: 88,
  totalSlots: 4,
};

/**
 * Render the fixed-size 4-Cut Photobooth Strip to canvas
 * Strictly maintains slot shape and photo aspect ratio!
 */
export async function renderFixed4CutStrip(
  canvas: HTMLCanvasElement,
  slotImages: (HTMLImageElement | null)[],
  opts: RenderStripOpts
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { frame, scaleFactor = 1 } = opts;
  const bw = frame.borderWidth;
  const gap = frame.gap;
  const labelH = STRIP_CONFIG.labelHeight;

  const baseW = STRIP_CONFIG.slotWidth + bw * 2;
  const baseH =
    bw * 2 +
    STRIP_CONFIG.slotHeight * STRIP_CONFIG.totalSlots +
    gap * (STRIP_CONFIG.totalSlots - 1) +
    labelH;

  // Set real canvas dimensions with scaling
  canvas.width = Math.round(baseW * scaleFactor);
  canvas.height = Math.round(baseH * scaleFactor);

  ctx.save();
  ctx.scale(scaleFactor, scaleFactor);

  // 1. Draw Border & Background
  if (frame.patternType === "checkered") {
    drawCheckeredPattern(ctx, baseW, baseH, frame.cornerColors.tl, frame.cornerColors.tr);
  } else {
    drawFrameBorder(ctx, frame, baseW, baseH);
  }

  // 2. Decorative Effects
  if (frame.hasSprockets) {
    drawSprocketHoles(ctx, baseW, baseH);
  }
  if (frame.hasGlitter || frame.hasSparkles) {
    drawSparkleGlitter(ctx, baseW, baseH);
  }

  // 3. Build Filter CSS
  const filterParts: string[] = [];
  if (opts.filterCss && opts.filterCss !== "none") filterParts.push(opts.filterCss);
  if (opts.brightness !== undefined && opts.brightness !== 100)
    filterParts.push(`brightness(${opts.brightness}%)`);
  if (opts.contrast !== undefined && opts.contrast !== 100)
    filterParts.push(`contrast(${opts.contrast}%)`);
  const combinedFilter = filterParts.join(" ") || "none";

  // 4. Render the 4 Fixed Photo Slots
  const slotX = bw;
  for (let i = 0; i < STRIP_CONFIG.totalSlots; i++) {
    const slotY = bw + i * (STRIP_CONFIG.slotHeight + gap);
    const photoImg = slotImages[i];

    if (photoImg) {
      ctx.save();
      roundRect(ctx, slotX, slotY, STRIP_CONFIG.slotWidth, STRIP_CONFIG.slotHeight, frame.innerRadius);
      ctx.clip();
      drawImageCover(
        ctx,
        photoImg,
        slotX,
        slotY,
        STRIP_CONFIG.slotWidth,
        STRIP_CONFIG.slotHeight,
        combinedFilter
      );
      ctx.restore();

      if (frame.hasInnerShadow) {
        drawInnerShadow(
          ctx,
          slotX,
          slotY,
          STRIP_CONFIG.slotWidth,
          STRIP_CONFIG.slotHeight,
          frame.innerRadius
        );
      }
    } else {
      // Empty slot placeholder
      drawEmptySlot(
        ctx,
        slotX,
        slotY,
        STRIP_CONFIG.slotWidth,
        STRIP_CONFIG.slotHeight,
        i + 1,
        frame.innerRadius
      );
    }
  }

  // 5. Draw Footer / Header Stamp
  const labelY = baseH - bw - labelH;
  drawFrameStamp(
    ctx,
    frame,
    baseW,
    labelY,
    labelH,
    opts.title || "KikoBooth",
    opts.subtitle || "Seoul Photo Studio",
    opts.showDate !== false
  );

  // 6. Draw Stickers & Emojis
  if (opts.stickers && opts.stickers.length > 0) {
    const stickerImgs = await loadStickerImages(opts.stickers);
    await drawPlacedStickers(ctx, opts.stickers, baseW, baseH, stickerImgs);
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
  return `${name.replace(/\s+/g, "-").toLowerCase()}_4cut_${ts}.png`;
}