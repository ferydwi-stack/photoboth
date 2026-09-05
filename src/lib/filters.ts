// Filter presets for photos
export interface PhotoFilter {
  id: string;
  name: string;
  css: string;
  preview: string; // short CSS for thumbnail preview
}

export const PHOTO_FILTERS: PhotoFilter[] = [
  {
    id: "none",
    name: "Normal",
    css: "none",
    preview: "none",
  },
  {
    id: "grayscale",
    name: "B&W",
    css: "grayscale(100%)",
    preview: "grayscale(100%)",
  },
  {
    id: "sepia",
    name: "Sepia",
    css: "sepia(80%) saturate(120%)",
    preview: "sepia(80%)",
  },
  {
    id: "warm",
    name: "Warm",
    css: "saturate(130%) hue-rotate(-10deg) brightness(105%)",
    preview: "saturate(130%) hue-rotate(-10deg)",
  },
  {
    id: "cool",
    name: "Cool",
    css: "saturate(90%) hue-rotate(20deg) brightness(105%)",
    preview: "saturate(90%) hue-rotate(20deg)",
  },
  {
    id: "vintage",
    name: "Vintage",
    css: "sepia(40%) contrast(90%) brightness(110%) saturate(80%)",
    preview: "sepia(40%) contrast(90%)",
  },
  {
    id: "dramatic",
    name: "Dramatic",
    css: "contrast(140%) brightness(90%) saturate(120%)",
    preview: "contrast(140%) brightness(90%)",
  },
  {
    id: "fade",
    name: "Fade",
    css: "contrast(80%) brightness(115%) saturate(70%)",
    preview: "contrast(80%) brightness(115%)",
  },
  {
    id: "vivid",
    name: "Vivid",
    css: "saturate(180%) contrast(110%)",
    preview: "saturate(180%) contrast(110%)",
  },
  {
    id: "noir",
    name: "Noir",
    css: "grayscale(100%) contrast(150%) brightness(85%)",
    preview: "grayscale(100%) contrast(150%)",
  },
  {
    id: "pastel",
    name: "Pastel",
    css: "saturate(60%) brightness(115%) contrast(85%)",
    preview: "saturate(60%) brightness(115%)",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    css: "saturate(200%) hue-rotate(280deg) contrast(120%) brightness(95%)",
    preview: "saturate(200%) hue-rotate(280deg)",
  },
];

// Apply CSS filter to a canvas image
export function applyFilterToCanvas(
  sourceCanvas: HTMLCanvasElement,
  filterId: string
): HTMLCanvasElement {
  const filter = PHOTO_FILTERS.find((f) => f.id === filterId);
  if (!filter || filter.id === "none") return sourceCanvas;

  const canvas = document.createElement("canvas");
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return sourceCanvas;

  ctx.filter = filter.css;
  ctx.drawImage(sourceCanvas, 0, 0);
  ctx.filter = "none";

  return canvas;
}
