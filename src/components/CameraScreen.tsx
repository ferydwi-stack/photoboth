"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePhotoboothStore } from "@/store/photobooth-store";
import { useCamera } from "@/hooks/useCamera";
import { useCountdown } from "@/hooks/useCountdown";
import { useConfirmDialog } from "@/components/ConfirmDialog";
import { PHOTO_FILTERS } from "@/lib/filters";
import {
  playShutter,
  playCountdownBeep,
  playCountdownFinal,
  playSuccess,
  playClick,
} from "@/lib/sounds";
import {
  Camera,
  RotateCcw,
  Maximize,
  Minimize,
  ChevronLeft,
  FlipHorizontal,
  Timer,
  Palette,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function CameraScreen() {
  const {
    shotCountMode,
    capturedPhotos,
    addCapturedPhoto,
    clearCapturedPhotos,
    setBoothStep,
    setActivePage,
    isMirrored,
    setIsMirrored,
    autoCaptureTimer,
    setAutoCaptureTimer,
    autoSequenceEnabled,
    setAutoSequenceEnabled,
    isFlashing,
    setIsFlashing,
    selectedFilter,
    setSelectedFilter,
    initializeSlotsWithCaptured,
  } = usePhotoboothStore();

  const { videoRef, canvasRef, isReady, isLoading, error, startCamera, stopCamera, capturePhoto } =
    useCamera();
  const { count, isRunning, start: startCountdown, cancel: cancelCountdown } = useCountdown();
  const { confirm, dialog } = useConfirmDialog();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number | null>(null);

  const totalRequired = shotCountMode; // 6 or 10
  const isFinished = capturedPhotos.length >= totalRequired;

  // Initialize camera and fresh photos array on entry
  useEffect(() => {
    clearCapturedPhotos();
    startCamera();
    return () => {
      stopCamera();
      cancelCountdown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sound effects on countdown
  useEffect(() => {
    if (count !== null && count !== prevCountRef.current) {
      if (count === 1) playCountdownFinal();
      else if (count > 0) playCountdownBeep();
    }
    prevCountRef.current = count;
  }, [count]);

  const triggerCaptureRef = useRef<() => void>(() => {});

  // Main capture function
  const triggerCapture = useCallback(() => {
    if (isRunning || isFinished) return;

    startCountdown(autoCaptureTimer, () => {
      const photo = capturePhoto(isMirrored);
      if (photo) {
        setIsFlashing(true);
        playShutter();
        setTimeout(() => setIsFlashing(false), 350);
        addCapturedPhoto(photo);

        const currentCount = usePhotoboothStore.getState().capturedPhotos.length;
        if (currentCount >= totalRequired) {
          playSuccess();
          initializeSlotsWithCaptured();
          setTimeout(() => {
            setBoothStep("studio");
          }, 800);
        } else if (autoSequenceEnabled) {
          // Pause 1.8 seconds between shots for user to change pose
          setTimeout(() => {
            if (usePhotoboothStore.getState().capturedPhotos.length < totalRequired) {
              triggerCaptureRef.current();
            }
          }, 1800);
        }
      }
    });
  }, [
    isRunning,
    isFinished,
    startCountdown,
    autoCaptureTimer,
    capturePhoto,
    isMirrored,
    setIsFlashing,
    addCapturedPhoto,
    totalRequired,
    initializeSlotsWithCaptured,
    autoSequenceEnabled,
    setBoothStep,
  ]);

  useEffect(() => {
    triggerCaptureRef.current = triggerCapture;
  }, [triggerCapture]);

  const handleBack = async () => {
    playClick();
    if (capturedPhotos.length > 0) {
      const ok = await confirm(
        "Keluar dari Sesi Foto?",
        "Foto yang sudah diambil akan terhapus jika Anda kembali ke beranda."
      );
      if (!ok) return;
    }
    stopCamera();
    cancelCountdown();
    clearCapturedPhotos();
    setActivePage("home");
  };

  const toggleFullscreen = () => {
    playClick();
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const currentFilter = PHOTO_FILTERS.find((f) => f.id === selectedFilter);

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen relative select-none overflow-hidden"
      style={{ background: "linear-gradient(180deg, #180e2b 0%, #291545 100%)" }}
    >
      {dialog}

      {/* Screen Flash animation */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-50 animate-flash pointer-events-none" />
      )}

      {/* Header HUD Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 py-3 sm:px-6">
        <button
          onClick={handleBack}
          className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost flex items-center gap-1 text-xs sm:text-sm bg-white/90"
        >
          <ChevronLeft className="w-4 h-4" />
          Beranda
        </button>

        {/* Shoot Progress Badge */}
        <div className="card-cartoon-sm px-4 py-2 flex items-center gap-3 bg-white/95 shadow-md">
          <div className="flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-[#ff4d6d]" />
            <span className="text-xs sm:text-sm font-black text-[#2d1b4e]">
              Foto {Math.min(capturedPhotos.length + 1, totalRequired)} dari {totalRequired}
            </span>
          </div>

          {/* Dots Indicator */}
          <div className="flex gap-1">
            {Array.from({ length: totalRequired }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-[#2d1b4e] transition-all ${
                  i < capturedPhotos.length
                    ? "bg-green-400 scale-100"
                    : i === capturedPhotos.length
                    ? "bg-amber-400 animate-pulse scale-110"
                    : "bg-white/80"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quick Tools Controls */}
        <div className="flex items-center gap-2">
          {/* Mirror Flip */}
          <button
            onClick={() => {
              playClick();
              setIsMirrored(!isMirrored);
            }}
            className={`btn-cartoon btn-cartoon-sm ${
              isMirrored ? "btn-cartoon-primary" : "btn-cartoon-ghost"
            } p-2 sm:px-3`}
            title="Mirror Kamera"
          >
            <FlipHorizontal className="w-4 h-4" />
            <span className="hidden md:inline text-xs">Mirror</span>
          </button>

          {/* Timer Duration */}
          <button
            onClick={() => {
              playClick();
              setAutoCaptureTimer(
                autoCaptureTimer === 3 ? 5 : autoCaptureTimer === 5 ? 10 : 3
              );
            }}
            className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost p-2 sm:px-3 text-xs font-bold"
            title="Ubah Durasi Hitung Mundur"
          >
            <Timer className="w-4 h-4 text-[#764ba2]" />
            <span>{autoCaptureTimer}s</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost p-2 hidden sm:flex"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Viewport: Video Stream & Live Reel */}
      <div className="flex-1 flex items-center justify-center pt-16 pb-36 sm:pt-20 sm:pb-40 px-3 relative">
        {/* Loading overlay */}
        {isLoading && !isReady && !error && (
          <div className="card-cartoon p-8 text-center max-w-sm mx-4 animate-bounce-in absolute z-20 bg-white">
            <Loader2 className="w-12 h-12 text-[#764ba2] animate-spin mx-auto mb-4" />
            <p className="text-[#2d1b4e] font-black text-lg">Menghubungkan Kamera...</p>
            <p className="text-[#8b6cb0] text-sm mt-1">Izinkan akses kamera laptop di browser</p>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="card-cartoon p-8 text-center max-w-sm mx-4 animate-bounce-in absolute z-20 bg-white">
            <div className="w-16 h-16 rounded-full bg-red-50 border-3 border-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-[#2d1b4e] font-black text-lg mb-2">Kamera Tidak Terdeteksi</p>
            <p className="text-[#8b6cb0] text-xs mb-4">{error}</p>
            <button
              onClick={startCamera}
              className="btn-cartoon btn-cartoon-sm btn-cartoon-primary"
            >
              <RotateCcw className="w-4 h-4" /> Coba Lagi
            </button>
          </div>
        )}

        {/* Live Video Frame with Rounded Aesthetic Corners */}
        <div
          className={`relative rounded-3xl overflow-hidden border-4 border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all ${
            isReady ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute"
          }`}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="max-h-[58vh] sm:max-h-[62vh] max-w-[86vw] sm:max-w-[78vw] object-cover"
            style={{
              transform: isMirrored ? "scaleX(-1)" : "none",
              filter: currentFilter?.css !== "none" ? currentFilter?.css : undefined,
            }}
          />

          {/* Countdown Overlay Pulsing in Center */}
          {count !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20">
              <div className="animate-count-pulse">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white border-4 border-[#2d1b4e] shadow-[0_10px_0_#2d1b4e] flex items-center justify-center">
                  <span className="text-6xl sm:text-7xl font-black text-[#ff4d6d]">{count}</span>
                </div>
              </div>
            </div>
          )}

          {/* Pose Cue Tip */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold pointer-events-none">
            {capturedPhotos.length === 0
              ? "📸 Pose 1: Senyum Manis!"
              : capturedPhotos.length === 1
              ? "✌️ Pose 2: Peace Sign!"
              : capturedPhotos.length === 2
              ? "🫶 Pose 3: Finger Heart!"
              : capturedPhotos.length === 3
              ? "😜 Pose 4: Ekspresi Lucu!"
              : `✨ Pose ${capturedPhotos.length + 1}: Gaya Bebas!`}
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Film Reel Thumbnails (Left side vertical stack) */}
        {capturedPhotos.length > 0 && (
          <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 max-h-[65vh] overflow-y-auto pr-1">
            {capturedPhotos.map((photo, i) => (
              <div
                key={i}
                className="w-12 h-9 sm:w-16 sm:h-12 rounded-xl overflow-hidden border-2 border-white shadow-[0_4px_10px_rgba(0,0,0,0.4)] relative group animate-bounce-in"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt={`Shot ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 px-1 text-[8px] font-black bg-black/60 text-white rounded-tl-md">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Shutter & Controls Dock */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-3 pb-3 sm:px-6 sm:pb-6">
        <div className="card-cartoon p-3 sm:p-4 bg-white/95 max-w-xl mx-auto shadow-2xl">
          {/* Live Filter Bar Toggle */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => {
                playClick();
                setShowFilters(!showFilters);
              }}
              className={`btn-cartoon btn-cartoon-sm ${
                showFilters ? "btn-cartoon-warm" : "btn-cartoon-ghost"
              } text-xs py-1.5 px-3`}
            >
              <Palette className="w-3.5 h-3.5" />
              Filter Kamera {selectedFilter !== "none" ? `• ${currentFilter?.name}` : ""}
            </button>

            {/* Auto Continuous Burst Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#5e4777] hidden sm:inline">
                Auto-Jepret Beruntun:
              </label>
              <button
                onClick={() => {
                  playClick();
                  setAutoSequenceEnabled(!autoSequenceEnabled);
                }}
                className={`px-3 py-1 rounded-full text-xs font-extrabold border-2 transition-all cursor-pointer ${
                  autoSequenceEnabled
                    ? "bg-[#764ba2] text-white border-[#2d1b4e]"
                    : "bg-gray-100 text-gray-500 border-gray-300"
                }`}
              >
                {autoSequenceEnabled ? "ON (Auto)" : "OFF (Manual)"}
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          {showFilters && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-2 -mx-1 px-1">
              {PHOTO_FILTERS.map((flt) => (
                <button
                  key={flt.id}
                  onClick={() => {
                    playClick();
                    setSelectedFilter(flt.id);
                  }}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold border-2 transition-all cursor-pointer ${
                    selectedFilter === flt.id
                      ? "border-[#ff4d6d] bg-[#ffe5ec] text-[#ff4d6d]"
                      : "border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {flt.name}
                </button>
              ))}
            </div>
          )}

          {/* Center Trigger Shutter Button */}
          <div className="flex items-center justify-center gap-4">
            {/* Shutter Button */}
            <button
              onClick={triggerCapture}
              disabled={!isReady || isRunning || isFinished}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 border-[#2d1b4e] bg-gradient-to-tr from-[#ff4d6d] to-[#ff758c] shadow-[0_6px_0_#2d1b4e] flex items-center justify-center transition-all hover:shadow-[0_8px_0_#2d1b4e] hover:translate-y-[-2px] active:shadow-[0_2px_0_#2d1b4e] active:translate-y-[3px] disabled:opacity-40 cursor-pointer group"
              title="Ambil Foto Sekarang"
            >
              <Camera className="w-8 h-8 sm:w-9 sm:h-9 text-white drop-shadow group-hover:scale-110 transition-transform" />
            </button>

            {/* If finished: quick manual button to proceed */}
            {capturedPhotos.length >= totalRequired && (
              <button
                onClick={() => {
                  playClick();
                  initializeSlotsWithCaptured();
                  setBoothStep("studio");
                }}
                className="btn-cartoon btn-cartoon-sm btn-cartoon-primary animate-bounce-in"
              >
                <CheckCircle className="w-4 h-4" />
                Lanjut ke Frame →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
