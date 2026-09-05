"use client";

import { useState, useRef, useEffect } from "react";
import { usePhotoboothStore } from "@/store/photobooth-store";
import { FRAMES, FRAME_CATEGORIES, type FrameDef } from "@/lib/frames";
import { renderSingle, renderStrip, renderGrid, loadImage, type RenderOpts } from "@/lib/render-engine";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function FrameSelectScreen() {
  const { capturedPhotos, layoutMode, setSelectedFrame, selectedFrame, setStep } = usePhotoboothStore();
  const [category, setCategory] = useState("all");
  const [previewFrame, setPreviewFrame] = useState<FrameDef>(selectedFrame);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState(false);

  const filtered = category === "all" ? FRAMES : FRAMES.filter((f) => f.category === category);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || capturedPhotos.length === 0) return;

    let cancelled = false;
    setRendering(true);

    const opts: RenderOpts = {
      frame: previewFrame,
      title: "KikoBooth",
    };

    Promise.all(capturedPhotos.map(loadImage)).then((images) => {
      if (cancelled) return;
      if (layoutMode === "single") renderSingle(canvas, images[0], opts);
      else if (layoutMode.startsWith("strip")) renderStrip(canvas, images, opts);
      else if (layoutMode === "grid-4") renderGrid(canvas, images, opts);
      setRendering(false);
    });

    return () => { cancelled = true; };
  }, [previewFrame, capturedPhotos, layoutMode]);

  const handleConfirm = () => {
    setSelectedFrame(previewFrame);
    setStep("editor");
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--gradient-bg)" }}>
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => setStep("camera")} className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost">
          <ChevronLeft className="w-4 h-4" /> Foto Ulang
        </button>
        <div className="card-cartoon-sm px-4 py-1.5 bg-white">
          <span className="text-sm font-black text-[#2d1b4e]">Pilih Frame</span>
        </div>
        <button onClick={handleConfirm} className="btn-cartoon btn-cartoon-sm btn-cartoon-primary">
          Lanjut <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 overflow-hidden min-h-0">
        <div className="relative">
          <canvas ref={canvasRef} className="max-h-[48vh] max-w-full object-contain rounded-2xl border-4 border-white shadow-[0_12px_40px_rgba(120,60,200,0.2)]" />
          {rendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-2xl backdrop-blur-sm">
              <Loader2 className="w-8 h-8 text-[#764ba2] animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="card-cartoon rounded-t-3xl rounded-b-none mx-0 border-x-0 border-b-0 p-4" style={{ borderTopWidth: "3px" }}>
        <div className="flex gap-2 overflow-x-auto pb-3">
          {FRAME_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border-2 whitespace-nowrap transition-all cursor-pointer ${
                category === cat.id
                  ? "border-[#764ba2] bg-[#f0e6ff] text-[#764ba2] shadow-[0_2px_0_#764ba2]"
                  : "border-[rgba(45,27,78,0.15)] text-[#8b6cb0] bg-white hover:bg-[#faf5ff]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3 max-h-[200px] overflow-y-auto pb-2">
          {filtered.map((frame) => {
            const active = previewFrame.id === frame.id;
            const bg = frame.solidColor
              ? frame.solidColor
              : `linear-gradient(135deg, ${frame.cornerColors.tl}, ${frame.cornerColors.tr}, ${frame.cornerColors.bl}, ${frame.cornerColors.br})`;

            return (
              <button
                key={frame.id}
                onClick={() => setPreviewFrame(frame)}
                className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all ${active ? "scale-105" : "hover:scale-105"}`}
              >
                <div
                  className={`w-14 h-14 rounded-xl border-[2.5px] border-[#2d1b4e] shadow-[0_3px_0_#2d1b4e] transition-all ${
                    active ? "ring-3 ring-[#764ba2] ring-offset-2" : ""
                  }`}
                  style={{ background: bg }}
                />
                <span className={`text-[9px] font-bold leading-tight text-center ${active ? "text-[#764ba2]" : "text-[#8b6cb0]"}`}>
                  {frame.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
