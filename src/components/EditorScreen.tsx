"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePhotoboothStore } from "@/store/photobooth-store";
import { PHOTO_FILTERS } from "@/lib/filters";
import { STICKERS, STICKER_CATEGORIES } from "@/lib/stickers";
import { v4 as uuidv4 } from "uuid";
import { ChevronLeft, ChevronRight, Trash2, RotateCcw, X, Palette, Star, SlidersHorizontal, Type } from "lucide-react";

type EditorTab = "filters" | "stickers" | "adjust" | "text";

export default function EditorScreen() {
  const {
    capturedPhotos, selectedFilter, setSelectedFilter,
    placedStickers, addSticker, updateSticker, removeSticker, clearStickers,
    brightness, setBrightness, contrast, setContrast,
    customText, setCustomText, customTextColor, setCustomTextColor,
    setStep,
  } = usePhotoboothStore();

  const [activeTab, setActiveTab] = useState<EditorTab>("filters");
  const [stickerCategory, setStickerCategory] = useState("y2k");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  const photoRef = useRef<HTMLDivElement>(null);

  const photo = capturedPhotos[previewIndex] ?? capturedPhotos[0];
  const filterDef = PHOTO_FILTERS.find((f) => f.id === selectedFilter);
  const combinedFilter = [
    filterDef?.css !== "none" ? filterDef?.css : "",
    brightness !== 100 ? `brightness(${brightness}%)` : "",
    contrast !== 100 ? `contrast(${contrast}%)` : "",
  ].filter(Boolean).join(" ") || undefined;

  const getPointerCoords = (e: MouseEvent | TouchEvent) => {
    if ("touches" in e) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  };

  const onPointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!draggingId || !photoRef.current) return;
    e.preventDefault(); // Prevent scrolling on mobile while dragging
    const r = photoRef.current.getBoundingClientRect();
    const coords = getPointerCoords(e);
    updateSticker(draggingId, {
      x: Math.max(0, Math.min(100, ((coords.clientX - r.left) / r.width) * 100)),
      y: Math.max(0, Math.min(100, ((coords.clientY - r.top) / r.height) * 100)),
    });
  }, [draggingId, updateSticker]);

  const onPointerUp = useCallback(() => setDraggingId(null), []);

  useEffect(() => {
    if (draggingId) {
      window.addEventListener("mousemove", onPointerMove as EventListener, { passive: false });
      window.addEventListener("mouseup", onPointerUp as EventListener);
      window.addEventListener("touchmove", onPointerMove as EventListener, { passive: false });
      window.addEventListener("touchend", onPointerUp as EventListener);
      
      return () => { 
        window.removeEventListener("mousemove", onPointerMove as EventListener); 
        window.removeEventListener("mouseup", onPointerUp as EventListener); 
        window.removeEventListener("touchmove", onPointerMove as EventListener); 
        window.removeEventListener("touchend", onPointerUp as EventListener); 
      };
    }
  }, [draggingId, onPointerMove, onPointerUp]);

  const addStickerFn = (url: string, sid: string) =>
    addSticker({ id: uuidv4(), stickerId: sid, url, x: 50, y: 50, scale: 1, rotation: 0 });

  const TABS: { id: EditorTab; label: string; icon: React.ReactNode }[] = [
    { id: "filters", label: "Filter", icon: <Palette className="w-5 h-5" /> },
    { id: "stickers", label: "Stiker", icon: <Star className="w-5 h-5" /> },
    { id: "adjust", label: "Adjust", icon: <SlidersHorizontal className="w-5 h-5" /> },
    { id: "text", label: "Teks", icon: <Type className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--gradient-bg)" }}>
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => setStep("frame-select")} className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost">
          <ChevronLeft className="w-4 h-4" /> Frame
        </button>
        <div className="card-cartoon-sm px-4 py-1.5 bg-white">
          <span className="text-sm font-black text-[#2d1b4e]">Edit Foto</span>
        </div>
        <button onClick={() => setStep("preview")} className="btn-cartoon btn-cartoon-sm btn-cartoon-primary">
          Selesai <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 overflow-hidden min-h-0">
        <div ref={photoRef} className="relative rounded-3xl overflow-hidden border-4 border-[#2d1b4e] shadow-[0_12px_0_#2d1b4e] max-h-[42vh]" style={{ cursor: draggingId ? "grabbing" : "default" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="Preview" className="max-h-[42vh] max-w-full object-contain pointer-events-none" style={{ filter: combinedFilter }} draggable={false} />

          {placedStickers.map((s) => (
            <div key={s.id} className="absolute select-none group touch-none"
              style={{ 
                left: `${s.x}%`, top: `${s.y}%`, 
                transform: `translate(-50%,-50%) scale(${s.scale}) rotate(${s.rotation}deg)`, 
                cursor: draggingId === s.id ? "grabbing" : "grab", 
                zIndex: draggingId === s.id ? 50 : 10 
              }}
              onMouseDown={(e) => { e.preventDefault(); setDraggingId(s.id); }}
              onTouchStart={(e) => { e.preventDefault(); setDraggingId(s.id); }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.url} alt="Sticker" className="w-16 h-16 drop-shadow-md pointer-events-none" draggable={false} />
              <button onClick={(e) => { e.stopPropagation(); removeSticker(s.id); }}
                onTouchEnd={(e) => { e.stopPropagation(); removeSticker(s.id); }}
                className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-red-500 border-2 border-white text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {customText && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-2xl font-black drop-shadow-lg pointer-events-none px-3 py-1 rounded-xl w-[90%] text-center" style={{ color: customTextColor, WebkitTextStroke: "0.5px rgba(0,0,0,0.3)" }}>
              {customText}
            </div>
          )}
        </div>
      </div>

      {capturedPhotos.length > 1 && (
        <div className="flex justify-center gap-2 px-4 py-2">
          {capturedPhotos.map((p, i) => (
            <button key={i} onClick={() => setPreviewIndex(i)}
              className={`w-14 h-10 rounded-xl overflow-hidden border-[2.5px] transition-all cursor-pointer ${previewIndex === i ? "border-[#764ba2] scale-105 shadow-[0_3px_0_#764ba2]" : "border-[rgba(45,27,78,0.2)] opacity-60"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="card-cartoon rounded-t-3xl rounded-b-none mx-0 border-x-0 border-b-0" style={{ borderTopWidth: "3px" }}>
        <div className="flex border-b-2 border-[rgba(45,27,78,0.1)]">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id ? "text-[#764ba2] border-b-3 border-[#764ba2] bg-[#f0e6ff]/50" : "text-[#8b6cb0]"
              }`}>
              {tab.icon}<span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 min-h-[140px] max-h-[180px] overflow-y-auto">
          {activeTab === "filters" && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {PHOTO_FILTERS.map((filter) => (
                <button key={filter.id} onClick={() => setSelectedFilter(filter.id)} className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer">
                  <div className={`w-16 h-16 rounded-xl overflow-hidden border-[2.5px] border-[#2d1b4e] transition-all shadow-[0_3px_0_#2d1b4e] ${selectedFilter === filter.id ? "scale-105 ring-2 ring-[#764ba2] ring-offset-1" : "opacity-60 hover:opacity-100"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={filter.name} className="w-full h-full object-cover pointer-events-none" style={{ filter: filter.css }} />
                  </div>
                  <span className={`text-[9px] font-bold ${selectedFilter === filter.id ? "text-[#764ba2]" : "text-[#8b6cb0]"}`}>{filter.name}</span>
                </button>
              ))}
            </div>
          )}

          {activeTab === "stickers" && (
            <div>
              <div className="flex gap-2 mb-3 overflow-x-auto">
                {STICKER_CATEGORIES.map((cat) => (
                  <button key={cat.id} onClick={() => setStickerCategory(cat.id)}
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold border-2 whitespace-nowrap cursor-pointer ${
                      stickerCategory === cat.id ? "border-[#764ba2] bg-[#f0e6ff] text-[#764ba2] shadow-[0_2px_0_#764ba2]" : "border-[rgba(45,27,78,0.15)] text-[#8b6cb0] bg-white"
                    }`}>{cat.name}</button>
                ))}
                {placedStickers.length > 0 && (
                  <button onClick={clearStickers} className="px-3 py-1 rounded-full text-xs font-bold border-2 border-red-300 bg-red-50 text-red-500 flex items-center gap-1 cursor-pointer">
                    <Trash2 className="w-3 h-3" /> Hapus
                  </button>
                )}
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {STICKERS.filter((s) => s.category === stickerCategory).map((sticker) => (
                  <button key={sticker.id} onClick={() => addStickerFn(sticker.url, sticker.id)}
                    className="aspect-square rounded-xl bg-white border-[1.5px] border-[rgba(45,27,78,0.1)] hover:border-[#764ba2] hover:bg-[#f0e6ff] flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-[0_2px_0_rgba(45,27,78,0.1)]"
                    title={sticker.name}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sticker.url} alt={sticker.name} className="w-8 h-8 pointer-events-none" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "adjust" && (
            <div className="space-y-4">
              {[{ label: "Brightness", value: brightness, set: setBrightness, icon: <SlidersHorizontal className="w-4 h-4 inline" /> }, { label: "Contrast", value: contrast, set: setContrast, icon: <SlidersHorizontal className="w-4 h-4 inline" /> }].map(({ label, value, set, icon }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm font-bold mb-1.5">
                    <span className="text-[#2d1b4e] flex items-center gap-1">{icon} {label}</span>
                    <span className="text-[#764ba2]">{value}%</span>
                  </div>
                  <input type="range" min="50" max="150" value={value} onChange={(e) => set(Number(e.target.value))} className="w-full" />
                </div>
              ))}
              <button onClick={() => { setBrightness(100); setContrast(100); }} className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          )}

          {activeTab === "text" && (
            <div className="space-y-3">
              <input type="text" value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="Ketik teks di sini..." maxLength={50}
                className="w-full px-4 py-2.5 rounded-xl border-[2.5px] border-[rgba(45,27,78,0.2)] bg-white text-[#2d1b4e] font-bold placeholder-[#c4b5d4] focus:outline-none focus:border-[#764ba2]" />
              <div className="flex gap-2 flex-wrap">
                {["#ffffff", "#2d1b4e", "#ff6b6b", "#feca57", "#00ff88", "#00ccff", "#a855f7", "#ff69b4"].map((color) => (
                  <button key={color} onClick={() => setCustomTextColor(color)}
                    className={`w-9 h-9 rounded-full border-[2.5px] transition-all cursor-pointer ${customTextColor === color ? "border-[#2d1b4e] scale-110 shadow-[0_3px_0_#2d1b4e]" : "border-[rgba(45,27,78,0.2)]"}`}
                    style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
