"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePhotoboothStore, LAYOUT_OPTIONS } from "@/store/photobooth-store";
import { FRAMES, FRAME_CATEGORIES } from "@/lib/frames";
import { STICKERS, STICKER_CATEGORIES, Sticker, PlacedSticker } from "@/lib/stickers";
import { PHOTO_FILTERS } from "@/lib/filters";
import {
  renderFixed4CutStrip,
  loadImage,
  computeLayoutGeometry,
  RenderStripOpts,
} from "@/lib/render-engine";
import { playClick, playSuccess } from "@/lib/sounds";
import { useConfirmDialog } from "@/components/ConfirmDialog";
import { v4 as uuidv4 } from "uuid";
import {
  ChevronLeft,
  ChevronRight,
  Palette,
  Images,
  Smile,
  SlidersHorizontal,
  Type,
  Trash2,
  ArrowUpDown,
  FlipHorizontal,
  X,
  RotateCw,
  ZoomIn,
  Plus,
  LayoutGrid,
  Music,
} from "lucide-react";

type StudioTab = "layout" | "photos" | "frames" | "stickers" | "filters" | "text";

const SONG_PRESETS = [
  {
    frameId: "frame-the1975",
    title: "THE 1975",
    subtitle: "About You // 'Do you think I have forgotten?'",
    icon: "🖤",
    band: "The 1975",
    styleHint: "Hitam Minimalis + Logo Neon 1975",
  },
  {
    frameId: "frame-multo",
    title: "MULTO",
    subtitle: "Cup of Joe // 'Kahit sa panaginip lang...'",
    icon: "🥀",
    band: "Cup of Joe",
    styleHint: "Dark Crimson + Mawar Gothic",
  },
  {
    frameId: "frame-wavetoearth",
    title: "WAVE TO EARTH",
    subtitle: "seasons // 'I'll be your seasons'",
    icon: "🌊",
    band: "wave to earth",
    styleHint: "Ocean Teal + Alur Ombak & Vinyl",
  },
  {
    frameId: "frame-newjeans",
    title: "NEWJEANS",
    subtitle: "Ditto // 'Stay in the middle'",
    icon: "🐰",
    band: "NewJeans",
    styleHint: "Y2K Biru-Lilac + Bunny REC HUD",
  },
  {
    frameId: "frame-arcticmonkeys",
    title: "ARCTIC MONKEYS",
    subtitle: "505 // 'I'm going back to 505'",
    icon: "🎸",
    band: "Arctic Monkeys",
    styleHint: "Obsidian Black + Gelombang AM",
  },
  {
    frameId: "frame-taylorswift",
    title: "TAYLOR SWIFT",
    subtitle: "Lover // 'Can I go where you go?'",
    icon: "💖",
    band: "Taylor Swift",
    styleHint: "Pink Sunset + Logo Lover & Love",
  },
  {
    frameId: "frame-sza",
    title: "SZA",
    subtitle: "Snooze // 'I can't lose with you'",
    icon: "🌙",
    band: "SZA",
    styleHint: "Deep Ocean Navy + Logo S.O.S",
  },
  {
    frameId: "frame-frankocean",
    title: "FRANK OCEAN",
    subtitle: "Pink + White // 'Everyday goes'",
    icon: "🍊",
    band: "Frank Ocean",
    styleHint: "Bauhaus Stripes + Blonded Orange",
  },
];

export default function StudioScreen() {
  const {
    capturedPhotos,
    frameSlots,
    assignPhotoToSlot,
    removePhotoFromSlot,
    swapSlots,
    flipSlotPhoto,
    flipAllSlotPhotos,
    flipCapturedPhoto,
    selectedSlotIndex,
    setSelectedSlotIndex,
    selectedFrame,
    setSelectedFrame,
    layoutType,
    setLayoutType,
    placedStickers,
    addSticker,
    updateSticker,
    removeSticker,
    clearStickers,
    selectedFilter,
    setSelectedFilter,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    customTitle,
    setCustomTitle,
    customSubtitle,
    setCustomSubtitle,
    showDateStamp,
    setShowDateStamp,
    setBoothStep,
    resetBooth,
  } = usePhotoboothStore();

  const { confirm, dialog } = useConfirmDialog();
  const [activeTab, setActiveTab] = useState<StudioTab>("layout");
  const [frameCategory, setFrameCategory] = useState<string>("all");
  const [stickerCategory, setStickerCategory] = useState<string>("emoji");
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [draggingStickerId, setDraggingStickerId] = useState<string | null>(null);

  // Drag-and-drop state for photos from tray to frame slots
  const [draggedPhotoUrl, setDraggedPhotoUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stripPreviewRef = useRef<HTMLDivElement>(null);

  // Filter frames by category
  const filteredFrames =
    frameCategory === "all" ? FRAMES : FRAMES.filter((f) => f.category === frameCategory);

  // Filter stickers by category
  const filteredStickers = STICKERS.filter((s) => s.category === stickerCategory);

  // Compute layout geometry for interactive overlay
  const geom = computeLayoutGeometry(layoutType, selectedFrame);

  // Render the canvas whenever slots, frames, or stickers change
  const updateCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const slotImages = await Promise.all(
        frameSlots.map(async (url) => {
          if (!url) return null;
          try {
            return await loadImage(url);
          } catch {
            return null;
          }
        })
      );

      const filterCss = PHOTO_FILTERS.find((f) => f.id === selectedFilter)?.css;

      const opts: RenderStripOpts = {
        frame: selectedFrame,
        layout: layoutType,
        title: customTitle,
        subtitle: customSubtitle,
        showDate: showDateStamp,
        filterCss,
        brightness,
        contrast,
        stickers: placedStickers,
        scaleFactor: 1, // Preview scale
      };

      await renderFixed4CutStrip(canvas, slotImages, opts);
    } catch (err) {
      console.error("Canvas render error", err);
    }
  }, [
    frameSlots,
    selectedFrame,
    layoutType,
    customTitle,
    customSubtitle,
    showDateStamp,
    selectedFilter,
    brightness,
    contrast,
    placedStickers,
  ]);

  useEffect(() => {
    updateCanvas();
  }, [updateCanvas]);

  // Handle Photo Assignment from Tray
  const handleSelectPhotoFromTray = (photoUrl: string) => {
    playClick();
    if (selectedSlotIndex !== null) {
      assignPhotoToSlot(selectedSlotIndex, photoUrl);
      setSelectedSlotIndex(null);
    } else {
      const emptyIndex = frameSlots.findIndex((s) => s === null);
      if (emptyIndex !== -1) {
        assignPhotoToSlot(emptyIndex, photoUrl);
      } else {
        assignPhotoToSlot(0, photoUrl);
      }
    }
  };

  // Add Sticker to Strip
  const handleAddSticker = (st: Sticker) => {
    playClick();
    const newSticker: PlacedSticker = {
      id: uuidv4(),
      stickerId: st.id,
      url: st.url,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
    };
    addSticker(newSticker);
    setSelectedStickerId(newSticker.id);
  };

  // Mouse/Touch coordinates calculation for dragging sticker on canvas overlay
  const getCoordinates = (e: MouseEvent | TouchEvent) => {
    if ("touches" in e) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  };

  const onPointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!draggingStickerId || !stripPreviewRef.current) return;
      e.preventDefault();
      const rect = stripPreviewRef.current.getBoundingClientRect();
      const coords = getCoordinates(e);

      const pctX = Math.max(5, Math.min(95, ((coords.clientX - rect.left) / rect.width) * 100));
      const pctY = Math.max(5, Math.min(95, ((coords.clientY - rect.top) / rect.height) * 100));

      updateSticker(draggingStickerId, { x: pctX, y: pctY });
    },
    [draggingStickerId, updateSticker]
  );

  const onPointerUp = useCallback(() => {
    setDraggingStickerId(null);
  }, []);

  useEffect(() => {
    if (draggingStickerId) {
      window.addEventListener("mousemove", onPointerMove as EventListener, { passive: false });
      window.addEventListener("mouseup", onPointerUp);
      window.addEventListener("touchmove", onPointerMove as EventListener, { passive: false });
      window.addEventListener("touchend", onPointerUp);

      return () => {
        window.removeEventListener("mousemove", onPointerMove as EventListener);
        window.removeEventListener("mouseup", onPointerUp);
        window.removeEventListener("touchmove", onPointerMove as EventListener);
        window.removeEventListener("touchend", onPointerUp);
      };
    }
  }, [draggingStickerId, onPointerMove, onPointerUp]);

  // Back to camera confirmation
  const handleBackToCamera = async () => {
    playClick();
    const ok = await confirm(
      "Foto Ulang?",
      "Apakah Anda yakin ingin mengulang sesi foto dari awal?"
    );
    if (!ok) return;
    resetBooth();
  };

  // Proceed to Preview Screen
  const handleProceedToPreview = () => {
    playSuccess();
    setBoothStep("preview");
  };

  // Currently active sticker for scale/rotation adjustments
  const activeSticker = placedStickers.find((s) => s.id === selectedStickerId);

  return (
    <div
      className="flex flex-col min-h-[100dvh] overflow-hidden select-none"
      style={{ background: "linear-gradient(180deg, #fbf7ff 0%, #f0e6ff 100%)" }}
    >
      {dialog}

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 border-b-2 border-[#2d1b4e]/10 bg-white/90 backdrop-blur-md z-30">
        <button
          onClick={handleBackToCamera}
          className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost text-xs py-1.5 px-2.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Foto Ulang</span>
        </button>

        <div className="card-cartoon-sm px-3 py-1 bg-white text-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#ff4d6d] block">
            Studio Kustomisasi
          </span>
          <h2 className="text-xs sm:text-sm font-black text-[#2d1b4e] leading-tight">
            Atur Bentuk Frame & Foto
          </h2>
        </div>

        <button
          onClick={handleProceedToPreview}
          className="btn-cartoon btn-cartoon-sm btn-cartoon-primary text-xs py-1.5 px-3"
        >
          <span>Selesai</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Studio Body: Left Strip Canvas & Right Customization Panel */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left / Center Section: Photobooth Strip Preview & Slot Interactor */}
        <div className="flex-1 flex flex-col items-center justify-center p-2.5 sm:p-6 overflow-y-auto min-h-0 relative">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 text-[11px] sm:text-xs font-black text-[#764ba2] bg-white/90 px-3 py-1 rounded-full border border-[#2d1b4e]/10 shadow-sm">
            <span>
              ✨ Layout: {LAYOUT_OPTIONS.find((l) => l.id === layoutType)?.name} ({geom.slots.length} Slot)
            </span>
          </div>

          {/* Interactive Canvas Container with Exact Aspect Ratio */}
          <div
            ref={stripPreviewRef}
            className="relative rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-white shadow-[0_16px_40px_rgba(118,75,162,0.22)] overflow-hidden transition-all max-h-[62vh] sm:max-h-[74vh] object-contain flex items-center justify-center"
            style={{
              aspectRatio: `${geom.baseWidth} / ${geom.baseHeight}`,
            }}
          >
            {/* The real rendered canvas */}
            <canvas ref={canvasRef} className="w-full h-full object-contain pointer-events-none" />

            {/* Interactive Slot Overlay matching computed layout geometry */}
            {geom.slots.map((slot, slotIdx) => {
              const photoUrl = frameSlots[slotIdx];
              const isTarget = selectedSlotIndex === slotIdx;

              const leftPct = (slot.x / geom.baseWidth) * 100;
              const topPct = (slot.y / geom.baseHeight) * 100;
              const widthPct = (slot.w / geom.baseWidth) * 100;
              const heightPct = (slot.h / geom.baseHeight) * 100;

              return (
                <div
                  key={slotIdx}
                  onClick={() => {
                    playClick();
                    setSelectedSlotIndex(isTarget ? null : slotIdx);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedPhotoUrl) {
                      playClick();
                      assignPhotoToSlot(slotIdx, draggedPhotoUrl);
                      setDraggedPhotoUrl(null);
                    }
                  }}
                  style={{
                    position: "absolute",
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    width: `${widthPct}%`,
                    height: `${heightPct}%`,
                    borderRadius:
                      selectedFrame.shapeStyle === "arch"
                        ? "42% 42% 14px 14px / 28% 28% 14px 14px"
                        : "12px",
                    transform:
                      layoutType === "polaroid-pile-3"
                        ? `rotate(${[-3.2, 2.5, -2.0][slotIdx % 3]}deg)`
                        : selectedFrame.shapeStyle === "collage-tilt"
                        ? `rotate(${[-2, 1.8, -1.4, 2, -1.8, 1.5][slotIdx % 6]}deg)`
                        : "none",
                  }}
                  className={`transition-all cursor-pointer flex items-center justify-center pointer-events-auto ${
                    isTarget
                      ? "ring-4 ring-[#ff4d6d] ring-offset-2 bg-[#ff4d6d]/15"
                      : "hover:ring-2 hover:ring-[#764ba2]/60"
                  }`}
                >
                  {/* Slot badge indicator */}
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-black z-20 flex items-center gap-1">
                    <span>Slot {slotIdx + 1}</span>
                    {isTarget && <span className="text-[#ff4d6d]">● Dipilih</span>}
                  </div>

                  {/* Slot Controls on hover / touch */}
                  {photoUrl ? (
                    <div
                      className={`absolute top-1.5 right-1.5 flex items-center gap-1 z-20 transition-opacity ${
                        isTarget ? "opacity-100" : "opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                      }`}
                    >
                      {/* Flip / Mirror Slot Photo Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playClick();
                          flipSlotPhoto(slotIdx);
                        }}
                        className="p-1 rounded-md bg-white/95 text-[#764ba2] hover:bg-white shadow hover:scale-110 active:scale-95 cursor-pointer transition-transform"
                        title="Balik Arah Foto Ini (Flip / Cermin)"
                      >
                        <FlipHorizontal className="w-3.5 h-3.5" />
                      </button>

                      {slotIdx < geom.slots.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playClick();
                            swapSlots(slotIdx, slotIdx + 1);
                          }}
                          className="p-1 rounded-md bg-white/90 text-[#2d1b4e] shadow hover:bg-white cursor-pointer"
                          title="Tukar Posisi"
                        >
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playClick();
                          removePhotoFromSlot(slotIdx);
                        }}
                        className="p-1 rounded-md bg-red-500 text-white shadow hover:bg-red-600 cursor-pointer"
                        title="Hapus Foto dari Slot"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-1 z-10 pointer-events-none">
                      <div className="w-7 h-7 rounded-full bg-white/80 border-2 border-dashed border-[#2d1b4e]/40 flex items-center justify-center mx-auto mb-1 text-[#2d1b4e]">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-black text-[#2d1b4e]/70 bg-white/60 px-2 py-0.5 rounded-full">
                        Pilih Foto
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Placed Stickers Interactive Layer */}
            {placedStickers.map((s) => {
              const isSelected = selectedStickerId === s.id;
              return (
                <div
                  key={s.id}
                  style={{
                    position: "absolute",
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    transform: `translate(-50%, -50%) scale(${s.scale || 1}) rotate(${
                      s.rotation || 0
                    }deg)`,
                    cursor: draggingStickerId === s.id ? "grabbing" : "grab",
                    zIndex: isSelected ? 40 : 25,
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedStickerId(s.id);
                    setDraggingStickerId(s.id);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedStickerId(s.id);
                    setDraggingStickerId(s.id);
                  }}
                  className={`group select-none touch-none ${
                    isSelected ? "ring-2 ring-[#ff4d6d] rounded-lg p-0.5" : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.url}
                    alt="Sticker"
                    className="max-w-[130px] max-h-16 w-auto h-auto object-contain drop-shadow-md pointer-events-none"
                    draggable={false}
                  />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playClick();
                      removeSticker(s.id);
                      if (selectedStickerId === s.id) setSelectedStickerId(null);
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 border border-white text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right / Bottom Sidebar: Customization Controls */}
        <div className="w-full lg:w-96 border-t-2 lg:border-t-0 lg:border-l-2 border-[#2d1b4e]/10 bg-white flex flex-col h-auto lg:h-full">
          {/* Studio Navigation Tabs */}
          <div className="flex border-b-2 border-[#2d1b4e]/10 bg-[#faf5ff] p-1 gap-1 overflow-x-auto">
            {[
              { id: "layout", label: "Bentuk Frame", icon: <LayoutGrid className="w-3.5 h-3.5" /> },
              { id: "photos", label: "Baki Foto", icon: <Images className="w-3.5 h-3.5" /> },
              { id: "frames", label: "Warna Tema", icon: <Palette className="w-3.5 h-3.5" /> },
              { id: "stickers", label: "Stiker & Emot", icon: <Smile className="w-3.5 h-3.5" /> },
              { id: "filters", label: "Filter", icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
              { id: "text", label: "Teks Label", icon: <Type className="w-3.5 h-3.5" /> },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playClick();
                    setActiveTab(tab.id as StudioTab);
                  }}
                  className={`flex-1 py-2 px-2 rounded-xl text-[11px] sm:text-xs font-black flex items-center justify-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-white text-[#764ba2] shadow-sm border border-[#2d1b4e]/10"
                      : "text-[#5e4777] hover:bg-white/50"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto max-h-[320px] lg:max-h-none">
            {/* TAB 0: LAYOUT / BENTUK FRAME KALI BERAPA */}
            {activeTab === "layout" && (
              <div className="flex flex-col gap-3">
                <div className="bg-[#f0e6ff] p-3 rounded-2xl border-2 border-[#2d1b4e]/10">
                  <span className="text-xs font-black text-[#2d1b4e] block mb-1">
                    Pilih Bentuk Layout Frame
                  </span>
                  <p className="text-[11px] font-semibold text-[#5e4777]">
                    Bebas pilih bentuk frame vertikal 4-cut, grid kotak 2x2, poster 6 foto, atau
                    strip retro tanpa merusak proporsi foto!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {LAYOUT_OPTIONS.map((opt) => {
                    const isSelected = layoutType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          playClick();
                          setLayoutType(opt.id);
                        }}
                        className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-[#764ba2] bg-[#f5eeff] shadow-[0_4px_0_#764ba2] scale-[1.02]"
                            : "border-[#2d1b4e]/10 bg-white hover:border-[#764ba2]/40"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-2xl">{opt.icon}</span>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#ff4d6d] text-white">
                              {opt.badge}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-[#2d1b4e]">{opt.name}</h4>
                          <p className="text-[10px] font-semibold text-[#8b6cb0] mt-0.5 leading-tight">
                            {opt.description}
                          </p>
                        </div>
                        <div className="mt-2 text-[10px] font-black text-[#764ba2]">
                          {opt.slots} Slot Foto
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 1: CAPTURED PHOTOS TRAY */}
            {activeTab === "photos" && (
              <div className="flex flex-col gap-3">
                <div className="bg-[#f0e6ff] p-3 rounded-2xl border-2 border-[#2d1b4e]/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-[#2d1b4e]">
                      Koleksi Foto ({capturedPhotos.length} Shots)
                    </span>
                    <span className="text-[10px] font-bold text-[#764ba2] bg-white px-2 py-0.5 rounded-full">
                      Tarik atau Klik Foto
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-[#5e4777]">
                    Klik salah satu slot di frame kiri untuk menargetkannya, lalu pilih foto di bawah
                    ini untuk memasukkannya ke frame!
                  </p>
                </div>

                {/* Quick Action: Flip all photos in frame */}
                <button
                  onClick={async () => {
                    playClick();
                    await flipAllSlotPhotos();
                  }}
                  className="btn-cartoon btn-cartoon-sm btn-cartoon-warm w-full py-2.5 px-3 text-xs flex items-center justify-center gap-2 shadow-[0_3px_0_#2d1b4e] cursor-pointer"
                  title="Balik semua foto di frame jika posisi terasa kebalik"
                >
                  <FlipHorizontal className="w-4 h-4 text-[#764ba2]" />
                  <span className="font-black text-[#2d1b4e]">🪞 Balik / Mirror Semua Foto di Frame</span>
                </button>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {capturedPhotos.map((photoUrl, idx) => {
                    const slotUsedIndex = frameSlots.findIndex((s) => s === photoUrl);
                    const isUsed = slotUsedIndex !== -1;

                    return (
                      <div
                        key={idx}
                        draggable
                        onDragStart={() => setDraggedPhotoUrl(photoUrl)}
                        onClick={() => handleSelectPhotoFromTray(photoUrl)}
                        className={`group relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                          isUsed
                            ? "border-[#764ba2] ring-2 ring-[#764ba2]/40"
                            : "border-[#2d1b4e]/20 hover:border-[#ff4d6d] hover:scale-105"
                        }`}
                      >
                        {/* Flip single captured photo */}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            playClick();
                            await flipCapturedPhoto(idx);
                          }}
                          className="absolute top-1 right-1 p-1 rounded-md bg-white/90 text-[#764ba2] hover:bg-white shadow hover:scale-110 active:scale-95 z-20 cursor-pointer"
                          title="Balik foto ini (Flip/Cermin)"
                        >
                          <FlipHorizontal className="w-3 h-3" />
                        </button>

                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoUrl}
                          alt={`Shot ${idx + 1}`}
                          className="w-full h-20 sm:h-24 object-cover"
                        />
                        <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded-md bg-black/70 text-white text-[9px] font-black">
                          #{idx + 1}
                        </div>
                        {isUsed && (
                          <div className="absolute bottom-1 left-1 right-1 text-center py-0.5 rounded bg-[#764ba2] text-white text-[9px] font-black">
                            Slot {slotUsedIndex + 1} ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      playClick();
                      capturedPhotos
                        .slice(0, geom.slots.length)
                        .forEach((p, i) => assignPhotoToSlot(i, p));
                    }}
                    className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost flex-1 text-[11px] py-1.5"
                  >
                    Auto-Isi Semua
                  </button>
                  <button
                    onClick={() => {
                      playClick();
                      geom.slots.forEach((_, i) => removePhotoFromSlot(i));
                    }}
                    className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost text-[11px] py-1.5 text-red-500"
                  >
                    Kosongkan Slot
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: FRAMES COLOR / THEMES */}
            {activeTab === "frames" && (
              <div className="flex flex-col gap-3">
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {FRAME_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        playClick();
                        setFrameCategory(cat.id);
                      }}
                      className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                        frameCategory === cat.id
                          ? "bg-[#764ba2] text-white"
                          : "bg-gray-100 text-[#5e4777] hover:bg-gray-200"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {filteredFrames.map((frame) => {
                    const isSelected = selectedFrame.id === frame.id;
                    const bg = frame.solidColor
                      ? frame.solidColor
                      : `linear-gradient(135deg, ${frame.cornerColors.tl}, ${frame.cornerColors.br})`;

                    return (
                      <button
                        key={frame.id}
                        onClick={() => {
                          playClick();
                          setSelectedFrame(frame);
                        }}
                        className={`p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center text-center cursor-pointer ${
                          isSelected
                            ? "border-[#764ba2] bg-[#f0e6ff] shadow-[0_3px_0_#764ba2] scale-[1.02]"
                            : "border-[#2d1b4e]/10 bg-white hover:border-[#764ba2]/40"
                        }`}
                      >
                        <div
                          className="w-full h-14 rounded-xl border border-[#2d1b4e]/30 flex items-center justify-center mb-1.5 shadow-sm"
                          style={{ background: bg }}
                        >
                          <span className="text-xl">{frame.emoji}</span>
                        </div>
                        <span className="text-[11px] font-black text-[#2d1b4e] leading-tight">
                          {frame.name}
                        </span>
                        <span className="text-[9px] font-bold text-[#8b6cb0] mt-0.5">
                          {frame.tagline || "Life4Cuts"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: STICKERS & EMOJIS */}
            {activeTab === "stickers" && (
              <div className="flex flex-col gap-3">
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {STICKER_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        playClick();
                        setStickerCategory(cat.id);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                        stickerCategory === cat.id
                          ? "bg-[#ff4d6d] text-white"
                          : "bg-gray-100 text-[#5e4777] hover:bg-gray-200"
                      }`}
                    >
                      {cat.emoji} {cat.name}
                    </button>
                  ))}
                </div>

                <div
                  className={
                    stickerCategory === "music"
                      ? "grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto p-1"
                      : "grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto p-1"
                  }
                >
                  {filteredStickers.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => handleAddSticker(st)}
                      className={
                        stickerCategory === "music"
                          ? "p-2 rounded-xl border-2 border-[#2d1b4e]/10 bg-white hover:border-[#ff4d6d] hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer shadow-sm text-center"
                          : "p-1.5 rounded-xl border-2 border-[#2d1b4e]/10 bg-white hover:border-[#ff4d6d] hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                      }
                      title={st.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={st.url}
                        alt={st.name}
                        className={
                          stickerCategory === "music"
                            ? "w-full max-h-12 object-contain"
                            : "w-7 h-7 sm:w-8 sm:h-8 object-contain"
                        }
                      />
                      {stickerCategory === "music" && (
                        <span className="text-[9px] font-black text-[#2d1b4e] mt-1 line-clamp-1">
                          {st.name}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {activeSticker && (
                  <div className="p-2.5 bg-[#fff0f3] rounded-2xl border-2 border-[#ff4d6d]/30">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-black text-[#ff4d6d]">
                        Atur Stiker Terpilih
                      </span>
                      <button
                        onClick={() => {
                          playClick();
                          removeSticker(activeSticker.id);
                          setSelectedStickerId(null);
                        }}
                        className="text-[10px] font-bold text-red-500 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-bold text-[#2d1b4e] flex items-center gap-1">
                          <ZoomIn className="w-3 h-3" /> Ukuran:
                        </span>
                        <input
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.1"
                          value={activeSticker.scale || 1}
                          onChange={(e) =>
                            updateSticker(activeSticker.id, {
                              scale: parseFloat(e.target.value),
                            })
                          }
                          className="flex-1"
                        />
                        <span className="font-black text-[#ff4d6d] w-6 text-right">
                          {activeSticker.scale}x
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-bold text-[#2d1b4e] flex items-center gap-1">
                          <RotateCw className="w-3 h-3" /> Putar:
                        </span>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          step="5"
                          value={activeSticker.rotation || 0}
                          onChange={(e) =>
                            updateSticker(activeSticker.id, {
                              rotation: parseInt(e.target.value),
                            })
                          }
                          className="flex-1"
                        />
                        <span className="font-black text-[#ff4d6d] w-7 text-right">
                          {activeSticker.rotation}°
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {placedStickers.length > 0 && (
                  <button
                    onClick={() => {
                      playClick();
                      clearStickers();
                      setSelectedStickerId(null);
                    }}
                    className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost text-[11px] py-1 text-red-500"
                  >
                    Hapus Semua Stiker ({placedStickers.length})
                  </button>
                )}
              </div>
            )}

            {/* TAB 4: FILTERS & TUNE */}
            {activeTab === "filters" && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-black text-[#2d1b4e] mb-1.5 block">
                    Preset Filter Foto
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PHOTO_FILTERS.map((flt) => (
                      <button
                        key={flt.id}
                        onClick={() => {
                          playClick();
                          setSelectedFilter(flt.id);
                        }}
                        className={`p-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                          selectedFilter === flt.id
                            ? "border-[#764ba2] bg-[#f0e6ff] text-[#764ba2]"
                            : "border-[#2d1b4e]/10 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {flt.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-[#2d1b4e] mb-1">
                      <span>Kecerahan (Brightness)</span>
                      <span>{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="140"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-[#2d1b4e] mb-1">
                      <span>Kontras (Contrast)</span>
                      <span>{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="140"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: BRANDING TEXT & DATE STAMP */}
            {activeTab === "text" && (
              <div className="flex flex-col gap-3">
                {/* 1-Click Hit Song Presets */}
                <div className="bg-[#f0e6ff] p-3 rounded-2xl border-2 border-[#764ba2]/20">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Music className="w-3.5 h-3.5 text-[#764ba2]" />
                    <span className="text-[11px] font-black text-[#2d1b4e]">
                      Preset Judul Lagu Hits (1-Klik)
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold text-[#5e4777] mb-2 leading-tight">
                    Pilih lagu hits favoritmu — <strong className="text-[#764ba2]">Desain frame, warna, logo band & teks</strong> akan otomatis berubah serasi:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 max-h-[190px] overflow-y-auto pr-1">
                    {SONG_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          playClick();
                          const matchedFrame = FRAMES.find((f) => f.id === p.frameId);
                          if (matchedFrame) {
                            setSelectedFrame(matchedFrame);
                          }
                          setCustomTitle(p.title);
                          setCustomSubtitle(p.subtitle);
                        }}
                        className="p-1.5 rounded-xl border border-[#764ba2]/30 bg-white hover:bg-[#764ba2] hover:text-white transition-all text-left flex items-start gap-1.5 cursor-pointer shadow-xs group"
                        title={`Terapkan tema album ${p.band}: ${p.styleHint}`}
                      >
                        <span className="text-xs">{p.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black text-[#2d1b4e] group-hover:text-white truncate">
                            {p.title}
                          </p>
                          <p className="text-[8px] font-semibold text-[#8b6cb0] group-hover:text-white/80 truncate">
                            {p.subtitle}
                          </p>
                          <span className="inline-block text-[7.5px] font-bold text-[#ff4d6d] group-hover:text-yellow-200 mt-0.5 truncate max-w-full">
                            ✨ {p.styleHint}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-[#2d1b4e] mb-1 block">
                    Judul Frame Photobooth
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    maxLength={30}
                    placeholder="Contoh: KikoBooth / Sweet 17th"
                    className="w-full px-3 py-1.5 rounded-xl border-2 border-[#2d1b4e]/20 text-xs sm:text-sm font-bold text-[#2d1b4e] outline-none focus:border-[#764ba2]"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-[#2d1b4e] mb-1 block">
                    Sub-judul / Tagline
                  </label>
                  <input
                    type="text"
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                    maxLength={40}
                    placeholder="Contoh: Besties Forever / Seoul Studio"
                    className="w-full px-3 py-1.5 rounded-xl border-2 border-[#2d1b4e]/20 text-xs sm:text-sm font-bold text-[#2d1b4e] outline-none focus:border-[#764ba2]"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xs font-bold text-[#2d1b4e]">
                    Tampilkan Tanggal Cetak
                  </span>
                  <input
                    type="checkbox"
                    checked={showDateStamp}
                    onChange={(e) => setShowDateStamp(e.target.checked)}
                    className="w-4 h-4 accent-[#764ba2] cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
