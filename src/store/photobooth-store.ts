import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PlacedSticker } from "@/lib/stickers";
import { FrameDef, FRAMES } from "@/lib/frames";

export type AppPage = "home" | "booth" | "gallery" | "frames" | "guide";
export type BoothStep = "camera" | "studio" | "preview";
export type ShotCountMode = 6 | 10;

export interface SavedPhotoStrip {
  id: string;
  url: string;
  date: string;
  frameName: string;
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

  // Photo Storage & Slot Placement
  capturedPhotos: string[]; // All 6 or 10 photos captured
  frameSlots: (string | null)[]; // 4 slots for the fixed-size strip
  selectedSlotIndex: number | null; // Currently targeted slot for replacement

  addCapturedPhoto: (p: string) => void;
  clearCapturedPhotos: () => void;
  assignPhotoToSlot: (slotIndex: number, photoUrl: string | null) => void;
  removePhotoFromSlot: (slotIndex: number) => void;
  swapSlots: (fromIndex: number, toIndex: number) => void;
  setSelectedSlotIndex: (index: number | null) => void;
  initializeSlotsWithCaptured: () => void;

  // Camera Settings
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

      // Photos & 4 Fixed Slots
      capturedPhotos: [],
      frameSlots: [null, null, null, null],
      selectedSlotIndex: null,

      addCapturedPhoto: (p) => {
        set((s) => {
          const nextCaptured = [...s.capturedPhotos, p];
          // Auto fill empty slots as photos are taken
          const nextSlots = [...s.frameSlots];
          const firstEmpty = nextSlots.findIndex((slot) => slot === null);
          if (firstEmpty !== -1 && firstEmpty < 4) {
            nextSlots[firstEmpty] = p;
          }
          return {
            capturedPhotos: nextCaptured,
            frameSlots: nextSlots,
          };
        });
      },

      clearCapturedPhotos: () =>
        set({
          capturedPhotos: [],
          frameSlots: [null, null, null, null],
          selectedSlotIndex: null,
        }),

      assignPhotoToSlot: (slotIndex, photoUrl) => {
        set((s) => {
          if (slotIndex < 0 || slotIndex >= 4) return s;
          const next = [...s.frameSlots];
          next[slotIndex] = photoUrl;
          return { frameSlots: next };
        });
      },

      removePhotoFromSlot: (slotIndex) => {
        set((s) => {
          if (slotIndex < 0 || slotIndex >= 4) return s;
          const next = [...s.frameSlots];
          next[slotIndex] = null;
          return { frameSlots: next };
        });
      },

      swapSlots: (fromIndex, toIndex) => {
        set((s) => {
          if (fromIndex < 0 || fromIndex >= 4 || toIndex < 0 || toIndex >= 4) return s;
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
        set({
          frameSlots: [
            photos[0] ?? null,
            photos[1] ?? null,
            photos[2] ?? null,
            photos[3] ?? null,
          ],
        });
      },

      // Camera Settings
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
        set({
          activePage: "booth",
          boothStep: "camera",
          shotCountMode: shotCount,
          capturedPhotos: [],
          frameSlots: [null, null, null, null],
          selectedSlotIndex: null,
          placedStickers: [],
          finalPhoto: null,
        });
      },

      resetBooth: () => {
        set({
          boothStep: "camera",
          capturedPhotos: [],
          frameSlots: [null, null, null, null],
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
      }),
    }
  )
);
