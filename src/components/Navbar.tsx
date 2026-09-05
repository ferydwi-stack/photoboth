"use client";

import { useState } from "react";
import { usePhotoboothStore, AppPage } from "@/store/photobooth-store";
import { playClick } from "@/lib/sounds";
import {
  Camera,
  Sparkles,
  Images,
  Grid,
  HelpCircle,
  Volume2,
  VolumeX,
  Menu,
  X,
  Heart,
} from "lucide-react";

export default function Navbar() {
  const {
    activePage,
    setActivePage,
    soundEnabled,
    setSoundEnabled,
    startBoothSession,
    savedGalleries,
  } = usePhotoboothStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);

  const handleNav = (page: AppPage) => {
    playClick();
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  const handleStart = (shots: 6 | 10) => {
    playClick();
    setShowStartModal(false);
    startBoothSession(shots);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b-2 border-[#2d1b4e]/10 shadow-[0_2px_15px_rgba(45,27,78,0.05)] transition-all">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-15 sm:h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => handleNav("home")}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group text-left"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#ff6b9d] via-[#a18cd1] to-[#667eea] p-[2px] sm:p-[2.5px] shadow-[0_3px_10px_rgba(255,107,157,0.35)] group-hover:rotate-6 transition-transform flex-shrink-0">
              <div className="w-full h-full bg-[#1e1333] rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
                <Camera className="w-4 h-4 sm:w-6 sm:h-6 text-[#fecfef]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#2d1b4e] font-sans">
                  Kiko<span className="text-[#ff6b9d]">Booth</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-full bg-[#ff9a9e]/20 text-[#d81159] border border-[#ff9a9e]/40">
                  4-Cut
                </span>
              </div>
              <p className="hidden sm:block text-[11px] font-bold text-[#8b6cb0] -mt-0.5">
                Korean Life4Cuts Studio
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {[
              { id: "home", label: "Beranda", icon: <Sparkles className="w-4 h-4" /> },
              { id: "frames", label: "Koleksi Frame", icon: <Grid className="w-4 h-4" /> },
              {
                id: "gallery",
                label: `Galeri ${savedGalleries.length > 0 ? `(${savedGalleries.length})` : ""}`,
                icon: <Images className="w-4 h-4" />,
              },
              { id: "guide", label: "Ide Pose & Tips", icon: <HelpCircle className="w-4 h-4" /> },
            ].map((tab) => {
              const isActive = activePage === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNav(tab.id as AppPage)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#764ba2] text-white shadow-[0_4px_12px_rgba(118,75,162,0.35)] translate-y-[-1px]"
                      : "text-[#5e4777] hover:text-[#2d1b4e] hover:bg-[#f3ebfa]"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                playClick();
                setSoundEnabled(!soundEnabled);
              }}
              className={`p-2 sm:p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                soundEnabled
                  ? "border-[#764ba2]/30 bg-white text-[#764ba2] hover:bg-[#f5eeff]"
                  : "border-gray-200 bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
              title={soundEnabled ? "Suara Aktif" : "Suara Senyap"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Start Photobooth CTA (Desktop only to prevent cramming mobile header) */}
            <button
              onClick={() => {
                playClick();
                setShowStartModal(true);
              }}
              className="btn-cartoon btn-cartoon-sm btn-cartoon-primary hidden md:inline-flex px-4 py-2 text-sm shadow-[0_4px_0_#2d1b4e]"
            >
              <Camera className="w-4 h-4" />
              Mulai Foto
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border-2 border-[#2d1b4e]/20 text-[#2d1b4e] md:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-[#2d1b4e]/10 bg-white/95 px-4 pt-3 pb-6 flex flex-col gap-2 animate-bounce-in shadow-xl">
            {[
              { id: "home", label: "Beranda", icon: <Sparkles className="w-4 h-4" /> },
              { id: "frames", label: "Koleksi Frame", icon: <Grid className="w-4 h-4" /> },
              {
                id: "gallery",
                label: `Galeri Tersimpan (${savedGalleries.length})`,
                icon: <Images className="w-4 h-4" />,
              },
              { id: "guide", label: "Ide Pose & Tips", icon: <HelpCircle className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleNav(tab.id as AppPage)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-left ${
                  activePage === tab.id
                    ? "bg-[#764ba2] text-white"
                    : "text-[#2d1b4e] hover:bg-[#f3ebfa]"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}

            <button
              onClick={() => {
                playClick();
                setMobileMenuOpen(false);
                setShowStartModal(true);
              }}
              className="btn-cartoon btn-cartoon-primary w-full mt-2 py-3.5 text-base"
            >
              <Camera className="w-5 h-5" />
              Mulai Photobooth
            </button>
          </div>
        )}
      </header>

      {/* Start Shoot Modal / Mobile Bottom Sheet */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card-cartoon max-w-lg w-full p-5 sm:p-7 bg-white relative rounded-t-3xl sm:rounded-3xl shadow-2xl border-t-4 sm:border-3 border-[#2d1b4e] max-h-[92dvh] overflow-y-auto">
            {/* Mobile Drag Indicator Bar */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 sm:hidden" />

            <button
              onClick={() => setShowStartModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#ff9a9e] to-[#764ba2] text-white flex items-center justify-center mx-auto mb-2.5 shadow-[0_4px_0_#2d1b4e] sm:shadow-[0_6px_0_#2d1b4e]">
                <Camera className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#2d1b4e]">Pilih Mode Shoot</h3>
              <p className="text-xs sm:text-sm font-bold text-[#8b6cb0] mt-0.5">
                Berapa kali Anda ingin berpose di depan kamera?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* 6 Shots Option */}
              <button
                onClick={() => handleStart(6)}
                className="group p-4 sm:p-5 rounded-2xl border-3 border-[#2d1b4e] bg-gradient-to-br from-[#faf5ff] to-[#f3e8ff] hover:from-[#f0e6ff] hover:to-[#e9d5ff] shadow-[0_4px_0_#2d1b4e] sm:shadow-[0_6px_0_#2d1b4e] active:translate-y-[2px] transition-all text-left cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-2xl sm:text-3xl font-black text-[#764ba2]">6x Take</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-[#764ba2] text-white">
                      Fast
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-[#2d1b4e]">6 Kali Foto</h4>
                  <p className="text-xs font-semibold text-[#8b6cb0] mt-1 leading-snug">
                    Cepat & seru! Ambil 6 foto lalu pilih foto terbaik untuk frame strip.
                  </p>
                </div>
                <div className="mt-3 sm:mt-4 flex items-center gap-1 text-xs font-black text-[#764ba2] group-hover:translate-x-1 transition-transform">
                  Mulai 6 Take →
                </div>
              </button>

              {/* 10 Shots Option */}
              <button
                onClick={() => handleStart(10)}
                className="group p-4 sm:p-5 rounded-2xl border-3 border-[#2d1b4e] bg-gradient-to-br from-[#fff1f2] to-[#ffe4e6] hover:from-[#ffe4e6] hover:to-[#fecdd3] shadow-[0_4px_0_#2d1b4e] sm:shadow-[0_6px_0_#2d1b4e] active:translate-y-[2px] transition-all text-left cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-2xl sm:text-3xl font-black text-[#e11d48]">10x Take</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-[#e11d48] text-white flex items-center gap-1">
                      <Heart className="w-2.5 h-2.5" /> Favorite
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-[#2d1b4e]">10 Kali Foto</h4>
                  <p className="text-xs font-semibold text-[#be123c] mt-1 leading-snug">
                    Lebih puas! Coba 10 pose beragam untuk hasil paling aesthetic & bebas.
                  </p>
                </div>
                <div className="mt-3 sm:mt-4 flex items-center gap-1 text-xs font-black text-[#e11d48] group-hover:translate-x-1 transition-transform">
                  Mulai 10 Take →
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowStartModal(false)}
              className="w-full py-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-100 cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </>
  );
}
