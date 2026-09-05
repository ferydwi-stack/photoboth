"use client";

import { usePhotoboothStore } from "@/store/photobooth-store";
import LandingScreen from "@/components/LandingScreen";
import CameraScreen from "@/components/CameraScreen";
import FrameSelectScreen from "@/components/FrameSelectScreen";
import EditorScreen from "@/components/EditorScreen";
import PreviewScreen from "@/components/PreviewScreen";

export default function PhotoboothApp() {
  const { step } = usePhotoboothStore();

  switch (step) {
    case "landing":
      return <LandingScreen />;
    case "camera":
      return <CameraScreen />;
    case "frame-select":
      return <FrameSelectScreen />;
    case "editor":
      return <EditorScreen />;
    case "preview":
      return <PreviewScreen />;
    default:
      return <LandingScreen />;
  }
}
