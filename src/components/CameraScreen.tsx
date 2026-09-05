"use client";

import { useEffect, useRef, useState } from "react";
import { usePhotoboothStore } from "@/store/photobooth-store";
import { useCamera } from "@/hooks/useCamera";
import { useCountdown } from "@/hooks/useCountdown";
import { useConfirmDialog } from "@/components/ConfirmDialog";
import { PHOTO_FILTERS } from "@/lib/filters";
import { playShutter, playCountdownBeep, playCountdownFinal } from "@/lib/sounds";
import { Camera, RotateCcw, Maximize, Minimize, ChevronLeft, X, FlipHorizontal, Timer, Palette, Loader2, AlertCircle } from "lucide-react";

export default function CameraScreen() {
  const {
    setStep, addCapturedPhoto, capturedPhotos, clearCapturedPhotos,
    setIsFlashing, isFlashing, layoutMode, isMirrored, setIsMirrored,
    selectedFilter, setSelectedFilter, reset, getRequiredPhotoCount,
  } = usePhotoboothStore();

  const { videoRef, canvasRef, isReady, isLoading, error, startCamera, stopCamera, capturePhoto } = useCamera();
  const { count, isRunning, start: startCountdown, cancel: cancelCountdown } = useCountdown();
  const { confirm, dialog } = useConfirmDialog();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [countdownDuration, setCountdownDuration] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number | null>(null);

  const required = getRequiredPhotoCount();

  useEffect(() => {
    clearCapturedPhotos();
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Play beep on countdown change
  useEffect(() => {
    if (count !== null && count !== prevCountRef.current) {
      if (count === 1) playCountdownFinal();
      else if (count > 0) playCountdownBeep();
    }
    prevCountRef.current = count;
  }, [count]);

  const handleCapture = () => {
    if (isRunning) return;
    startCountdown(countdownDuration, () => {
      const photo = capturePhoto(isMirrored);
      if (photo) {
        setIsFlashing(true);
        playShutter();
        setTimeout(() => setIsFlashing(false), 400);
        addCapturedPhoto(photo);
        if (capturedPhotos.length + 1 >= required) {
          setTimeout(() => setStep("frame-select"), 600);
        }
      }
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen(); setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen(); setIsFullscreen(false);
    }
  };

  const handleBack = async () => {
    if (capturedPhotos.length > 0) {
      const ok = await confirm("Kembali?", "Foto yang sudah diambil akan hilang.");
      if (!ok) return;
    }
    stopCamera(); cancelCountdown(); clearCapturedPhotos(); reset();
  };

  const currentFilter = PHOTO_FILTERS.find((f) => f.id === selectedFilter);

  return (
    <div ref={containerRef} className="flex flex-col h-screen relative select-none" style={{ background: "linear-gradient(180deg, #1a0e2e 0%, #2d1b4e 100%)" }}>
      {dialog}
      {isFlashing && <div className="absolute inset-0 bg-white z-50 animate-flash pointer-events-none" />}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3">
        <button onClick={handleBack} className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost"><ChevronLeft className="w-4 h-4" /> Kembali</button>
        <div className="text-center">
          {layoutMode !== "single" && (
            <div className="card-cartoon-sm px-4 py-1.5 flex items-center gap-2 bg-white/95">
              <span className="text-sm font-bold text-[#2d1b4e]">📸 {capturedPhotos.length + 1} / {required}</span>
              <div className="flex gap-1">
                {Array.from({ length: required }).map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full border-2 border-[#2d1b4e] ${i < capturedPhotos.length ? "bg-green-400" : i === capturedPhotos.length ? "bg-yellow-400 animate-pulse" : "bg-white"}`} />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMirrored(!isMirrored)} className={`btn-cartoon btn-cartoon-sm ${isMirrored ? "btn-cartoon-primary" : "btn-cartoon-ghost"}`} title="Mirror"><FlipHorizontal className="w-4 h-4" /></button>
          <button onClick={() => setCountdownDuration((p) => p === 3 ? 5 : p === 5 ? 10 : 3)} className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost"><Timer className="w-4 h-4" /> {countdownDuration}s</button>
          <button onClick={toggleFullscreen} className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost">{isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}</button>
        </div>
      </div>

      {/* Camera */}
      <div className="flex-1 flex items-center justify-center pt-16 pb-44">
        {isLoading && !isReady && !error && (
          <div className="card-cartoon p-8 text-center max-w-sm mx-4 animate-bounce-in">
            <Loader2 className="w-12 h-12 text-[#764ba2] animate-spin mx-auto mb-4" />
            <p className="text-[#2d1b4e] font-bold text-lg">Menyiapkan kamera...</p>
            <p className="text-[#8b6cb0] text-sm mt-1">Izinkan akses kamera di browser</p>
          </div>
        )}
        {error && (
          <div className="card-cartoon p-8 text-center max-w-sm mx-4 animate-bounce-in">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-400 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <p className="text-[#2d1b4e] font-bold text-lg mb-2">Oops!</p>
            <p className="text-[#8b6cb0] text-sm mb-4">{error}</p>
            <button onClick={startCamera} className="btn-cartoon btn-cartoon-sm btn-cartoon-primary"><RotateCcw className="w-4 h-4" /> Coba Lagi</button>
          </div>
        )}
        {!isLoading && !error && (
          <>
            <div className="relative rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl">
              <video ref={videoRef} autoPlay playsInline muted className="max-h-[60vh] max-w-[85vw] object-contain"
                style={{ transform: isMirrored ? "scaleX(-1)" : "none", filter: currentFilter?.css !== "none" ? currentFilter?.css : undefined }} />
              {count !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                  <div className="animate-count-pulse">
                    <div className="w-32 h-32 rounded-full bg-white border-4 border-[#2d1b4e] shadow-[0_8px_0_#2d1b4e] flex items-center justify-center">
                      <span className="text-7xl font-black text-[#764ba2]">{count}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-4">
        <div className="card-cartoon p-4" style={{ background: "rgba(255,255,255,0.97)" }}>
          <div className="flex justify-center mb-3">
            <button onClick={() => setShowFilters(!showFilters)} className={`btn-cartoon btn-cartoon-sm ${showFilters ? "btn-cartoon-warm" : "btn-cartoon-ghost"}`}>
              <Palette className="w-4 h-4" /> Filter {selectedFilter !== "none" ? `• ${PHOTO_FILTERS.find((f) => f.id === selectedFilter)?.name}` : ""}
            </button>
          </div>
          {showFilters && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
              {PHOTO_FILTERS.map((filter) => (
                <button key={filter.id} onClick={() => setSelectedFilter(filter.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all cursor-pointer ${
                    selectedFilter === filter.id ? "border-[#764ba2] bg-[#f0e6ff] text-[#764ba2]" : "border-transparent bg-gray-100 text-gray-500"
                  }`}>{filter.name}</button>
              ))}
            </div>
          )}
          <div className="flex justify-center">
            <button onClick={handleCapture} disabled={!isReady || isRunning}
              className="w-20 h-20 rounded-full border-4 border-[#2d1b4e] bg-gradient-to-br from-[#ff9a9e] to-[#f5576c] shadow-[0_6px_0_#2d1b4e] flex items-center justify-center transition-all hover:shadow-[0_8px_0_#2d1b4e] hover:translate-y-[-2px] active:shadow-[0_2px_0_#2d1b4e] active:translate-y-[3px] disabled:opacity-40 cursor-pointer">
              <Camera className="w-9 h-9 text-white drop-shadow" />
            </button>
          </div>
        </div>
      </div>

      {/* Strip previews */}
      {layoutMode !== "single" && capturedPhotos.length > 0 && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
          {capturedPhotos.map((photo, i) => (
            <div key={i} className="w-16 h-12 rounded-xl overflow-hidden border-[2.5px] border-white shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
