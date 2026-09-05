import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PlacedSticker } from "@/lib/stickers";
import { FrameDef, FRAMES } from "@/lib/frames";

export type AppPage = "home" | "booth" | "gallery" | "frames" | "guide";
export type BoothStep = "camera" | "studio" | "preview";
export type ShotCountMode = 6 | 10;
export type LayoutType = "strip-4" | "grid-4" | "strip-3" | "grid-6" | "duo-2" | "single-1";

export interface LayoutOption {
  id: LayoutType;
  name: string;
  slots: number;
  icon: string;
  description: string;
  badge: string;
}

export const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: "strip-4",
    name: "1x4 Strip Klasik",
    slots: 4,
    icon: "🎞️",
    description: "Format strip vertikal 4 foto khas Life4Cuts Korea",
    badge: "Populer",
  },
  {
    id: "grid-4",
    name: "2x2 Grid Kotak",
    slots: 4,
    icon: "⏹️",
    description: "Grid kotak 4 foto ala Photoism & Haru Film",
    badge: "Trending",
  },
  {
    id: "strip-3",
    name: "1x3 Strip Retro",
    slots: 3,
    icon: "📸",
    description: "Format strip 3 foto vintage bergaya 90-an",
    badge: "Retro",
  },
  {
    id: "grid-6",
    name: "2x3 Grid Poster",
    slots: 6,
    icon: "🖼️",
    description: "Poster 6 foto (muat semua 6 pose sekaligus!)",
    badge: "Lengkap",
  },
  {
    id: "duo-2",
    name: "1x2 Duo Strip",
    slots: 2,
    icon: "👥",
    description: "Dua foto landscape besar untuk couple/sahabat",
    badge: "Couple",
  },
  {
    id: "single-1",
    name: "1x1 Polaroid Solo",
    slots: 1,
    icon: "🤍",
    description: "Satu foto hero berbingkai Polaroid klasik",
    badge: "Solo",
  },
];

export function getSlotCount(layout: LayoutType): number {
  switch (layout) {
    case "single-1":
      return 1;
    case "duo-2":
      return 2;
    case "strip-3":
      return 3;
    case "strip-4":
    case "grid-4":
      return 4;
    case "grid-6":
      return 6;
    default:
      return 4;
  }
}

export interface SavedPhotoStrip {
  id: string;
  url: string;
  date: string;
  frameName: string;
  layoutName: string;
  shotCount: number;
}

interface PhotoboothState {
  // Navigation
  activePage: AppPage;
  setActivePage: (page: AppPage) => void;

  // Booth Workflow
  boothStep: BoothStep;
  setBoothStep: (step: BoothStep) => void;

  // Shot Count Configuration (6x or 10x)
  shotCountMode: ShotCountMode;
  setShotCountMode: (mode: ShotCountMode) => void;

  // Layout Structure (Kali Berapa)
  layoutType: LayoutType;
  setLayoutType: (type: LayoutType) => void;

  // Photo Storage & Slot Placement
  capturedPhotos: string[]; // All 6 or 10 photos captured
  frameSlots: (string | null)[]; // Slots for current layout
  selectedSlotIndex: number | null; // Currently targeted slot for replacement

  addCapturedPhoto: (p: string) => void;
  clearCapturedPhotos: () => void;
  assignPhotoToSlot: (slotIndex: number, photoUrl: string | null) => void;
  removePhotoFromSlot: (slotIndex: number) => void;
  swapSlots: (fromIndex: number, toIndex: number) => void;
  setSelectedSlotIndex: (index: number | null) => void;
  initializeSlotsWithCaptured: () => void;

  // Camera Settings
  selectedCameraDeviceId: string | null;
  setSelectedCameraDeviceId: (id: string | null) => void;
  isFlashing: boolean;
  isMirrored: boolean;
  autoCaptureTimer: number; // 3, 5, or 10 seconds
  autoSequenceEnabled: boolean; // Continuous burst mode
  soundEnabled: boolean;

  setIsFlashing: (f: boolean) => void;
  setIsMirrored: (m: boolean) => void;
  setAutoCaptureTimer: (t: number) => void;
  setAutoSequenceEnabled: (e: boolean) => void;
  setSoundEnabled: (s: boolean) => void;

  // Frame & Customization
  selectedFrame: FrameDef;
  setSelectedFrame: (f: FrameDef) => void;
  selectedFilter: string;
  setSelectedFilter: (f: string) => void;
  brightness: number;
  setBrightness: (v: number) => void;
  contrast: number;
  setContrast: (v: number) => void;

  // Frame Branding & Text
  customTitle: string;
  setCustomTitle: (t: string) => void;
  customSubtitle: string;
  setCustomSubtitle: (s: string) => void;
  showDateStamp: boolean;
  setShowDateStamp: (s: boolean) => void;
  customTextColor: string;
  setCustomTextColor: (c: string) => void;

  // Stickers & Emojis
  placedStickers: PlacedSticker[];
  addSticker: (s: PlacedSticker) => void;
  updateSticker: (id: string, u: Partial<PlacedSticker>) => void;
  removeSticker: (id: string) => void;
  clearStickers: () => void;

  // Final Output
  finalPhoto: string | null;
  setFinalPhoto: (p: string | null) => void;

  // Local Gallery Persistence
  savedGalleries: SavedPhotoStrip[];
  saveToGallery: (url: string, frameName: string) => void;
  removeFromGallery: (id: string) => void;

  // Reset / Flow control
  startBoothSession: (shotCount?: ShotCountMode) => void;
  resetBooth: () => void;
}

const DEFAULT_FRAME = FRAMES[0];

export const usePhotoboothStore = create<PhotoboothState>()(
  persist(
    (set, get) => ({
      // Navigation
      activePage: "home",
      setActivePage: (activePage) => set({ activePage }),

      // Booth Workflow
      boothStep: "camera",
      setBoothStep: (boothStep) => set({ boothStep }),

      // Shot Count
      shotCountMode: 6,
      setShotCountMode: (shotCountMode) => set({ shotCountMode }),

      // Layout Format (Kali berapa)
      layoutType: "strip-4",
      setLayoutType: (layoutType) => {
        const requiredSlots = getSlotCount(layoutType);
        const currentSlots = get().frameSlots;
        const captured = get().capturedPhotos;

        // Build new slots array preserving existing or auto-filling from captured
        const newSlots: (string | null)[] = [];
        for (let i = 0; i < requiredSlots; i++) {
          newSlots.push(currentSlots[i] ?? captured[i] ?? null);
        }

        set({
          layoutType,
          frameSlots: newSlots,
          selectedSlotIndex: null,
        });
      },

      // Photos & Dynamic Fixed Slots
      capturedPhotos: [],
      frameSlots: [null, null, null, null],
      selectedSlotIndex: null,

      addCapturedPhoto: (p) => {
        set((s) => {
          const nextCaptured = [...s.capturedPhotos, p];
          const requiredSlots = getSlotCount(s.layoutType);
          const nextSlots = [...s.frameSlots];

          // Auto-fill empty slot as photos are taken
          const firstEmpty = nextSlots.findIndex((slot) => slot === null);
          if (firstEmpty !== -1 && firstEmpty < requiredSlots) {
            nextSlots[firstEmpty] = p;
          }

          return {
            capturedPhotos: nextCaptured,
            frameSlots: nextSlots,
          };
        });
      },

      clearCapturedPhotos: () => {
        const slotsCount = getSlotCount(get().layoutType);
        set({
          capturedPhotos: [],
          frameSlots: Array(slotsCount).fill(null),
          selectedSlotIndex: null,
        });
      },

      assignPhotoToSlot: (slotIndex, photoUrl) => {
        set((s) => {
          const count = getSlotCount(s.layoutType);
          if (slotIndex < 0 || slotIndex >= count) return s;
          const next = [...s.frameSlots];
          next[slotIndex] = photoUrl;
          return { frameSlots: next };
        });
      },

      removePhotoFromSlot: (slotIndex) => {
        set((s) => {
          const count = getSlotCount(s.layoutType);
          if (slotIndex < 0 || slotIndex >= count) return s;
          const next = [...s.frameSlots];
          next[slotIndex] = null;
          return { frameSlots: next };
        });
      },

      swapSlots: (fromIndex, toIndex) => {
        set((s) => {
          const count = getSlotCount(s.layoutType);
          if (fromIndex < 0 || fromIndex >= count || toIndex < 0 || toIndex >= count) return s;
          const next = [...s.frameSlots];
          const temp = next[fromIndex];
          next[fromIndex] = next[toIndex];
          next[toIndex] = temp;
          return { frameSlots: next };
        });
      },

      setSelectedSlotIndex: (index) => set({ selectedSlotIndex: index }),

      initializeSlotsWithCaptured: () => {
        const photos = get().capturedPhotos;
        const count = getSlotCount(get().layoutType);
        const slots: (string | null)[] = [];
        for (let i = 0; i < count; i++) {
          slots.push(photos[i] ?? null);
        }
        set({ frameSlots: slots });
      },

      // Camera Settings
      selectedCameraDeviceId: null,
      setSelectedCameraDeviceId: (id) => set({ selectedCameraDeviceId: id }),
      isFlashing: false,
      isMirrored: true,
      autoCaptureTimer: 3,
      autoSequenceEnabled: true,
      soundEnabled: true,

      setIsFlashing: (isFlashing) => set({ isFlashing }),
      setIsMirrored: (isMirrored) => set({ isMirrored }),
      setAutoCaptureTimer: (autoCaptureTimer) => set({ autoCaptureTimer }),
      setAutoSequenceEnabled: (autoSequenceEnabled) => set({ autoSequenceEnabled }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),

      // Frame & Filters
      selectedFrame: DEFAULT_FRAME,
      setSelectedFrame: (selectedFrame) => set({ selectedFrame }),
      selectedFilter: "none",
      setSelectedFilter: (selectedFilter) => set({ selectedFilter }),
      brightness: 100,
      setBrightness: (brightness) => set({ brightness }),
      contrast: 100,
      setContrast: (contrast) => set({ contrast }),

      // Branding Text
      customTitle: "KikoBooth",
      setCustomTitle: (customTitle) => set({ customTitle }),
      customSubtitle: "Seoul Photo Studio",
      setCustomSubtitle: (customSubtitle) => set({ customSubtitle }),
      showDateStamp: true,
      setShowDateStamp: (showDateStamp) => set({ showDateStamp }),
      customTextColor: "#333333",
      setCustomTextColor: (customTextColor) => set({ customTextColor }),

      // Stickers
      placedStickers: [],
      addSticker: (s) => set((st) => ({ placedStickers: [...st.placedStickers, s] })),
      updateSticker: (id, u) =>
        set((s) => ({
          placedStickers: s.placedStickers.map((st) => (st.id === id ? { ...st, ...u } : st)),
        })),
      removeSticker: (id) =>
        set((s) => ({
          placedStickers: s.placedStickers.filter((st) => st.id !== id),
        })),
      clearStickers: () => set({ placedStickers: [] }),

      // Final Output
      finalPhoto: null,
      setFinalPhoto: (finalPhoto) => set({ finalPhoto }),

      // Saved Gallery
      savedGalleries: [],
      saveToGallery: (url, frameName) => {
        const layout = get().layoutType;
        const layoutOpt = LAYOUT_OPTIONS.find((l) => l.id === layout);
        const item: SavedPhotoStrip = {
          id: `strip_${Date.now()}`,
          url,
          date: new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          frameName,
          layoutName: layoutOpt?.name || "1x4 Strip",
          shotCount: get().shotCountMode,
        };
        set((s) => ({
          savedGalleries: [item, ...s.savedGalleries],
        }));
      },
      removeFromGallery: (id) =>
        set((s) => ({
          savedGalleries: s.savedGalleries.filter((item) => item.id !== id),
        })),

      // Start Session helper
      startBoothSession: (shotCount = 6) => {
        const slotsCount = getSlotCount(get().layoutType);
        set({
          activePage: "booth",
          boothStep: "camera",
          shotCountMode: shotCount,
          capturedPhotos: [],
          frameSlots: Array(slotsCount).fill(null),
          selectedSlotIndex: null,
          placedStickers: [],
          finalPhoto: null,
        });
      },

      resetBooth: () => {
        const slotsCount = getSlotCount(get().layoutType);
        set({
          boothStep: "camera",
          capturedPhotos: [],
          frameSlots: Array(slotsCount).fill(null),
          selectedSlotIndex: null,
          placedStickers: [],
          finalPhoto: null,
        });
      },
    }),
    {
      name: "kikobooth-storage-v2",
      partialize: (state) => ({
        savedGalleries: state.savedGalleries,
        soundEnabled: state.soundEnabled,
        isMirrored: state.isMirrored,
        autoCaptureTimer: state.autoCaptureTimer,
        autoSequenceEnabled: state.autoSequenceEnabled,
        layoutType: state.layoutType,
        selectedCameraDeviceId: state.selectedCameraDeviceId,
      }),
    }
  )
);
