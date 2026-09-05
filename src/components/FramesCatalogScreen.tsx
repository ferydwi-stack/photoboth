"use client";

import { useState } from "react";
import { usePhotoboothStore } from "@/store/photobooth-store";
import { FRAMES, FRAME_CATEGORIES, FrameDef } from "@/lib/frames";
import { playClick } from "@/lib/sounds";
import { Sparkles, Camera } from "lucide-react";

export default function FramesCatalogScreen() {
  const { setSelectedFrame, startBoothSession } = usePhotoboothStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [pendingFrame, setPendingFrame] = useState<FrameDef | null>(null);

  const filtered =
    selectedCategory === "all" ? FRAMES : FRAMES.filter((f) => f.category === selectedCategory);

  const handleChooseFrame = (frame: FrameDef) => {
    playClick();
    setPendingFrame(frame);
    setShowModal(true);
  };

  const handleStart = (shots: 6 | 10) => {
    playClick();
    if (pendingFrame) setSelectedFrame(pendingFrame);
    setShowModal(false);
    startBoothSession(shots);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen pb-24">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff4d6d]/15 text-[#ff4d6d] text-xs font-black uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" /> 20+ Template Estetik
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#2d1b4e] tracking-tight">
          Koleksi Frame Photobooth
        </h1>
        <p className="text-sm sm:text-base font-bold text-[#8b6cb0] mt-2">
          Pilih tema frame favoritmu mulai dari gaya pastel Korea Life4Cuts, retro Y2K, vintage
          film 35mm, hingga nuansa monochrome mewah.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex justify-center gap-2 overflow-x-auto pb-4 mb-8">
        {FRAME_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              playClick();
              setSelectedCategory(cat.id);
            }}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? "bg-[#764ba2] text-white shadow-[0_4px_12px_rgba(118,75,162,0.35)] scale-105"
                : "bg-white text-[#5e4777] border-2 border-[#2d1b4e]/10 hover:bg-[#f5eeff]"
            }`}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Frame Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((frame) => {
          const bg = frame.solidColor
            ? frame.solidColor
            : `linear-gradient(135deg, ${frame.cornerColors.tl}, ${frame.cornerColors.tr}, ${frame.cornerColors.bl}, ${frame.cornerColors.br})`;

          return (
            <div
              key={frame.id}
              className="card-cartoon p-4 bg-white flex flex-col justify-between hover:scale-[1.02] transition-all group"
            >
              {/* Strip Mockup Representation */}
              <div
                className="w-full h-72 rounded-2xl border-3 border-[#2d1b4e] p-3 flex flex-col justify-between shadow-inner relative overflow-hidden mb-4"
                style={{ background: bg }}
              >
                {/* 4 Mini Slots */}
                <div className="flex flex-col gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-11 rounded-lg bg-white/70 border border-[#2d1b4e]/20 flex items-center justify-center text-xs font-bold text-[#2d1b4e]/60"
                    >
                      Foto {i}
                    </div>
                  ))}
                </div>

                {/* Footer Stamp on Mockup */}
                <div className="text-center pt-1 border-t border-black/15">
                  <span className="text-[10px] font-black uppercase text-[#2d1b4e] block">
                    {frame.name}
                  </span>
                  <span className="text-[8px] font-bold text-black/60">KikoBooth 4-Cut</span>
                </div>

                {/* Floating Emoji Badge */}
                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 border border-[#2d1b4e]/20 flex items-center justify-center shadow text-base">
                  {frame.emoji}
                </div>
              </div>

              {/* Frame Info & Action */}
              <div className="flex flex-col gap-2">
                <div>
                  <h3 className="text-base font-black text-[#2d1b4e]">{frame.name}</h3>
                  <p className="text-xs font-bold text-[#8b6cb0]">
                    {frame.tagline || "Life4Cuts Aesthetic"}
                  </p>
                </div>

                <button
                  onClick={() => handleChooseFrame(frame)}
                  className="btn-cartoon btn-cartoon-primary btn-cartoon-sm w-full py-2.5 text-xs mt-2"
                >
                  <Camera className="w-3.5 h-3.5" /> Pakai Frame Ini
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shoot Option Modal */}
      {showModal && pendingFrame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-bounce-in">
          <div className="card-cartoon max-w-md w-full p-6 bg-white relative">
            <div className="text-center mb-6">
              <span className="text-3xl mb-2 block">{pendingFrame.emoji}</span>
              <h3 className="text-2xl font-black text-[#2d1b4e]">
                Mulai dengan {pendingFrame.name}
              </h3>
              <p className="text-xs sm:text-sm font-bold text-[#8b6cb0] mt-1">
                Pilih jumlah shoot pose foto sebelum kamera dinyalakan:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => handleStart(6)}
                className="p-4 rounded-2xl border-3 border-[#2d1b4e] bg-[#faf5ff] hover:bg-[#f0e6ff] shadow-[0_4px_0_#2d1b4e] text-left cursor-pointer transition-all"
              >
                <span className="text-2xl font-black text-[#764ba2] block">6x</span>
                <span className="text-sm font-black text-[#2d1b4e]">6 Kali Take</span>
                <span className="text-[10px] font-semibold text-[#8b6cb0] block mt-0.5">
                  Cepat & ringkas
                </span>
              </button>

              <button
                onClick={() => handleStart(10)}
                className="p-4 rounded-2xl border-3 border-[#2d1b4e] bg-[#fff0f3] hover:bg-[#ffe0e6] shadow-[0_4px_0_#2d1b4e] text-left cursor-pointer transition-all"
              >
                <span className="text-2xl font-black text-[#ff4d6d] block">10x</span>
                <span className="text-sm font-black text-[#2d1b4e]">10 Kali Take</span>
                <span className="text-[10px] font-semibold text-[#ff4d6d] block mt-0.5">
                  Paling seru & puas
                </span>
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl border-2 border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-100 cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
