"use client";

import { useState } from "react";
import { usePhotoboothStore } from "@/store/photobooth-store";
import { FRAMES } from "@/lib/frames";
import { playClick } from "@/lib/sounds";
import {
  Camera,
  Sparkles,
  Smile,
  ArrowRight,
  Palette,
  HelpCircle,
  Heart,
} from "lucide-react";

export default function LandingScreen() {
  const { startBoothSession, setActivePage, setSelectedFrame } = usePhotoboothStore();
  const [showModal, setShowModal] = useState(false);

  const handleStart = (shots: 6 | 10) => {
    playClick();
    setShowModal(false);
    startBoothSession(shots);
  };

  const handlePickFrameAndStart = (frame: (typeof FRAMES)[0]) => {
    playClick();
    setSelectedFrame(frame);
    setShowModal(true);
  };

  return (
    <div className="relative overflow-hidden min-h-screen pb-20">
      {/* Dynamic Animated Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#ff9a9e]/30 blur-3xl animate-float" />
        <div
          className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-[#a18cd1]/30 blur-3xl animate-float"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute bottom-20 left-1/4 w-80 h-80 rounded-full bg-[#fecfef]/30 blur-3xl animate-float"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-14 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Copywriting & CTA */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/95 border-2 border-[#2d1b4e]/15 shadow-sm mb-4 sm:mb-6 animate-bounce-in">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#ff4d6d] animate-ping" />
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#764ba2]">
                ✨ Korean 4-Cut Life4Cuts Studio
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-[#2d1b4e] leading-[1.12] sm:leading-[1.08] tracking-tight mb-4 sm:mb-6">
              Abadikan Momen <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d6d] via-[#a18cd1] to-[#667eea]">
                Estetik & Berwarna
              </span>{" "}
              di KikoBooth!
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-lg font-bold text-[#5e4777] leading-relaxed max-w-2xl mb-6 sm:mb-8">
              Photobooth web ala Korea di smartphone & laptopmu tanpa alat tambahan. Pilih{" "}
              <strong className="text-[#ff4d6d]">6 atau 10 kali pose</strong>, atur foto ke dalam
              frame strip 4-cut tanpa distorsi, tambahkan stiker & emotikon lucu, lalu cetak atau
              unduh instan!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto mb-6 sm:mb-10">
              <button
                onClick={() => {
                  playClick();
                  setShowModal(true);
                }}
                className="btn-cartoon btn-cartoon-primary text-base sm:text-xl px-6 sm:px-8 py-3.5 sm:py-4.5 w-full sm:w-auto shadow-[0_5px_0_#2d1b4e] sm:shadow-[0_8px_0_#2d1b4e] hover:shadow-[0_10px_0_#2d1b4e] justify-center"
              >
                <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                Mulai Photobooth Sekarang
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
              </button>

              <button
                onClick={() => {
                  playClick();
                  setActivePage("frames");
                }}
                className="btn-cartoon btn-cartoon-ghost text-sm sm:text-base px-5 sm:px-6 py-3 sm:py-4 w-full sm:w-auto shadow-[0_4px_0_#2d1b4e] sm:shadow-[0_5px_0_#2d1b4e] justify-center"
              >
                <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-[#764ba2]" />
                Lihat Koleksi Frame ({FRAMES.length}+)
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-lg border-t-2 border-[#2d1b4e]/10 pt-4 sm:pt-6">
              <div>
                <div className="text-xl sm:text-3xl font-black text-[#764ba2]">6 & 10x</div>
                <div className="text-[11px] sm:text-xs font-bold text-[#8b6cb0]">Pilihan Shoot</div>
              </div>
              <div>
                <div className="text-xl sm:text-3xl font-black text-[#ff4d6d]">4-Cut</div>
                <div className="text-[11px] sm:text-xs font-bold text-[#8b6cb0]">Fixed Proportions</div>
              </div>
              <div>
                <div className="text-xl sm:text-3xl font-black text-[#2d1b4e]">100%</div>
                <div className="text-[11px] sm:text-xs font-bold text-[#8b6cb0]">Free Web App</div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Tilted Photobooth Strips Mockup */}
          <div className="lg:col-span-5 relative flex justify-center items-center py-4 sm:py-6">
            {/* Background Glow */}
            <div className="absolute w-72 h-96 bg-gradient-to-tr from-[#ff9a9e] to-[#764ba2] rounded-3xl opacity-20 blur-2xl transform rotate-6" />

            {/* Simulated Photobooth Strip 1 (Primary Tilted) */}
            <div className="relative z-20 w-64 rounded-2xl bg-white border-4 border-[#2d1b4e] shadow-[0_16px_0_#2d1b4e] p-3 transform -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300">
              {/* Cute Badge */}
              <div className="absolute -top-3.5 -right-3 px-3 py-1 bg-[#ff4d6d] text-white text-[11px] font-black uppercase rounded-full border-2 border-[#2d1b4e] shadow-[0_3px_0_#2d1b4e] rotate-6 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Life4Cuts
              </div>

              {/* 4 Strip Photo Mockups */}
              <div className="flex flex-col gap-2">
                {[
                  { bg: "from-pink-300 to-rose-400", sticker: "💖" },
                  { bg: "from-indigo-300 to-purple-400", sticker: "✌️" },
                  { bg: "from-amber-200 to-orange-300", sticker: "✨" },
                  { bg: "from-teal-200 to-emerald-300", sticker: "🥰" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`h-24 rounded-xl bg-gradient-to-br ${item.bg} border-2 border-[#2d1b4e]/20 flex items-center justify-center relative overflow-hidden group shadow-inner`}
                  >
                    <span className="text-3xl filter drop-shadow animate-bounce-in">
                      {item.sticker}
                    </span>
                    <div className="absolute bottom-1 right-1.5 text-[9px] font-black text-black/40">
                      0{idx + 1}
                    </div>
                  </div>
                ))}
              </div>

              {/* Strip Footer Stamp */}
              <div className="mt-3 pt-2 text-center border-t-2 border-[#2d1b4e]/15">
                <div className="text-xs font-black tracking-widest text-[#2d1b4e] uppercase">
                  KikoBooth Seoul
                </div>
                <div className="text-[9px] font-bold text-[#8b6cb0]">Photo Strip • 4-Cut Studio</div>
              </div>
            </div>

            {/* Simulated Second Strip (Background Accent) */}
            <div className="absolute z-10 w-60 rounded-2xl bg-[#ffccd5] border-3 border-[#2d1b4e] shadow-[0_12px_0_#2d1b4e] p-2.5 transform rotate-6 translate-x-14 translate-y-6 opacity-85 hidden sm:block">
              <div className="flex flex-col gap-1.5">
                <div className="h-20 rounded-lg bg-white/70 border border-[#2d1b4e]/20 flex items-center justify-center text-xl">
                  🌸
                </div>
                <div className="h-20 rounded-lg bg-white/70 border border-[#2d1b4e]/20 flex items-center justify-center text-xl">
                  🎀
                </div>
                <div className="h-20 rounded-lg bg-white/70 border border-[#2d1b4e]/20 flex items-center justify-center text-xl">
                  ✨
                </div>
                <div className="h-20 rounded-lg bg-white/70 border border-[#2d1b4e]/20 flex items-center justify-center text-xl">
                  👑
                </div>
              </div>
              <div className="mt-2 text-center text-[9px] font-black text-[#2d1b4e]">
                BESTIES 4-CUT
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-[#2d1b4e] tracking-tight">
            Fitur Photobooth Serba Lengkap
          </h2>
          <p className="text-base font-bold text-[#8b6cb0] mt-2">
            Pengalaman photobooth digital terbaik dengan teknologi browser terkini.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Camera className="w-8 h-8 text-[#ff4d6d]" />,
              title: "6x & 10x Shoot",
              desc: "Pilih 6 kali atau 10 kali pose beruntun. Tidak perlu buru-buru, semua pose tersimpan aman di baki foto!",
              bg: "bg-[#fff0f3]",
            },
            {
              icon: <Palette className="w-8 h-8 text-[#764ba2]" />,
              title: "Slot Strip Konsisten",
              desc: "Bentuk frame dan ukuran slot foto terkunci presisi! Foto tidak akan melar atau distorsi saat diganti.",
              bg: "bg-[#f3e8ff]",
            },
            {
              icon: <Smile className="w-8 h-8 text-[#f59e0b]" />,
              title: "Drag & Drop Foto",
              desc: "Bebas pindahkan foto jepretan mana saja ke dalam slot 1–4, tukar posisi, atau hapus sesukamu.",
              bg: "bg-[#fef3c7]",
            },
            {
              icon: <Sparkles className="w-8 h-8 text-[#0284c7]" />,
              title: "Stiker & Emoticon Lucu",
              desc: "Tambahkan stiker Y2K, ekspresi emoji, kacamata, bando, dan stempel teks yang bisa digeser & dirotasi.",
              bg: "bg-[#e0f2fe]",
            },
          ].map((feat, i) => (
            <div
              key={i}
              className="card-cartoon p-6 flex flex-col items-start text-left hover:scale-[1.02] transition-transform"
            >
              <div className={`p-3.5 rounded-2xl ${feat.bg} border-2 border-[#2d1b4e] mb-4`}>
                {feat.icon}
              </div>
              <h3 className="text-xl font-black text-[#2d1b4e] mb-2">{feat.title}</h3>
              <p className="text-xs sm:text-sm font-semibold text-[#5e4777] leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Frame Lookbook Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card-cartoon p-6 sm:p-10 bg-white/90">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#ff4d6d]">
                ✨ Koleksi Pilihan
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2d1b4e] mt-1">
                Katalog Template Frame Populer
              </h2>
            </div>
            <button
              onClick={() => {
                playClick();
                setActivePage("frames");
              }}
              className="btn-cartoon btn-cartoon-sm btn-cartoon-ghost text-xs font-bold self-start sm:self-auto"
            >
              Lihat Semua Frame →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {FRAMES.slice(0, 6).map((fr) => {
              const bg = fr.solidColor
                ? fr.solidColor
                : `linear-gradient(135deg, ${fr.cornerColors.tl}, ${fr.cornerColors.tr}, ${fr.cornerColors.bl}, ${fr.cornerColors.br})`;
              return (
                <div
                  key={fr.id}
                  onClick={() => handlePickFrameAndStart(fr)}
                  className="group card-cartoon-sm p-3 flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-all bg-white"
                >
                  <div
                    className="w-full h-32 rounded-xl border-2 border-[#2d1b4e] shadow-sm flex flex-col items-center justify-between p-2 mb-2 group-hover:shadow-[0_4px_0_#2d1b4e] transition-all"
                    style={{ background: bg }}
                  >
                    <div className="w-full h-4 bg-white/40 rounded-sm" />
                    <span className="text-2xl">{fr.emoji}</span>
                    <div className="w-full h-4 bg-white/40 rounded-sm" />
                  </div>
                  <span className="text-xs font-black text-[#2d1b4e] line-clamp-1">{fr.name}</span>
                  <span className="text-[10px] font-bold text-[#8b6cb0] mt-0.5">
                    {fr.tagline || "Life4Cuts"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Pose & Tips Section Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl border-3 border-[#2d1b4e] bg-gradient-to-r from-[#ffe5ec] via-[#f3e8ff] to-[#e0f2fe] p-6 sm:p-10 shadow-[0_10px_0_#2d1b4e] flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-white/80 border border-[#2d1b4e]/20 text-[#764ba2] inline-block mb-2">
              💡 Butuh Inspirasi Pose?
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#2d1b4e]">
              Lihat Panduan Pose 4-Cut Seru Bersama Sahabat!
            </h3>
            <p className="text-sm font-semibold text-[#5e4777] mt-2">
              Bingung mau gaya apa saat countdown berbunyi? Buka halaman panduan kami untuk melihat
              koleksi pose Heart, V-Sign, Silly Faces, dan tips lighting webcam terbaik.
            </p>
          </div>
          <button
            onClick={() => {
              playClick();
              setActivePage("guide");
            }}
            className="btn-cartoon btn-cartoon-warm px-6 py-3.5 text-base flex-shrink-0 whitespace-nowrap shadow-[0_6px_0_#2d1b4e]"
          >
            <HelpCircle className="w-5 h-5" />
            Buka Panduan Pose
          </button>
        </div>
      </section>

      {/* Start Shoot Modal / Mobile Bottom Sheet */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card-cartoon max-w-lg w-full p-5 sm:p-7 bg-white relative rounded-t-3xl sm:rounded-3xl shadow-2xl border-t-4 sm:border-3 border-[#2d1b4e] max-h-[92dvh] overflow-y-auto">
            {/* Mobile Drag Indicator Bar */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 sm:hidden" />

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
                    Cepat & santai! Ambil 6 foto lalu pilih foto terbaik untuk masuk frame strip.
                  </p>
                </div>
                <div className="mt-3 sm:mt-4 flex items-center gap-1 text-xs font-black text-[#764ba2] group-hover:translate-x-1 transition-transform">
                  Mulai 6 Take →
                </div>
              </button>

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
                    Puas bergaya! Ambil 10 pose beragam untuk hasil paling aesthetic & seru.
                  </p>
                </div>
                <div className="mt-3 sm:mt-4 flex items-center gap-1 text-xs font-black text-[#e11d48] group-hover:translate-x-1 transition-transform">
                  Mulai 10 Take →
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-100 cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
