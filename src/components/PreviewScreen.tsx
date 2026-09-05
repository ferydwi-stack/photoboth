"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePhotoboothStore } from "@/store/photobooth-store";
import { renderSingle, renderStrip, renderGrid, loadImage, downloadCanvas, generateFilename, type RenderOpts } from "@/lib/render-engine";
import { PHOTO_FILTERS } from "@/lib/filters";
import { useToastStore } from "@/components/Toast";
import { useConfirmDialog } from "@/components/ConfirmDialog";
import { playSuccess } from "@/lib/sounds";
import { Download, Share2, Home, ArrowLeft, RotateCcw, Loader2 } from "lucide-react";

export default function PreviewScreen() {
  const {
    capturedPhotos, selectedFrame,
    layoutMode, selectedFilter, placedStickers, brightness, contrast,
    customText, customTextColor, watermarkEnabled, watermarkText,
    setStep, setFinalPhoto, reset, clearCapturedPhotos, clearStickers,
  } = usePhotoboothStore();

  const addToast = useToastStore((s) => s.addToast);
  const { confirm, dialog } = useConfirmDialog();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState(true);

  const renderPhoto = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || capturedPhotos.length === 0) return;
    setRendering(true);
    try {
      const images = await Promise.all(capturedPhotos.map(loadImage));
      const filterCss = PHOTO_FILTERS.find((f) => f.id === selectedFilter)?.css;

      const opts: RenderOpts = {
        frame: selectedFrame, title: "KikoBooth", filterCss, brightness, contrast,
        stickers: placedStickers, customText, customTextColor,
        watermarkText: watermarkEnabled ? watermarkText : null,
      };

      if (layoutMode === "single") renderSingle(canvas, images[0], opts);
      else if (layoutMode.startsWith("strip")) renderStrip(canvas, images, opts);
      else if (layoutMode === "grid-4") renderGrid(canvas, images, opts);

      setFinalPhoto(canvas.toDataURL("image/png"));
      playSuccess();
    } catch (err) { console.error("Render failed", err); }
    finally { setRendering(false); }
  }, [capturedPhotos, selectedFrame, layoutMode, selectedFilter, placedStickers, brightness, contrast, customText, customTextColor, watermarkEnabled, watermarkText, setFinalPhoto]);

  useEffect(() => { renderPhoto(); }, [renderPhoto]);

  const handleDownload = () => {
    if (canvasRef.current) {
      downloadCanvas(canvasRef.current, generateFilename("KikoBooth"));
      addToast("Foto berhasil disimpan!", "success");
    }
  };

  const handleShare = async () => {
    const canvas = canvasRef.current; if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
      if (blob && navigator.share) {
        await navigator.share({ files: [new File([blob], generateFilename("KikoBooth"), { type: "image/png" })], title: "KikoBooth" });
        addToast("Berhasil dibagikan!", "success");
      } else if (blob) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          addToast("Foto disalin ke clipboard!", "info");
        } catch {
          addToast("Share tidak didukung browser ini", "error");
        }
      }
    } catch { /* cancelled */ }
  };

  const handleNewPhoto = async () => {
    const ok = await confirm("Foto lagi?", "Foto saat ini tidak akan hilang jika sudah di-download.");
    if (!ok) return;
    clearCapturedPhotos(); clearStickers(); reset();
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--gradient-bg)" }}>
      {dialog}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => setStep("editor")} className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost"><ArrowLeft className="w-4 h-4" /> Edit</button>
        <div className="card-cartoon-sm px-4 py-1.5 bg-white"><span className="text-sm font-black text-[#2d1b4e]">Hasil Foto!</span></div>
        <button onClick={handleNewPhoto} className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost" title="Beranda"><Home className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        <div className="relative max-h-full">
          <canvas ref={canvasRef} className="max-h-[65vh] max-w-full object-contain rounded-2xl shadow-[0_16px_48px_rgba(120,60,200,0.25)] border-[6px] border-white animate-bounce-in" />
          {rendering && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-2xl backdrop-blur-sm gap-3">
              <Loader2 className="w-10 h-10 text-[#764ba2] animate-spin" />
              <p className="text-sm font-bold text-[#764ba2]">Memproses foto...</p>
            </div>
          )}
        </div>
      </div>

      <div className="card-cartoon rounded-t-3xl rounded-b-none p-5 mx-0 border-x-0 border-b-0" style={{ borderTopWidth: "3px" }}>
        <div className="flex gap-3 max-w-md mx-auto">
          <button onClick={handleDownload} disabled={rendering} className="flex-1 btn-cartoon btn-cartoon-primary flex flex-col items-center gap-1 py-4 disabled:opacity-50">
            <Download className="w-6 h-6" /><span className="text-sm">Simpan</span>
          </button>
          <button onClick={handleShare} disabled={rendering} className="flex-1 btn-cartoon btn-cartoon-warm flex flex-col items-center gap-1 py-4 disabled:opacity-50">
            <Share2 className="w-6 h-6" /><span className="text-sm">Share</span>
          </button>
          <button onClick={handleNewPhoto} className="flex-1 btn-cartoon btn-cartoon-ghost flex flex-col items-center gap-1 py-4">
            <RotateCcw className="w-6 h-6" /><span className="text-sm">Lagi!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
