"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePhotoboothStore } from "@/store/photobooth-store";
import { renderSingle, renderStrip, renderGrid, loadImage, downloadCanvas, generateFilename, type RenderOpts } from "@/lib/render-engine";
import { PHOTO_FILTERS } from "@/lib/filters";
import { useToastStore } from "@/components/Toast";
import { useConfirmDialog } from "@/components/ConfirmDialog";
import { playSuccess } from "@/lib/sounds";
import { Download, Share2, Home, ArrowLeft, RotateCcw, Loader2, Heart, X } from "lucide-react";

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
  const [showDonation, setShowDonation] = useState(false);

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
      setShowDonation(true);
    }
  };

  const closeDonation = () => setShowDonation(false);
  const donationUrl = "/qris.jpeg";
  const waUrl = "https://wa.me/?text=Saya%20baru%20download%20foto%20dari%20KikoBooth%20%F0%9F%92%96";

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

      {showDonation && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/55 px-3 py-4" onClick={closeDonation}>
          <div className="card-cartoon w-full max-w-sm overflow-hidden animate-bounce-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 bg-gradient-to-r from-[#ff9a9e] to-[#764ba2] text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-lg">
                <Heart className="w-5 h-5" /> Dukung KikoBooth
              </div>
              <button onClick={closeDonation} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-[#2d1b4e] font-semibold leading-relaxed">
                Kalau fotonya suka, boleh dukung developernya biar frame dan fitur-nya makin bagus.
              </p>
              <div className="rounded-2xl border-2 border-dashed border-[#c4b5d4] bg-[#faf5ff] p-3 flex items-center justify-center min-h-[220px]">
                <div className="text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={donationUrl} alt="QRIS donation" className="max-h-52 mx-auto rounded-xl shadow-md object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  <p className="text-xs text-[#8b6cb0] mt-2">Jika QR tidak tampil, gunakan link/transfer manual.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={waUrl} target="_blank" rel="noreferrer" className="flex-1 btn-cartoon btn-cartoon-primary text-sm py-3">
                  Kirim Pesan
                </a>
                <button onClick={closeDonation} className="flex-1 btn-cartoon btn-cartoon-ghost text-sm py-3">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
