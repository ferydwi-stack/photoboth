"use client";

import { usePhotoboothStore } from "@/store/photobooth-store";
import Navbar from "@/components/Navbar";
import LandingScreen from "@/components/LandingScreen";
import CameraScreen from "@/components/CameraScreen";
import StudioScreen from "@/components/StudioScreen";
import PreviewScreen from "@/components/PreviewScreen";
import GalleryScreen from "@/components/GalleryScreen";
import FramesCatalogScreen from "@/components/FramesCatalogScreen";
import GuideScreen from "@/components/GuideScreen";

export default function PhotoboothApp() {
  const { activePage, boothStep } = usePhotoboothStore();

  // If inside the active photoshoot camera mode, make it fully immersive without standard navbar
  if (activePage === "booth" && boothStep === "camera") {
    return <CameraScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#ff9a9e] selection:text-[#2d1b4e]">
      {/* Universal Top Header Navigation */}
      <Navbar />

      {/* Main Screen Renderer based on active page & booth step */}
      <main className="flex-1 flex flex-col">
        {activePage === "home" && <LandingScreen />}
        {activePage === "gallery" && <GalleryScreen />}
        {activePage === "frames" && <FramesCatalogScreen />}
        {activePage === "guide" && <GuideScreen />}

        {activePage === "booth" && (
          <>
            {boothStep === "studio" && <StudioScreen />}
            {boothStep === "preview" && <PreviewScreen />}
          </>
        )}
      </main>

      {/* Aesthetic Footer on non-studio pages */}
      {activePage !== "booth" && (
        <footer className="border-t-2 border-[#2d1b4e]/10 bg-white/70 py-6 text-center text-xs font-bold text-[#8b6cb0]">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>© {new Date().getFullYear()} KikoBooth • Korean 4-Cut Life4Cuts Web Studio</span>
            <span>Dibuat dengan cinta untuk mengabadikan setiap senyuman ✨</span>
          </div>
        </footer>
      )}
    </div>
  );
}
