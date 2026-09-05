"use client";

import { useEffect, useRef, useState } from "react";
import { usePhotoboothStore } from "@/store/photobooth-store";
import {
  renderFixed4CutStrip,
  loadImage,
  downloadCanvas,
  generateFilename,
  RenderStripOpts,
} from "@/lib/render-engine";
import { PHOTO_FILTERS } from "@/lib/filters";
import { useToastStore } from "@/components/Toast";
import { useConfirmDialog } from "@/components/ConfirmDialog";
import { playClick } from "@/lib/sounds";
import {
  Download,
  Share2,
  Printer,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  Heart,
  Check,
  X,
  Images,
} from "lucide-react";

export default function PreviewScreen() {
  const {
    frameSlots,
    selectedFrame,
    customTitle,
    customSubtitle,
    showDateStamp,
    selectedFilter,
    brightness,
    contrast,
    placedStickers,
    setBoothStep,
    setActivePage,
    resetBooth,
    saveToGallery,
    setFinalPhoto,
  } = usePhotoboothStore();

  const addToast = useToastStore((s) => s.addToast);
  const { confirm, dialog } = useConfirmDialog();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState(true);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const hasSavedRef = useRef(false);

  // Render high-res final photobooth strip on mount
  useEffect(() => {
    let isCancelled = false;

    async function executeRender() {
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

        if (isCancelled) return;

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
          scaleFactor: 2.2, // High resolution for crystal clear print & download
        };

        await renderFixed4CutStrip(canvas, slotImages, opts);

        if (isCancelled) return;

        const dataUrl = canvas.toDataURL("image/png", 1.0);
        setFinalPhoto(dataUrl);

        if (!hasSavedRef.current) {
          hasSavedRef.current = true;
          saveToGallery(dataUrl, selectedFrame.name);
        }
      } catch (err) {
        console.error("High-res render error", err);
      } finally {
        if (!isCancelled) {
          setRendering(false);
        }
      }
    }

    executeRender();

    return () => {
      isCancelled = true;
    };
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
    saveToGallery,
    setFinalPhoto,
  ]);

  // Download high-res PNG
  const handleDownload = () => {
    playClick();
    if (canvasRef.current) {
      downloadCanvas(canvasRef.current, generateFilename("KikoBooth"));
      addToast("Foto berhasil diunduh dalam kualitas tinggi!", "success");
      setShowSupportModal(true);
    }
  };

  // Direct Print
  const handlePrint = () => {
    playClick();
    window.print();
  };

  // Copy or Share
  const handleShare = async () => {
    playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (blob && navigator.share) {
        await navigator.share({
          files: [new File([blob], generateFilename("KikoBooth"), { type: "image/png" })],
          title: "KikoBooth Photo Strip",
          text: "Foto 4-cut aesthetic dari KikoBooth!",
        });
        addToast("Berhasil dibagikan!", "success");
      } else if (blob && navigator.clipboard) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        addToast("Gambar berhasil disalin ke clipboard!", "info");
      } else {
        addToast("Fitur share otomatis tidak didukung, silakan unduh foto", "info");
      }
    } catch {
      // User cancelled
    }
  };

  const handleShootAgain = async () => {
    playClick();
    const ok = await confirm(
      "Mulai Sesi Foto Baru?",
      "Foto strip saat ini sudah tersimpan di Galeri aplikasi Anda."
    );
    if (!ok) return;
    resetBooth();
  };

  return (
    <div
      className="flex flex-col min-h-screen select-none pb-12"
      style={{ background: "linear-gradient(180deg, #fbf7ff 0%, #f0e6ff 100%)" }}
    >
      {dialog}

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#2d1b4e]/10 bg-white/90 backdrop-blur-md sticky top-0 z-30 print:hidden">
        <button
          onClick={() => {
            playClick();
            setBoothStep("studio");
          }}
          className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost text-xs"
        >
          <ChevronLeft className="w-4 h-4" /> Edit Ulang
        </button>

        <div className="card-cartoon-sm px-4 py-1.5 bg-white text-center">
          <span className="text-xs font-black uppercase tracking-wider text-[#ff4d6d]">
            Hasil Akhir
          </span>
          <h2 className="text-sm sm:text-base font-black text-[#2d1b4e]">
            Photobooth Strip 4-Cut
          </h2>
        </div>

        <button
          onClick={() => {
            playClick();
            setActivePage("gallery");
          }}
          className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost text-xs flex items-center gap-1.5"
        >
          <Images className="w-4 h-4 text-[#764ba2]" />
          Buka Galeri
        </button>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-4 sm:p-8 gap-8 max-w-6xl mx-auto w-full">
        {/* Strip Display Canvas */}
        <div className="relative flex justify-center items-center">
          <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(118,75,162,0.25)] border-6 border-white bg-white animate-bounce-in max-h-[75vh]">
            <canvas
              ref={canvasRef}
              className="max-h-[72vh] max-w-[85vw] sm:max-w-md object-contain"
            />

            {rendering && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                <Sparkles className="w-8 h-8 text-[#ff4d6d] animate-spin" />
                <span className="text-xs font-black text-[#2d1b4e]">
                  Merender Kualitas Cetak HD...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="card-cartoon p-6 sm:p-8 bg-white max-w-md w-full flex flex-col gap-4 print:hidden">
          <div className="text-center sm:text-left border-b-2 border-[#2d1b4e]/10 pb-4">
            <span className="inline-flex items-center gap-1 text-xs font-black uppercase text-[#ff4d6d] bg-[#ffe5ec] px-3 py-1 rounded-full mb-2">
              <Check className="w-3.5 h-3.5" /> Strip Siap Cetak
            </span>
            <h3 className="text-2xl font-black text-[#2d1b4e]">Foto Kamu Cantik Banget! ✨</h3>
            <p className="text-xs sm:text-sm font-semibold text-[#5e4777] mt-1">
              Foto strip ini sudah otomatis tersimpan ke Galeri KikoBooth Anda.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleDownload}
              className="btn-cartoon btn-cartoon-primary text-base py-3.5 w-full shadow-[0_6px_0_#2d1b4e]"
            >
              <Download className="w-5 h-5" /> Unduh Strip Kualitas HD (PNG)
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handlePrint}
                className="btn-cartoon btn-cartoon-ghost text-xs sm:text-sm py-3"
              >
                <Printer className="w-4 h-4 text-[#764ba2]" /> Cetak 2x6
              </button>

              <button
                onClick={handleShare}
                className="btn-cartoon btn-cartoon-ghost text-xs sm:text-sm py-3"
              >
                <Share2 className="w-4 h-4 text-[#ff4d6d]" /> Bagikan / Salin
              </button>
            </div>
          </div>

          <div className="pt-2 border-t-2 border-[#2d1b4e]/10 flex flex-col gap-2">
            <button
              onClick={handleShootAgain}
              className="btn-cartoon btn-cartoon-warm text-sm py-3 w-full"
            >
              <RotateCcw className="w-4 h-4" /> Foto Lagi (Sesi Baru)
            </button>
          </div>
        </div>
      </div>

      {/* Support / Share QRIS Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-bounce-in">
          <div className="card-cartoon max-w-sm w-full p-6 bg-white relative text-center">
            <button
              onClick={() => setShowSupportModal(false)}
              className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff4d6d] to-[#ff9a9e] text-white flex items-center justify-center mx-auto mb-3 shadow-[0_4px_0_#2d1b4e]">
              <Heart className="w-7 h-7" />
            </div>

            <h4 className="text-xl font-black text-[#2d1b4e]">Terima Kasih!</h4>
            <p className="text-xs font-semibold text-[#5e4777] mt-1 mb-4">
              Suka dengan hasil foto KikoBooth? Bagikan ke temanmu atau traktir kopi pengembang! ☕
            </p>

            <div className="p-3 bg-gray-50 rounded-2xl border-2 border-gray-200 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/qris.jpeg"
                alt="QRIS Donasi"
                className="w-44 h-44 object-contain mx-auto rounded-lg"
              />
              <span className="text-[10px] font-bold text-gray-400 block mt-2">
                Scan QRIS KikoBooth
              </span>
            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="btn-cartoon btn-cartoon-ghost text-xs py-2 w-full"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
