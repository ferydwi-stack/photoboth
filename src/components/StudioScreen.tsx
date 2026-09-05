"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePhotoboothStore } from "@/store/photobooth-store";
import { FRAMES, FRAME_CATEGORIES } from "@/lib/frames";
import { STICKERS, STICKER_CATEGORIES, Sticker, PlacedSticker } from "@/lib/stickers";
import { PHOTO_FILTERS } from "@/lib/filters";
import {
  renderFixed4CutStrip,
  loadImage,
  STRIP_CONFIG,
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
  X,
  RotateCw,
  ZoomIn,
  Plus,
} from "lucide-react";

type StudioTab = "photos" | "frames" | "stickers" | "filters" | "text";

export default function StudioScreen() {
  const {
    capturedPhotos,
    frameSlots,
    assignPhotoToSlot,
    removePhotoFromSlot,
    swapSlots,
    selectedSlotIndex,
    setSelectedSlotIndex,
    selectedFrame,
    setSelectedFrame,
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
  const [activeTab, setActiveTab] = useState<StudioTab>("photos");
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

  // Render the canvas whenever slots, frames, or stickers change
  const updateCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Load all slot images in parallel (or null if empty)
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
      // If a slot is currently highlighted, assign directly to it
      assignPhotoToSlot(selectedSlotIndex, photoUrl);
      setSelectedSlotIndex(null);
    } else {
      // Find first empty slot, or replace slot 0 if all filled
      const emptyIndex = frameSlots.findIndex((s) => s === null);
      if (emptyIndex !== -1) {
        assignPhotoToSlot(emptyIndex, photoUrl);
      } else {
        // Highlight slot 0 by default so user knows they can pick
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
      className="flex flex-col h-screen overflow-hidden select-none"
      style={{ background: "linear-gradient(180deg, #fbf7ff 0%, #f0e6ff 100%)" }}
    >
      {dialog}

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#2d1b4e]/10 bg-white/90 backdrop-blur-md z-30">
        <button
          onClick={handleBackToCamera}
          className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost text-xs"
        >
          <ChevronLeft className="w-4 h-4" /> Foto Ulang
        </button>

        <div className="card-cartoon-sm px-4 py-1.5 bg-white text-center">
          <span className="text-xs font-black uppercase tracking-wider text-[#ff4d6d]">
            Studio Kustomisasi
          </span>
          <h2 className="text-sm sm:text-base font-black text-[#2d1b4e] leading-tight">
            Atur Slot, Frame & Stiker
          </h2>
        </div>

        <button
          onClick={handleProceedToPreview}
          className="btn-cartoon btn-cartoon-sm btn-cartoon-primary text-xs"
        >
          Selesai & Ekspor <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Studio Body: Left Strip Canvas & Right Customization Panel */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left / Center Section: Photobooth Strip Preview & Slot Interactor */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto min-h-0 relative">
          <div className="flex items-center gap-2 mb-2 text-xs font-black text-[#764ba2] bg-white/90 px-3 py-1 rounded-full border border-[#2d1b4e]/10 shadow-sm">
            <span>✨ Bentuk Frame & Ukuran Slot Tetap (4-Cut)</span>
          </div>

          {/* Interactive Strip Container */}
          <div
            ref={stripPreviewRef}
            className="relative rounded-2xl sm:rounded-3xl border-4 border-white shadow-[0_16px_40px_rgba(118,75,162,0.22)] overflow-hidden transition-all max-h-[74vh] object-contain flex items-center justify-center"
            style={{
              aspectRatio: `${STRIP_CONFIG.slotWidth + selectedFrame.borderWidth * 2} / ${
                selectedFrame.borderWidth * 2 +
                STRIP_CONFIG.slotHeight * 4 +
                selectedFrame.gap * 3 +
                STRIP_CONFIG.labelHeight
              }`,
            }}
          >
            {/* The real rendered canvas */}
            <canvas ref={canvasRef} className="w-full h-full object-contain pointer-events-none" />

            {/* Interactive Slot Overlay Grid (4 Slots) */}
            <div
              className="absolute inset-0 flex flex-col pointer-events-auto"
              style={{
                paddingTop: `${(selectedFrame.borderWidth / 1400) * 100}%`,
                paddingBottom: `${((selectedFrame.borderWidth + STRIP_CONFIG.labelHeight) / 1400) * 100}%`,
                paddingLeft: `${(selectedFrame.borderWidth / 520) * 100}%`,
                paddingRight: `${(selectedFrame.borderWidth / 520) * 100}%`,
                gap: `${(selectedFrame.gap / 1400) * 100}%`,
              }}
            >
              {[0, 1, 2, 3].map((slotIdx) => {
                const photoUrl = frameSlots[slotIdx];
                const isTarget = selectedSlotIndex === slotIdx;

                return (
                  <div
                    key={slotIdx}
                    onClick={() => {
                      playClick();
                      setSelectedSlotIndex(isTarget ? null : slotIdx);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedPhotoUrl) {
                        playClick();
                        assignPhotoToSlot(slotIdx, draggedPhotoUrl);
                        setDraggedPhotoUrl(null);
                      }
                    }}
                    className={`flex-1 rounded-xl relative group transition-all cursor-pointer flex items-center justify-center ${
                      isTarget
                        ? "ring-4 ring-[#ff4d6d] ring-offset-2 bg-[#ff4d6d]/10"
                        : "hover:ring-2 hover:ring-[#764ba2]/60"
                    }`}
                  >
                    {/* Slot badge indicator */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-black z-20 flex items-center gap-1">
                      <span>Slot {slotIdx + 1}</span>
                      {isTarget && <span className="text-[#ff4d6d]">● Dipilih</span>}
                    </div>

                    {/* Controls on hover / touch */}
                    {photoUrl ? (
                      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        {/* Swap with next slot */}
                        {slotIdx < 3 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playClick();
                              swapSlots(slotIdx, slotIdx + 1);
                            }}
                            className="p-1.5 rounded-lg bg-white/90 text-[#2d1b4e] shadow hover:bg-white cursor-pointer"
                            title="Tukar dengan Slot Bawah"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Remove photo from slot */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playClick();
                            removePhotoFromSlot(slotIdx);
                          }}
                          className="p-1.5 rounded-lg bg-red-500 text-white shadow hover:bg-red-600 cursor-pointer"
                          title="Hapus Foto dari Slot Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      /* Empty slot prompt */
                      <div className="text-center p-2 z-10 pointer-events-none">
                        <div className="w-8 h-8 rounded-full bg-white/80 border-2 border-dashed border-[#2d1b4e]/40 flex items-center justify-center mx-auto mb-1 text-[#2d1b4e]">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-black text-[#2d1b4e]/70 bg-white/60 px-2 py-0.5 rounded-full">
                          Klik untuk Isi Foto
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

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
                    className="w-14 h-14 object-contain drop-shadow-md pointer-events-none"
                    draggable={false}
                  />

                  {/* Quick Delete button on sticker */}
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
          <div className="flex border-b-2 border-[#2d1b4e]/10 bg-[#faf5ff] p-1.5 gap-1 overflow-x-auto">
            {[
              { id: "photos", label: "Baki Foto", icon: <Images className="w-4 h-4" /> },
              { id: "frames", label: "Frame", icon: <Palette className="w-4 h-4" /> },
              { id: "stickers", label: "Stiker & Emot", icon: <Smile className="w-4 h-4" /> },
              { id: "filters", label: "Filter", icon: <SlidersHorizontal className="w-4 h-4" /> },
              { id: "text", label: "Teks Label", icon: <Type className="w-4 h-4" /> },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playClick();
                    setActiveTab(tab.id as StudioTab);
                  }}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-white text-[#764ba2] shadow-[0_2px_8px_rgba(118,75,162,0.2)] border border-[#2d1b4e]/10"
                      : "text-[#5e4777] hover:bg-white/50"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 p-4 overflow-y-auto max-h-[350px] lg:max-h-none">
            {/* TAB 1: CAPTURED PHOTOS TRAY (6 or 10 Photos) */}
            {activeTab === "photos" && (
              <div className="flex flex-col gap-4">
                <div className="bg-[#f0e6ff] p-3 rounded-2xl border-2 border-[#2d1b4e]/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-[#2d1b4e]">
                      Koleksi Hasil Foto ({capturedPhotos.length} Shots)
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

                {/* Photo Grid of 6 or 10 Shots */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {capturedPhotos.map((photoUrl, idx) => {
                    // Check if photo is already used in any of the 4 slots
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoUrl}
                          alt={`Shot ${idx + 1}`}
                          className="w-full h-24 object-cover"
                        />

                        {/* Shot number badge */}
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-black">
                          #{idx + 1}
                        </div>

                        {/* Slot placement badge if used */}
                        {isUsed && (
                          <div className="absolute bottom-1.5 left-1.5 right-1.5 text-center py-0.5 rounded bg-[#764ba2] text-white text-[10px] font-black">
                            Slot {slotUsedIndex + 1} ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Quick Helper Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      playClick();
                      // Auto-fill slots with first 4 shots
                      capturedPhotos.slice(0, 4).forEach((p, i) => assignPhotoToSlot(i, p));
                    }}
                    className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost flex-1 text-xs"
                  >
                    Reset Slot 1-4
                  </button>
                  <button
                    onClick={() => {
                      playClick();
                      // Clear all slots
                      [0, 1, 2, 3].forEach((i) => removePhotoFromSlot(i));
                    }}
                    className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost text-xs text-red-500"
                  >
                    Kosongkan Slot
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: FRAMES CATALOG */}
            {activeTab === "frames" && (
              <div className="flex flex-col gap-4">
                {/* Categories */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {FRAME_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        playClick();
                        setFrameCategory(cat.id);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                        frameCategory === cat.id
                          ? "bg-[#764ba2] text-white"
                          : "bg-gray-100 text-[#5e4777] hover:bg-gray-200"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Frame Grid */}
                <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
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
                        className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center cursor-pointer ${
                          isSelected
                            ? "border-[#764ba2] bg-[#f0e6ff] shadow-[0_4px_0_#764ba2] scale-[1.02]"
                            : "border-[#2d1b4e]/10 bg-white hover:border-[#764ba2]/40"
                        }`}
                      >
                        <div
                          className="w-full h-16 rounded-xl border border-[#2d1b4e]/30 flex items-center justify-center mb-2 shadow-sm"
                          style={{ background: bg }}
                        >
                          <span className="text-2xl">{frame.emoji}</span>
                        </div>
                        <span className="text-xs font-black text-[#2d1b4e] leading-tight">
                          {frame.name}
                        </span>
                        <span className="text-[10px] font-bold text-[#8b6cb0] mt-0.5">
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
              <div className="flex flex-col gap-4">
                {/* Categories */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {STICKER_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        playClick();
                        setStickerCategory(cat.id);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                        stickerCategory === cat.id
                          ? "bg-[#ff4d6d] text-white"
                          : "bg-gray-100 text-[#5e4777] hover:bg-gray-200"
                      }`}
                    >
                      {cat.emoji} {cat.name}
                    </button>
                  ))}
                </div>

                {/* Sticker Gallery Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 max-h-[220px] overflow-y-auto p-1">
                  {filteredStickers.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => handleAddSticker(st)}
                      className="p-2 rounded-xl border-2 border-[#2d1b4e]/10 bg-white hover:border-[#ff4d6d] hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                      title={st.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={st.url} alt={st.name} className="w-8 h-8 object-contain" />
                    </button>
                  ))}
                </div>

                {/* Sticker Adjustment Controls (if one is selected) */}
                {activeSticker && (
                  <div className="p-3 bg-[#fff0f3] rounded-2xl border-2 border-[#ff4d6d]/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-[#ff4d6d]">
                        Atur Stiker Terpilih
                      </span>
                      <button
                        onClick={() => {
                          playClick();
                          removeSticker(activeSticker.id);
                          setSelectedStickerId(null);
                        }}
                        className="text-[10px] font-bold text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      {/* Scale slider */}
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-bold text-[#2d1b4e] flex items-center gap-1">
                          <ZoomIn className="w-3.5 h-3.5" /> Ukuran:
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
                        <span className="font-black text-[#ff4d6d] w-8 text-right">
                          {activeSticker.scale}x
                        </span>
                      </div>

                      {/* Rotation slider */}
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-bold text-[#2d1b4e] flex items-center gap-1">
                          <RotateCw className="w-3.5 h-3.5" /> Putar:
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
                        <span className="font-black text-[#ff4d6d] w-8 text-right">
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
                    className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost text-xs text-red-500"
                  >
                    Hapus Semua Stiker ({placedStickers.length})
                  </button>
                )}
              </div>
            )}

            {/* TAB 4: FILTERS & TUNE */}
            {activeTab === "filters" && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-black text-[#2d1b4e] mb-2 block">
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

                {/* Sliders */}
                <div className="space-y-3 pt-2">
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
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-black text-[#2d1b4e] mb-1.5 block">
                    Judul Frame Photobooth
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    maxLength={30}
                    placeholder="Contoh: KikoBooth / Sweet 17th"
                    className="w-full px-3 py-2 rounded-xl border-2 border-[#2d1b4e]/20 text-sm font-bold text-[#2d1b4e] outline-none focus:border-[#764ba2]"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-[#2d1b4e] mb-1.5 block">
                    Sub-judul / Tagline
                  </label>
                  <input
                    type="text"
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                    maxLength={40}
                    placeholder="Contoh: Besties Forever / Seoul Studio"
                    className="w-full px-3 py-2 rounded-xl border-2 border-[#2d1b4e]/20 text-sm font-bold text-[#2d1b4e] outline-none focus:border-[#764ba2]"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
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
