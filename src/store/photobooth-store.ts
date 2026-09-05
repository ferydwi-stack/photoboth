import { create } from "zustand";
import { PlacedSticker } from "@/lib/stickers";
import { FrameDef, FRAMES } from "@/lib/frames";

export type AppStep = "landing" | "camera" | "frame-select" | "editor" | "preview";
export type LayoutMode = "single" | "strip-3" | "strip-4" | "grid-4";

interface PhotoboothState {
  step: AppStep;

  selectedFrame: FrameDef;
  layoutMode: LayoutMode;
  capturedPhotos: string[];
  isFlashing: boolean;
  isMirrored: boolean;

  selectedFilter: string;
  placedStickers: PlacedSticker[];
  brightness: number;
  contrast: number;
  customText: string;
  customTextColor: string;

  finalPhoto: string | null;
  watermarkEnabled: boolean;
  watermarkText: string;

  setStep: (s: AppStep) => void;
  setSelectedFrame: (f: FrameDef) => void;
  setLayoutMode: (m: LayoutMode) => void;
  addCapturedPhoto: (p: string) => void;
  clearCapturedPhotos: () => void;
  setIsFlashing: (f: boolean) => void;
  setIsMirrored: (m: boolean) => void;
  setSelectedFilter: (f: string) => void;
  addSticker: (s: PlacedSticker) => void;
  updateSticker: (id: string, u: Partial<PlacedSticker>) => void;
  removeSticker: (id: string) => void;
  clearStickers: () => void;
  setBrightness: (v: number) => void;
  setContrast: (v: number) => void;
  setCustomText: (t: string) => void;
  setCustomTextColor: (c: string) => void;
  setFinalPhoto: (p: string | null) => void;
  setWatermarkEnabled: (e: boolean) => void;
  setWatermarkText: (t: string) => void;
  reset: () => void;
  getRequiredPhotoCount: () => number;
}

const INITIAL = {
  step: "landing" as AppStep,
  selectedFrame: FRAMES[0],
  layoutMode: "single" as LayoutMode,
  capturedPhotos: [] as string[],
  isFlashing: false,
  isMirrored: true,
  selectedFilter: "none",
  placedStickers: [] as PlacedSticker[],
  brightness: 100,
  contrast: 100,
  customText: "",
  customTextColor: "#ffffff",
  finalPhoto: null as string | null,
  watermarkEnabled: false,
  watermarkText: "KikoBooth",
};

export const usePhotoboothStore = create<PhotoboothState>((set, get) => ({
  ...INITIAL,
  setStep: (step) => set({ step }),
  setSelectedFrame: (selectedFrame) => set({ selectedFrame }),
  setLayoutMode: (layoutMode) => set({ layoutMode }),
  addCapturedPhoto: (p) => set((s) => ({ capturedPhotos: [...s.capturedPhotos, p] })),
  clearCapturedPhotos: () => set({ capturedPhotos: [] }),
  setIsFlashing: (isFlashing) => set({ isFlashing }),
  setIsMirrored: (isMirrored) => set({ isMirrored }),
  setSelectedFilter: (selectedFilter) => set({ selectedFilter }),
  addSticker: (s) => set((st) => ({ placedStickers: [...st.placedStickers, s] })),
  updateSticker: (id, u) => set((s) => ({ placedStickers: s.placedStickers.map((st) => st.id === id ? { ...st, ...u } : st) })),
  removeSticker: (id) => set((s) => ({ placedStickers: s.placedStickers.filter((st) => st.id !== id) })),
  clearStickers: () => set({ placedStickers: [] }),
  setBrightness: (brightness) => set({ brightness }),
  setContrast: (contrast) => set({ contrast }),
  setCustomText: (customText) => set({ customText }),
  setCustomTextColor: (customTextColor) => set({ customTextColor }),
  setFinalPhoto: (finalPhoto) => set({ finalPhoto }),
  setWatermarkEnabled: (watermarkEnabled) => set({ watermarkEnabled }),
  setWatermarkText: (watermarkText) => set({ watermarkText }),
  reset: () => set({ ...INITIAL }),
  getRequiredPhotoCount: () => {
    const m = get().layoutMode;
    return m === "single" ? 1 : m === "strip-3" ? 3 : 4;
  },
}));
