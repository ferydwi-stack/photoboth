"use client";

import { useState } from "react";
import { usePhotoboothStore, SavedPhotoStrip } from "@/store/photobooth-store";
import { playClick } from "@/lib/sounds";
import { useToastStore } from "@/components/Toast";
import {
  Images,
  Download,
  Trash2,
  Camera,
  X,
  Printer,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function GalleryScreen() {
  const { savedGalleries, removeFromGallery, startBoothSession } =
    usePhotoboothStore();
  const addToast = useToastStore((s) => s.addToast);
  const [activeStrip, setActiveStrip] = useState<SavedPhotoStrip | null>(null);

  const handleDelete = (id: string) => {
    playClick();
    removeFromGallery(id);
    if (activeStrip?.id === id) setActiveStrip(null);
    addToast("Foto strip dihapus dari galeri", "info");
  };

  const handleDownload = (strip: SavedPhotoStrip) => {
    playClick();
    const a = document.createElement("a");
    a.download = `kikobooth_${strip.id}.png`;
    a.href = strip.url;
    a.click();
    addToast("Foto berhasil diunduh!", "success");
  };

  const handlePrint = () => {
    playClick();
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b-2 border-[#2d1b4e]/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff4d6d]/15 text-[#ff4d6d] text-xs font-black uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Hall of Fame
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#2d1b4e] tracking-tight">
            Galeri Strip Foto Kamu
          </h1>
          <p className="text-sm font-semibold text-[#8b6cb0] mt-1">
            Koleksi hasil cetak photobooth yang tersimpan di browser laptop ini ({savedGalleries.length} Foto).
          </p>
        </div>

        <button
          onClick={() => {
            playClick();
            startBoothSession(6);
          }}
          className="btn-cartoon btn-cartoon-primary text-sm px-6 py-3 self-start sm:self-auto"
        >
          <Camera className="w-4 h-4" /> Mulai Foto Baru
        </button>
      </div>

      {/* Gallery Content */}
      {savedGalleries.length === 0 ? (
        /* Empty State */
        <div className="card-cartoon p-12 text-center max-w-md mx-auto my-12 bg-white flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#ff9a9e] to-[#fecfef] border-3 border-[#2d1b4e] shadow-[0_6px_0_#2d1b4e] flex items-center justify-center mb-5 animate-wiggle">
            <Images className="w-10 h-10 text-[#764ba2]" />
          </div>
          <h3 className="text-2xl font-black text-[#2d1b4e]">Galeri Masih Kosong!</h3>
          <p className="text-xs sm:text-sm font-semibold text-[#5e4777] mt-2 mb-6">
            Kamu belum punya strip photobooth tersimpan. Ambil foto pertama kamu sekarang dan
            dekorasi dengan frame serta stiker favorit!
          </p>
          <button
            onClick={() => {
              playClick();
              startBoothSession(6);
            }}
            className="btn-cartoon btn-cartoon-primary w-full py-3.5 text-base"
          >
            <Camera className="w-5 h-5" /> Mulai Photobooth
          </button>
        </div>
      ) : (
        /* Strips Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {savedGalleries.map((strip) => (
            <div
              key={strip.id}
              onClick={() => {
                playClick();
                setActiveStrip(strip);
              }}
              className="group card-cartoon p-3 bg-white flex flex-col items-center cursor-pointer hover:scale-[1.03] transition-all"
            >
              {/* Strip Image Container */}
              <div className="w-full rounded-xl overflow-hidden border-2 border-[#2d1b4e]/20 shadow-inner bg-gray-50 aspect-[1/2.8] relative mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={strip.url}
                  alt="Saved Strip"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3 py-1 rounded-full bg-white text-[#2d1b4e] text-xs font-black shadow">
                    Lihat Detail
                  </span>
                </div>
              </div>

              {/* Strip Meta */}
              <div className="w-full text-center">
                <span className="text-xs font-black text-[#2d1b4e] block line-clamp-1">
                  {strip.frameName || "4-Cut Strip"}
                </span>
                <span className="text-[10px] font-bold text-[#8b6cb0] flex items-center justify-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" /> {strip.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {activeStrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-bounce-in">
          <div className="card-cartoon max-w-lg w-full p-6 bg-white relative max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setActiveStrip(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-black text-[#2d1b4e] mb-1">
              {activeStrip.frameName || "Photobooth Strip"}
            </h3>
            <span className="text-xs font-bold text-[#8b6cb0] mb-4">{activeStrip.date}</span>

            {/* Strip Display */}
            <div className="flex-1 overflow-y-auto max-h-[58vh] rounded-2xl border-4 border-[#2d1b4e] shadow-lg mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeStrip.url}
                alt="Full Strip"
                className="max-h-[55vh] w-auto object-contain"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => handleDownload(activeStrip)}
                className="btn-cartoon btn-cartoon-primary flex-1 text-xs sm:text-sm py-2.5"
              >
                <Download className="w-4 h-4" /> Unduh HD
              </button>

              <button
                onClick={handlePrint}
                className="btn-cartoon btn-cartoon-ghost text-xs sm:text-sm py-2.5 px-4"
              >
                <Printer className="w-4 h-4 text-[#764ba2]" /> Cetak
              </button>

              <button
                onClick={() => handleDelete(activeStrip.id)}
                className="btn-cartoon btn-cartoon-ghost text-xs sm:text-sm py-2.5 px-3 text-red-500 hover:bg-red-50"
                title="Hapus dari Galeri"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
