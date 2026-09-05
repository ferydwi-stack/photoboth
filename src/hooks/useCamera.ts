"use client";

import { useRef, useCallback, useState, useEffect } from "react";

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  capturePhoto: (mirror?: boolean) => string | null;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      // Check basic support
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Browser tidak mendukung kamera. Gunakan Chrome atau Safari terbaru."
        );
      }

      // Check HTTPS (required on mobile)
      if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
        throw new Error(
          "Kamera hanya bisa diakses lewat HTTPS. Buka lewat link https://... bukan http://..."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      // Wait for the video element to be available
      // On first render the element may not yet be in the DOM
      const waitForVideo = (): Promise<HTMLVideoElement> => {
        return new Promise((resolve, reject) => {
          let attempts = 0;
          const check = () => {
            if (videoRef.current) {
              resolve(videoRef.current);
            } else if (attempts++ > 50) {
              reject(new Error("Video element tidak ditemukan."));
            } else {
              requestAnimationFrame(check);
            }
          };
          check();
        });
      };

      const video = await waitForVideo();
      video.srcObject = stream;
      
      // Wait for video to actually start playing
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play()
            .then(() => resolve())
            .catch(reject);
        };
        // Fallback timeout
        setTimeout(() => {
          if (video.readyState >= 2) resolve();
          else reject(new Error("Kamera timeout. Coba refresh halaman."));
        }, 10000);
      });

      setIsReady(true);
    } catch (err) {
      // Stop any partially acquired stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const errObj = err instanceof Error ? err : new Error("Gagal mengakses kamera.");
      const name = (err as DOMException)?.name || "";
      const message = errObj.message;

      if (name === "NotAllowedError" || name === "PermissionDeniedError" || message.includes("denied")) {
        setError(
          "Izin kamera ditolak. Buka Settings browser > Site Settings > Camera > Allow, lalu refresh."
        );
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError" || message.includes("not found")) {
        setError("Kamera tidak ditemukan. Pastikan perangkat memiliki kamera.");
      } else if (name === "NotReadableError" || name === "TrackStartError") {
        setError("Kamera sedang digunakan aplikasi lain. Tutup app kamera lalu coba lagi.");
      } else if (name === "OverconstrainedError") {
        // Retry with simpler constraints
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          streamRef.current = fallbackStream;
          const video = videoRef.current;
          if (video) {
            video.srcObject = fallbackStream;
            await video.play();
            setIsReady(true);
            return; // success on retry
          }
        } catch {
          setError("Kamera tidak kompatibel. Coba browser lain.");
        }
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const capturePhoto = useCallback((mirror: boolean = true): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    if (mirror) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    return canvas.toDataURL("image/jpeg", 0.92);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    isReady,
    isLoading,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
  };
}
