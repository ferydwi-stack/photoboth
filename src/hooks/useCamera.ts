"use client";

import { useRef, useCallback, useState, useEffect } from "react";

export interface CameraDevice {
  deviceId: string;
  label: string;
  isFront?: boolean;
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  availableCameras: CameraDevice[];
  selectedDeviceId: string | null;
  setSelectedDeviceId: (id: string) => void;
  switchCamera: () => void;
  startCamera: (specificDeviceId?: string) => Promise<void>;
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
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceIdState] = useState<string | null>(null);

  // Stop current active video tracks
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsReady(false);
  }, []);

  // Enumerate all available camera devices
  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return [];
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");

      const cameraList: CameraDevice[] = videoDevices.map((d, index) => {
        let label = d.label || `Kamera ${index + 1}`;
        const lower = label.toLowerCase();
        const isFront =
          lower.includes("front") ||
          lower.includes("user") ||
          lower.includes("depan") ||
          lower.includes("facetime") ||
          lower.includes("integrated");

        // Format nice human-friendly labels
        if (lower.includes("integrated") || lower.includes("internal") || lower.includes("webcam")) {
          label = `💻 Kamera Laptop (${label.split("(")[0].trim()})`;
        } else if (lower.includes("droidcam") || lower.includes("phone") || lower.includes("iriun") || lower.includes("virtual")) {
          label = `📱 Kamera HP (${label.split("(")[0].trim()})`;
        } else if (isFront) {
          label = `🤳 Kamera Depan (${label})`;
        } else if (lower.includes("back") || lower.includes("belakang") || lower.includes("rear")) {
          label = `📷 Kamera Belakang (${label})`;
        }

        return {
          deviceId: d.deviceId,
          label,
          isFront,
        };
      });

      setAvailableCameras(cameraList);
      return cameraList;
    } catch {
      return [];
    }
  }, []);

  // Start Camera with support for specific deviceId or facingMode
  const startCamera = useCallback(
    async (specificDeviceId?: string) => {
      setError(null);
      setIsLoading(true);
      stopCamera();

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Browser tidak mendukung kamera. Gunakan Chrome atau Safari terbaru.");
        }

        // Build constraints
        const videoConstraints: MediaTrackConstraints = {
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        };

        const targetId = specificDeviceId || selectedDeviceId;

        if (targetId) {
          videoConstraints.deviceId = { exact: targetId };
        } else {
          // Default: try user/front camera
          videoConstraints.facingMode = "user";
        }

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: false,
          });
        } catch {
          // Fallback with basic video constraint if exact deviceId or high resolution failed
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        streamRef.current = stream;

        // Obtain active deviceId from stream tracks
        const activeTrack = stream.getVideoTracks()[0];
        if (activeTrack) {
          const settings = activeTrack.getSettings();
          if (settings.deviceId) {
            setSelectedDeviceIdState(settings.deviceId);
          }
        }

        // Refresh enumerated camera list after permission is granted
        await refreshDevices();

        // Bind stream to video element
        const waitForVideo = (): Promise<HTMLVideoElement> => {
          return new Promise((resolve, reject) => {
            let attempts = 0;
            const check = () => {
              if (videoRef.current) {
                resolve(videoRef.current);
              } else if (attempts++ > 60) {
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

        // Ensure proper attributes for iOS Safari & Android Chrome
        video.setAttribute("playsinline", "true");
        video.setAttribute("webkit-playsinline", "true");
        video.muted = true;

        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => {
            video
              .play()
              .then(() => resolve())
              .catch(reject);
          };
          setTimeout(() => {
            if (video.readyState >= 2) resolve();
            else reject(new Error("Kamera timeout. Silakan refresh halaman."));
          }, 8000);
        });

        setIsReady(true);
      } catch (err) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        const errObj = err instanceof Error ? err : new Error("Gagal mengakses kamera.");
        const name = (err as DOMException)?.name || "";
        const message = errObj.message;

        if (name === "NotAllowedError" || name === "PermissionDeniedError" || message.includes("denied")) {
          setError(
            "Izin kamera ditolak. Buka Settings browser > Site Settings > Camera > Izinkan (Allow), lalu refresh halaman."
          );
        } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
          setError("Kamera tidak terdeteksi. Pastikan webcam atau kamera perangkat Anda terpasang.");
        } else if (name === "NotReadableError" || name === "TrackStartError") {
          setError("Kamera sedang digunakan oleh aplikasi lain (seperti Zoom/Meet). Tutup aplikasi lain lalu coba lagi.");
        } else {
          setError(message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDeviceId, stopCamera, refreshDevices]
  );

  // Switch to a specific deviceId
  const setSelectedDeviceId = useCallback(
    (deviceId: string) => {
      setSelectedDeviceIdState(deviceId);
      startCamera(deviceId);
    },
    [startCamera]
  );

  // Quick switch camera (cycles through available cameras, useful for mobile front/back or laptop/phone)
  const switchCamera = useCallback(() => {
    if (availableCameras.length <= 1) return;
    const currentIndex = availableCameras.findIndex((c) => c.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextDevice = availableCameras[nextIndex];
    if (nextDevice) {
      setSelectedDeviceId(nextDevice.deviceId);
    }
  }, [availableCameras, selectedDeviceId, setSelectedDeviceId]);

  // Capture High-Res Snapshot from video
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

    return canvas.toDataURL("image/jpeg", 0.95);
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
    availableCameras,
    selectedDeviceId,
    setSelectedDeviceId,
    switchCamera,
    startCamera,
    stopCamera,
    capturePhoto,
  };
}
