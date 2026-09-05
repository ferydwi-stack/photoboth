"use client";

import { useEffect, useRef, useState } from "react";
import { usePhotoboothStore } from "@/store/photobooth-store";
import { useCamera } from "@/hooks/useCamera";
import { useCountdown } from "@/hooks/useCountdown";
import { useConfirmDialog } from "@/components/ConfirmDialog";
import { PHOTO_FILTERS } from "@/lib/filters";
import { playShutter, playCountdownBeep, playCountdownFinal } from "@/lib/sounds";
import { Camera, RotateCcw, Maximize, Minimize, ChevronLeft, FlipHorizontal, Timer, Palette, Loader2, AlertCircle } from "lucide-react";

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
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
        <button onClick={handleBack} className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost"><ChevronLeft className="w-4 h-4" /> Kembali</button>
        <div className="text-center">
          {layoutMode !== "single" && (
            <div className="card-cartoon-sm px-3 py-1 sm:px-4 sm:py-1.5 flex items-center gap-2 bg-white/95">
              <Camera className="w-4 h-4 text-[#764ba2]" />
              <span className="text-xs sm:text-sm font-bold text-[#2d1b4e]">{capturedPhotos.length + 1} / {required}</span>
              <div className="flex gap-1">
                {Array.from({ length: required }).map((_, i) => (
                  <div key={i} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-[#2d1b4e] ${i < capturedPhotos.length ? "bg-green-400" : i === capturedPhotos.length ? "bg-yellow-400 animate-pulse" : "bg-white"}`} />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={() => setIsMirrored(!isMirrored)} className={`btn-cartoon btn-cartoon-sm ${isMirrored ? "btn-cartoon-primary" : "btn-cartoon-ghost"}`} title="Mirror"><FlipHorizontal className="w-4 h-4" /></button>
          <button onClick={() => setCountdownDuration((p) => p === 3 ? 5 : p === 5 ? 10 : 3)} className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost"><Timer className="w-4 h-4" /> <span className="hidden sm:inline">{countdownDuration}s</span></button>
          <button onClick={toggleFullscreen} className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost hidden sm:flex">{isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}</button>
        </div>
      </div>

      {/* Camera area — video ALWAYS rendered so ref stays bound */}
      <div className="flex-1 flex items-center justify-center pt-14 pb-40 sm:pt-16 sm:pb-44 px-2">
        {/* Loading overlay */}
        {isLoading && !isReady && !error && (
          <div className="card-cartoon p-6 sm:p-8 text-center max-w-sm mx-4 animate-bounce-in absolute z-20">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#764ba2] animate-spin mx-auto mb-3 sm:mb-4" />
            <p className="text-[#2d1b4e] font-bold text-base sm:text-lg">Menyiapkan kamera...</p>
            <p className="text-[#8b6cb0] text-xs sm:text-sm mt-1">Izinkan akses kamera di browser</p>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="card-cartoon p-6 sm:p-8 text-center max-w-sm mx-4 animate-bounce-in absolute z-20">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-50 border-2 border-red-400 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" />
              </div>
            </div>
            <p className="text-[#2d1b4e] font-bold text-base sm:text-lg mb-2">Oops!</p>
            <p className="text-[#8b6cb0] text-xs sm:text-sm mb-4">{error}</p>
            <button onClick={startCamera} className="btn-cartoon btn-cartoon-sm btn-cartoon-primary"><RotateCcw className="w-4 h-4" /> Coba Lagi</button>
          </div>
        )}

        {/* Video element — always in DOM but hidden when not ready */}
        <div className={`relative rounded-2xl sm:rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl transition-opacity duration-300 ${isReady ? "opacity-100" : "opacity-0 pointer-events-none absolute"}`}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            webkit-playsinline=""
            className="max-h-[55vh] sm:max-h-[60vh] max-w-[90vw] sm:max-w-[85vw] object-contain"
            style={{ transform: isMirrored ? "scaleX(-1)" : "none", filter: currentFilter?.css !== "none" ? currentFilter?.css : undefined }}
          />
          {count !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
              <div className="animate-count-pulse">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white border-4 border-[#2d1b4e] shadow-[0_8px_0_#2d1b4e] flex items-center justify-center">
                  <span className="text-5xl sm:text-7xl font-black text-[#764ba2]">{count}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-2 pb-2 sm:px-4 sm:pb-4">
        <div className="card-cartoon p-3 sm:p-4" style={{ background: "rgba(255,255,255,0.97)" }}>
          <div className="flex justify-center mb-2 sm:mb-3">
            <button onClick={() => setShowFilters(!showFilters)} className={`btn-cartoon btn-cartoon-sm ${showFilters ? "btn-cartoon-warm" : "btn-cartoon-ghost"}`}>
              <Palette className="w-4 h-4" /> Filter {selectedFilter !== "none" ? `• ${PHOTO_FILTERS.find((f) => f.id === selectedFilter)?.name}` : ""}
            </button>
          </div>
          {showFilters && (
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-3 mb-2 sm:mb-3 -mx-1 px-1">
              {PHOTO_FILTERS.map((filter) => (
                <button key={filter.id} onClick={() => setSelectedFilter(filter.id)}
                  className={`flex-shrink-0 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold border-2 transition-all cursor-pointer ${
                    selectedFilter === filter.id ? "border-[#764ba2] bg-[#f0e6ff] text-[#764ba2]" : "border-transparent bg-gray-100 text-gray-500"
                  }`}>{filter.name}</button>
              ))}
            </div>
          )}
          <div className="flex justify-center">
            <button onClick={handleCapture} disabled={!isReady || isRunning}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-[#2d1b4e] bg-gradient-to-br from-[#ff9a9e] to-[#f5576c] shadow-[0_6px_0_#2d1b4e] flex items-center justify-center transition-all hover:shadow-[0_8px_0_#2d1b4e] hover:translate-y-[-2px] active:shadow-[0_2px_0_#2d1b4e] active:translate-y-[3px] disabled:opacity-40 cursor-pointer">
              <Camera className="w-7 h-7 sm:w-9 sm:h-9 text-white drop-shadow" />
            </button>
          </div>
        </div>
      </div>

      {/* Strip previews */}
      {layoutMode !== "single" && capturedPhotos.length > 0 && (
        <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5 sm:gap-2">
          {capturedPhotos.map((photo, i) => (
            <div key={i} className="w-12 h-9 sm:w-16 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden border-2 sm:border-[2.5px] border-white shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
