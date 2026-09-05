import { FrameDef } from "@/lib/frames";
import { PlacedSticker } from "@/lib/stickers";

// ===========================
// Color utilities
// ===========================

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
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

// ===========================
// Border rendering
// ===========================

function drawGradientBorder(
  ctx: CanvasRenderingContext2D, frame: FrameDef, w: number, h: number
) {
  if (frame.solidColor) {
    ctx.fillStyle = frame.solidColor;
    roundRect(ctx, 0, 0, w, h, frame.borderRadius);
    ctx.fill();
  } else {
    // Bilinear gradient via ImageData for smooth corner-to-corner blend
    const imgData = ctx.createImageData(w, h);
    const tl = hexToRgb(frame.cornerColors.tl);
    const tr = hexToRgb(frame.cornerColors.tr);
    const bl = hexToRgb(frame.cornerColors.bl);
    const br = hexToRgb(frame.cornerColors.br);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const u = x / (w - 1);
        const v = y / (h - 1);
        const [r, g, b] = bilinearColor(tl, tr, bl, br, u, v);
        const idx = (y * w + x) * 4;
        imgData.data[idx] = r;
        imgData.data[idx + 1] = g;
        imgData.data[idx + 2] = b;
        imgData.data[idx + 3] = 255;
      }
    }

    const tmp = document.createElement("canvas");
    tmp.width = w; tmp.height = h;
    const tmpCtx = tmp.getContext("2d")!;
    tmpCtx.putImageData(imgData, 0, 0);

    ctx.save();
    roundRect(ctx, 0, 0, w, h, frame.borderRadius);
    ctx.clip();
    ctx.drawImage(tmp, 0, 0);
    ctx.restore();
  }
}

function drawGlitter(ctx: CanvasRenderingContext2D, w: number, h: number, bw: number) {
  ctx.save();
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const inPhoto = x > bw && x < w - bw && y > bw && y < h - bw - 80;
    if (inPhoto) continue;
    const size = Math.random() * 2 + 0.5;
    const alpha = Math.random() * 0.5 + 0.1;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(x, y, size, size);
  }
  ctx.restore();
}

function drawSparkles(ctx: CanvasRenderingContext2D, w: number, h: number, bw: number) {
  ctx.save();
  const sparkleCount = 30;
  for (let i = 0; i < sparkleCount; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const inPhoto = x > bw + 4 && x < w - bw - 4 && y > bw + 4 && y < h - bw - 84;
    if (inPhoto) continue;
    const size = Math.random() * 4 + 2;
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.8 + 0.2})`;
    drawStar(ctx, x, y, size);
  }
  ctx.restore();
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.3, y - size * 0.3);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size * 0.3, y + size * 0.3);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size * 0.3, y + size * 0.3);
  ctx.lineTo(x - size, y);
  ctx.lineTo(x - size * 0.3, y - size * 0.3);
  ctx.closePath();
  ctx.fill();
}

function drawSprocketHoles(ctx: CanvasRenderingContext2D, w: number, h: number, bw: number) {
  ctx.save();
  const holeSize = 8;
  const spacing = 24;
  ctx.fillStyle = "#000000";
  for (let y = bw; y < h - 80; y += spacing) {
    roundRect(ctx, 6, y, holeSize, holeSize, 2);
    ctx.fill();
    ctx.beginPath();
  }
  for (let y = bw; y < h - 80; y += spacing) {
    roundRect(ctx, w - 6 - holeSize, y, holeSize, holeSize, 2);
    ctx.fill();
    ctx.beginPath();
  }
  ctx.restore();
}

function drawPattern(ctx: CanvasRenderingContext2D, type: string, w: number, h: number, bw: number) {
  ctx.save();
  ctx.globalAlpha = 0.15;
  const emoji = type === "hearts" ? "♥" : type === "stars" ? "★" : type === "dots" ? "●" : "♦";
  ctx.font = "14px sans-serif";
  ctx.fillStyle = "#ffffff";
  for (let y = 10; y < h; y += 30) {
    for (let x = 10; x < w; x += 30) {
      const inPhoto = x > bw && x < w - bw && y > bw && y < h - bw - 80;
      if (inPhoto) continue;
      ctx.fillText(emoji, x, y);
    }
  }
  ctx.restore();
}

// New: Checkered Pattern
function drawCheckered(ctx: CanvasRenderingContext2D, w: number, h: number, bw: number, color1: string, color2: string) {
  ctx.save();
  const size = 30;
  for (let y = 0; y < h; y += size) {
    for (let x = 0; x < w; x += size) {
      const inPhoto = x > bw - size && x < w - bw && y > bw - size && y < h - bw - 80 + size;
      if (inPhoto) continue; // rough exclusion
      ctx.fillStyle = ((x / size) + (y / size)) % 2 === 0 ? color1 : color2;
      ctx.fillRect(x, y, size, size);
    }
  }
  ctx.restore();
}

// New: Frame Overlays (Y2K, Scrapbook, etc)
function drawDecorations(ctx: CanvasRenderingContext2D, frame: FrameDef, w: number, h: number, bw: number) {
  if (frame.id === "y2k-cyber") {
    ctx.save();
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 4;
    // draw some neon lines
    ctx.beginPath(); ctx.moveTo(0, 50); ctx.lineTo(w, 50); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, h-100); ctx.lineTo(w, h-100); ctx.stroke();
    // draw some stars
    ctx.fillStyle = "#00ffff";
    drawStar(ctx, 40, 40, 15);
    drawStar(ctx, w - 40, h - 120, 20);
    ctx.restore();
  } else if (frame.id === "scrapbook-cute") {
    ctx.save();
    // tape on corners
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.translate(30, 30); ctx.rotate(-Math.PI / 8); ctx.fillRect(-20, -10, 60, 20);
    ctx.resetTransform();
    ctx.translate(w - 30, h - 100); ctx.rotate(-Math.PI / 8); ctx.fillRect(-20, -10, 60, 20);
    ctx.restore();
  }
}

function drawInnerShadow(ctx: CanvasRenderingContext2D, x: number, y: number, pw: number, ph: number, r: number) {
  ctx.save();
  roundRect(ctx, x, y, pw, ph, r);
  ctx.clip();
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 8;
  roundRect(ctx, x - 4, y - 4, pw + 8, ph + 8, r);
  ctx.stroke();
  ctx.restore();
}

// ===========================
// Label
// ===========================

function drawLabel(
  ctx: CanvasRenderingContext2D, frame: FrameDef,
  canvasW: number, labelY: number, labelH: number,
  title: string, subtitle: string
) {
  ctx.fillStyle = frame.labelBg;
  roundRect(ctx, 0, labelY, canvasW, labelH, frame.borderRadius);
  ctx.fill();

  ctx.fillStyle = frame.labelText;
  ctx.textAlign = "center";

  ctx.font = `bold 26px ${frame.fontFamily}`;
  ctx.fillText(title, canvasW / 2, labelY + 32, canvasW - 40);

  ctx.font = `15px ${frame.fontFamily}`;
  ctx.globalAlpha = 0.7;
  ctx.fillText(subtitle, canvasW / 2, labelY + 55, canvasW - 40);
  ctx.globalAlpha = 1;

  const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  ctx.font = `11px ${frame.fontFamily}`;
  ctx.globalAlpha = 0.5;
  ctx.fillText(dateStr, canvasW / 2, labelY + 74);
  ctx.globalAlpha = 1;
}

// ===========================
// Shared
// ===========================

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawStickers(ctx: CanvasRenderingContext2D, stickers: PlacedSticker[], px: number, py: number, pw: number, ph: number, loadedImgs: Map<string, HTMLImageElement>) {
  stickers.forEach((s) => {
    const x = px + (s.x / 100) * pw;
    const y = py + (s.y / 100) * ph;
    const size = 80 * s.scale;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((s.rotation * Math.PI) / 180);
    const img = loadedImgs.get(s.url);
    if (img) {
      ctx.shadowColor = "rgba(0,0,0,0.2)";
      ctx.shadowBlur = 4;
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
    }
    ctx.restore();
  });
}

function drawCustomText(ctx: CanvasRenderingContext2D, text: string, color: string, canvasW: number, y: number) {
  if (!text) return;
  ctx.save();
  ctx.font = "bold 30px 'Nunito', sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 6;
  ctx.fillText(text, canvasW / 2, y, canvasW - 60);
  ctx.restore();
}

function buildFilter(o: RenderOpts): string {
  const parts: string[] = [];
  if (o.filterCss && o.filterCss !== "none") parts.push(o.filterCss);
  if (o.brightness !== undefined && o.brightness !== 100) parts.push(`brightness(${o.brightness}%)`);
  if (o.contrast !== undefined && o.contrast !== 100) parts.push(`contrast(${o.contrast}%)`);
  return parts.join(" ") || "none";
}

function applyFilter(ctx: CanvasRenderingContext2D, filter: string, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  if (filter && filter !== "none") ctx.filter = filter;
  ctx.drawImage(img, x, y, w, h);
  ctx.filter = "none";
}

function drawEffects(ctx: CanvasRenderingContext2D, frame: FrameDef, w: number, h: number, bw: number) {
  if (frame.patternType === "checkered") drawCheckered(ctx, w, h, bw, frame.cornerColors.tl, frame.cornerColors.tr);
  if (frame.hasGlitter) drawGlitter(ctx, w, h, bw);
  if (frame.hasSparkles) drawSparkles(ctx, w, h, bw);
  if (frame.hasSprockets) drawSprocketHoles(ctx, w, h, bw);
  if (frame.patternType && frame.patternType !== "none" && frame.patternType !== "checkered") drawPattern(ctx, frame.patternType, w, h, bw);
  drawDecorations(ctx, frame, w, h, bw);
}

// ===========================
// Public API
// ===========================

async function loadStickerImages(stickers: PlacedSticker[]): Promise<Map<string, HTMLImageElement>> {
  const unique = [...new Set(stickers.map((s) => s.url))];
  const pairs = await Promise.all(
    unique.map((url) =>
      new Promise<[string, HTMLImageElement]>((res) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => res([url, img]);
        img.onerror = () => res([url, img]); // skip broken
        img.src = url;
      })
    )
  );
  return new Map(pairs);
}

export interface RenderOpts {
  frame: FrameDef;
  title?: string;
  subtitle?: string;
  filterCss?: string;
  brightness?: number;
  contrast?: number;
  stickers?: PlacedSticker[];
  customText?: string;
  customTextColor?: string;
  watermarkText?: string | null;
}

export async function renderSingle(canvas: HTMLCanvasElement, photo: HTMLImageElement, o: RenderOpts) {
  const ctx = canvas.getContext("2d")!;
  const { frame } = o;
  const bw = frame.borderWidth;
  const labelH = 80;
  const pw = photo.width, ph = photo.height;

  canvas.width = pw + bw * 2;
  canvas.height = ph + bw * 2 + labelH;

  drawGradientBorder(ctx, frame, canvas.width, canvas.height);
  drawEffects(ctx, frame, canvas.width, canvas.height, bw);

  const filter = buildFilter(o);
  ctx.save();
  roundRect(ctx, bw, bw, pw, ph, frame.innerRadius);
  ctx.clip();
  applyFilter(ctx, filter, photo, bw, bw, pw, ph);
  ctx.restore();

  if (frame.hasInnerShadow) drawInnerShadow(ctx, bw, bw, pw, ph, frame.innerRadius);

  if (o.stickers?.length) {
    const imgs = await loadStickerImages(o.stickers);
    drawStickers(ctx, o.stickers, bw, bw, pw, ph, imgs);
  }
  if (o.customText) drawCustomText(ctx, o.customText, o.customTextColor || "#fff", canvas.width, bw + ph - 20);

  drawLabel(ctx, frame, canvas.width, ph + bw * 2, labelH, o.title || "KikoBooth", o.subtitle || "");

  if (o.watermarkText) drawWatermark(ctx, o.watermarkText, canvas.width, canvas.height);
}

export async function renderStrip(canvas: HTMLCanvasElement, photos: HTMLImageElement[], o: RenderOpts) {
  const ctx = canvas.getContext("2d")!;
  const { frame } = o;
  const bw = frame.borderWidth;
  const gap = frame.gap;
  const labelH = 80;

  const spw = 480;
  const scale = spw / photos[0].width;
  const sph = Math.round(photos[0].height * scale);

  canvas.width = spw + bw * 2;
  canvas.height = bw * 2 + sph * photos.length + gap * (photos.length - 1) + labelH;

  drawGradientBorder(ctx, frame, canvas.width, canvas.height);
  drawEffects(ctx, frame, canvas.width, canvas.height, bw);

  const filter = buildFilter(o);
  photos.forEach((photo, i) => {
    const y = bw + i * (sph + gap);
    ctx.save();
    roundRect(ctx, bw, y, spw, sph, frame.innerRadius);
    ctx.clip();
    applyFilter(ctx, filter, photo, bw, y, spw, sph);
    ctx.restore();
    if (frame.hasInnerShadow) drawInnerShadow(ctx, bw, y, spw, sph, frame.innerRadius);
  });

  const labelY = canvas.height - labelH;
  drawLabel(ctx, frame, canvas.width, labelY, labelH, o.title || "KikoBooth", o.subtitle || "");

  if (o.stickers?.length) {
    const imgs = await loadStickerImages(o.stickers);
    drawStickers(ctx, o.stickers, bw, bw, spw, canvas.height - labelH - bw * 2, imgs);
  }
  if (o.customText) drawCustomText(ctx, o.customText, o.customTextColor || "#fff", canvas.width, labelY - 10);
  if (o.watermarkText) drawWatermark(ctx, o.watermarkText, canvas.width, canvas.height);
}

export async function renderGrid(canvas: HTMLCanvasElement, photos: HTMLImageElement[], o: RenderOpts) {
  const ctx = canvas.getContext("2d")!;
  const { frame } = o;
  const bw = frame.borderWidth;
  const gap = frame.gap;
  const labelH = 80;
  const cw = 400, ch = 300;

  canvas.width = bw * 2 + cw * 2 + gap;
  canvas.height = bw * 2 + ch * 2 + gap + labelH;

  drawGradientBorder(ctx, frame, canvas.width, canvas.height);
  drawEffects(ctx, frame, canvas.width, canvas.height, bw);

  const filter = buildFilter(o);
  const pos = [[bw, bw], [bw + cw + gap, bw], [bw, bw + ch + gap], [bw + cw + gap, bw + ch + gap]];
  photos.slice(0, 4).forEach((photo, i) => {
    const [x, y] = pos[i];
    ctx.save();
    roundRect(ctx, x, y, cw, ch, frame.innerRadius);
    ctx.clip();
    applyFilter(ctx, filter, photo, x, y, cw, ch);
    ctx.restore();
    if (frame.hasInnerShadow) drawInnerShadow(ctx, x, y, cw, ch, frame.innerRadius);
  });

  drawLabel(ctx, frame, canvas.width, canvas.height - labelH, labelH, o.title || "KikoBooth", o.subtitle || "");
  if (o.stickers?.length) {
    const imgs = await loadStickerImages(o.stickers);
    drawStickers(ctx, o.stickers, bw, bw, canvas.width - bw * 2, canvas.height - labelH - bw * 2, imgs);
  }
  if (o.customText) drawCustomText(ctx, o.customText, o.customTextColor || "#fff", canvas.width, canvas.height - labelH - 10);
  if (o.watermarkText) drawWatermark(ctx, o.watermarkText, canvas.width, canvas.height);
}

function drawWatermark(ctx: CanvasRenderingContext2D, text: string, w: number, h: number) {
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 6);
  for (let y = -h; y < h; y += 180) {
    for (let x = -w; x < w; x += 180) {
      ctx.fillText(text, x, y);
    }
  }
  ctx.restore();
}

// ===========================
// Utilities
// ===========================

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const a = document.createElement("a");
  a.download = filename;
  a.href = canvas.toDataURL("image/png");
  a.click();
}

export function generateFilename(name: string): string {
  const ts = new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-");
  return `${name.replace(/\s+/g, "-").toLowerCase()}_${ts}.png`;
}