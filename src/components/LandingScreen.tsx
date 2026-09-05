"use client";

import { usePhotoboothStore, type LayoutMode } from "@/store/photobooth-store";
import { FRAMES, FRAME_CATEGORIES } from "@/lib/frames";
import { Camera, Sparkles, Film, Grid2X2, ImageIcon, Aperture } from "lucide-react";

const LAYOUT_OPTIONS: { id: LayoutMode; label: string; icon: React.ReactNode; count: number }[] = [
  { id: "single", label: "Sekali Jepret", icon: <Camera className="w-7 h-7" />, count: 1 },
  { id: "strip-3", label: "Strip 3", icon: <Film className="w-7 h-7" />, count: 3 },
  { id: "strip-4", label: "Strip 4", icon: <Film className="w-7 h-7" />, count: 4 },
  { id: "grid-4", label: "Grid 2x2", icon: <Grid2X2 className="w-7 h-7" />, count: 4 },
];

export default function LandingScreen() {
  const { setStep, setLayoutMode, layoutMode } = usePhotoboothStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
      {/* Floating decorations — SVG circles + shapes instead of emoji */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[8%] w-16 h-16 rounded-full bg-[#ff9a9e]/20 animate-float" />
        <div className="absolute top-[15%] right-[12%] w-12 h-12 rounded-full bg-[#667eea]/20 animate-float" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-[20%] left-[15%] w-14 h-14 rounded-full bg-[#feca57]/20 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-[15%] right-[8%] w-16 h-16 rounded-full bg-[#764ba2]/20 animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-[45%] left-[5%] w-10 h-10 rounded-lg rotate-45 bg-[#ff6b9d]/15 animate-wiggle" />
        <div className="absolute top-[50%] right-[5%] w-10 h-10 rounded-lg rotate-45 bg-[#48dbfb]/15 animate-wiggle" style={{ animationDelay: "0.7s" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-lg w-full">
        {/* Logo */}
        <div className="animate-bounce-in">
          <div className="w-28 h-28 rounded-[32px] border-[4px] border-[#2d1b4e] bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center shadow-[0_8px_0_#2d1b4e] animate-wiggle">
            <Aperture className="w-14 h-14 text-white drop-shadow-lg" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center animate-bounce-in" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-5xl font-black tracking-tight text-[#2d1b4e] mb-1" style={{ textShadow: "2px 2px 0 rgba(120,60,200,0.15)" }}>
            KikoBooth
          </h1>
          <p className="text-lg font-semibold text-[#8b6cb0]">Capture Your Moment</p>
        </div>

        {/* Layout */}
        <div className="card-cartoon w-full p-5 animate-bounce-in" style={{ animationDelay: "0.2s" }}>
          <p className="text-sm font-bold text-[#8b6cb0] mb-3 text-center uppercase tracking-wider">Pilih Mode Foto</p>
          <div className="grid grid-cols-2 gap-3">
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setLayoutMode(opt.id)}
                className={`p-3 rounded-2xl border-[2.5px] transition-all duration-200 text-center cursor-pointer ${
                  layoutMode === opt.id
                    ? "border-[#764ba2] bg-[#f0e6ff] shadow-[0_4px_0_#764ba2] scale-[1.03]"
                    : "border-[rgba(45,27,78,0.12)] bg-white hover:border-[#c4b5d4] hover:bg-[#faf5ff]"
                }`}
              >
                <div className={`flex justify-center mb-1 ${layoutMode === opt.id ? "text-[#764ba2]" : "text-[#8b6cb0]"}`}>{opt.icon}</div>
                <div className={`text-sm font-bold ${layoutMode === opt.id ? "text-[#764ba2]" : "text-[#2d1b4e]"}`}>{opt.label}</div>
                <div className="text-xs text-[#8b6cb0] mt-0.5">{opt.count} foto</div>
              </button>
            ))}
          </div>
        </div>

        {/* Start */}
        <div className="w-full animate-bounce-in" style={{ animationDelay: "0.3s" }}>
          <button onClick={() => setStep("camera")} className="btn-cartoon btn-cartoon-primary w-full text-xl py-5">
            <Sparkles className="w-6 h-6" /> Mulai Foto!
          </button>
        </div>

        {/* Frame preview */}
        <div className="card-cartoon-sm w-full p-4 animate-bounce-in" style={{ animationDelay: "0.4s" }}>
          <p className="text-xs font-bold text-[#8b6cb0] mb-3 text-center uppercase tracking-wider">{FRAMES.length} Frame Tersedia</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {FRAMES.slice(0, 10).map((frame) => {
              const bg = frame.solidColor || `linear-gradient(135deg, ${frame.cornerColors.tl}, ${frame.cornerColors.br})`;
              return (
                <div key={frame.id} className="w-10 h-10 rounded-xl border-[2px] border-[#2d1b4e] shadow-[0_2px_0_#2d1b4e] hover:scale-110 transition-transform" style={{ background: bg }} title={frame.name} />
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div className="flex gap-3 animate-bounce-in" style={{ animationDelay: "0.5s" }}>
          {[
            { icon: <ImageIcon className="w-3.5 h-3.5" />, label: `${FRAMES.length} Frame` },
            { icon: <Sparkles className="w-3.5 h-3.5" />, label: "12 Filter" },
            { icon: <Camera className="w-3.5 h-3.5" />, label: "60+ Stiker" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-full border border-[rgba(45,27,78,0.1)] text-xs font-bold text-[#2d1b4e]">
              {f.icon} {f.label}
            </div>
          ))}
        </div>

        <p className="text-xs font-semibold text-[#c4b5d4] mt-2">Powered by KikoBooth</p>
      </div>
    </div>
  );
}
