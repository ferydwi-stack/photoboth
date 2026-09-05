"use client";

import { usePhotoboothStore } from "@/store/photobooth-store";
import { playClick } from "@/lib/sounds";
import {
  Sparkles,
  Smile,
  Printer,
  Sun,
} from "lucide-react";

export default function GuideScreen() {
  const { startBoothSession } = usePhotoboothStore();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen pb-24">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff4d6d]/15 text-[#ff4d6d] text-xs font-black uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Pose & Tips Guide
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#2d1b4e] tracking-tight">
          Inspirasi Pose 4-Cut & Tips Foto
        </h1>
        <p className="text-sm sm:text-base font-bold text-[#8b6cb0] mt-2">
          Panduan lengkap untuk mendapatkan jepretan photobooth paling estetik langsung dari webcam
          laptopmu!
        </p>
      </div>

      {/* 4-Cut Sequence Ideas */}
      <div className="mb-14">
        <h2 className="text-2xl font-black text-[#2d1b4e] mb-6 flex items-center gap-2">
          <Smile className="w-6 h-6 text-[#ff4d6d]" /> Rekomendasi Urutan Pose 4-Cut
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Theme 1: Korean Cute */}
          <div className="card-cartoon p-6 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase text-[#ff4d6d] bg-[#ffe5ec] px-2.5 py-1 rounded-full">
                  Style 1
                </span>
                <span className="text-2xl">🌸</span>
              </div>
              <h3 className="text-xl font-black text-[#2d1b4e] mb-2">Korean Kawaii Classic</h3>
              <p className="text-xs font-semibold text-[#5e4777] mb-4">
                Gaya manis dan imut yang paling populer di mesin Life4Cuts Seoul.
              </p>

              <div className="space-y-2 border-t-2 border-[#2d1b4e]/10 pt-3 text-xs font-bold text-[#2d1b4e]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#f0e6ff] text-[#764ba2] flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>Pose 1: V-Sign di dekat pipi dengan senyum lebar</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#f0e6ff] text-[#764ba2] flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Pose 2: Finger Heart (cinta dua jari) ke arah kamera</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#f0e6ff] text-[#764ba2] flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>Pose 3: Kedua tangan memegang pipi (Blush face)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#f0e6ff] text-[#764ba2] flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <span>Pose 4: Big Heart di atas kepala berdua</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                playClick();
                startBoothSession(6);
              }}
              className="btn-cartoon btn-cartoon-primary btn-cartoon-sm w-full mt-6 text-xs"
            >
              Coba Pose Ini (6x Shoot) →
            </button>
          </div>

          {/* Theme 2: Besties Chaos */}
          <div className="card-cartoon p-6 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase text-[#764ba2] bg-[#f0e6ff] px-2.5 py-1 rounded-full">
                  Style 2
                </span>
                <span className="text-2xl">😜</span>
              </div>
              <h3 className="text-xl font-black text-[#2d1b4e] mb-2">Besties Silly & Chaos</h3>
              <p className="text-xs font-semibold text-[#5e4777] mb-4">
                Keseruan tanpa jaim bersama sahabat terdekat, penuh tawa dan ekspresi konyol!
              </p>

              <div className="space-y-2 border-t-2 border-[#2d1b4e]/10 pt-3 text-xs font-bold text-[#2d1b4e]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#ffe5ec] text-[#ff4d6d] flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>Pose 1: Muka kaget atau melotot lucu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#ffe5ec] text-[#ff4d6d] flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Pose 2: Saling menunjuk atau merangkul bahu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#ffe5ec] text-[#ff4d6d] flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>Pose 3: Julurkan lidah dengan kacamata hitam</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#ffe5ec] text-[#ff4d6d] flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <span>Pose 4: Pelukan hangat candid tertawa</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                playClick();
                startBoothSession(10);
              }}
              className="btn-cartoon btn-cartoon-warm btn-cartoon-sm w-full mt-6 text-xs"
            >
              Coba Pose Ini (10x Shoot) →
            </button>
          </div>

          {/* Theme 3: Couple Aesthetic */}
          <div className="card-cartoon p-6 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase text-[#e11d48] bg-[#ffe4e6] px-2.5 py-1 rounded-full">
                  Style 3
                </span>
                <span className="text-2xl">💍</span>
              </div>
              <h3 className="text-xl font-black text-[#2d1b4e] mb-2">Romantic Couple Vibe</h3>
              <p className="text-xs font-semibold text-[#5e4777] mb-4">
                Pose manis dan elegan untuk pasangan, cocok untuk tanggal jadian atau kencan!
              </p>

              <div className="space-y-2 border-t-2 border-[#2d1b4e]/10 pt-3 text-xs font-bold text-[#2d1b4e]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#fef3c7] text-[#d97706] flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>Pose 1: Tatap-tatapan mata dengan senyum tipis</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#fef3c7] text-[#d97706] flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Pose 2: Bersandar kepala di bahu pasangan</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#fef3c7] text-[#d97706] flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>Pose 3: Membentuk satu hati dengan kedua tangan</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#fef3c7] text-[#d97706] flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <span>Pose 4: Cium pipi atau senyum candid bahagia</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                playClick();
                startBoothSession(10);
              }}
              className="btn-cartoon btn-cartoon-ghost btn-cartoon-sm w-full mt-6 text-xs text-[#e11d48]"
            >
              Mulai Sesi Romantis →
            </button>
          </div>
        </div>
      </div>

      {/* Pro Tips Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-cartoon p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#2d1b4e]">Pencahayaan Kamera Laptop</h3>
              <p className="text-xs text-[#8b6cb0]">Tips agar wajah glowing dan jernih</p>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-[#5e4777]">
            <li className="flex items-start gap-2">
              <span className="text-[#ff4d6d] font-black">•</span>
              <span>
                <strong>Arah Cahaya:</strong> Posisikan sumber cahaya (lampu meja atau jendela) persis di depan wajah Anda, jangan membelakangi cahaya (backlight).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ff4d6d] font-black">•</span>
              <span>
                <strong>Tinggi Laptop:</strong> Ganjal laptop dengan buku agar kamera sejajar dengan mata (eye-level), bukan menunduk dari bawah.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ff4d6d] font-black">•</span>
              <span>
                <strong>Filter Bawaan:</strong> Gunakan preset filter <em>Korean Bloom</em> atau <em>Warm Peachy</em> di KikoBooth untuk efek kulit halus seketika!
              </span>
            </li>
          </ul>
        </div>

        <div className="card-cartoon p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-700">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#2d1b4e]">Tips Mencetak Strip Photobooth</h3>
              <p className="text-xs text-[#8b6cb0]">Ukuran standar mesin 2x6 inch</p>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-[#5e4777]">
            <li className="flex items-start gap-2">
              <span className="text-[#764ba2] font-black">•</span>
              <span>
                <strong>Kertas Foto Glossy:</strong> Gunakan kertas foto ukuran A4 atau 4R glossy 210-260 gsm untuk hasil cetak mengkilap seperti di mall.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#764ba2] font-black">•</span>
              <span>
                <strong>Ukuran Cetak:</strong> Strip KikoBooth berformat 2x6 inch (5x15 cm). Satu lembar kertas 4R muat persis 2 strip sejajar!
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#764ba2] font-black">•</span>
              <span>
                <strong>Resolusi HD:</strong> Tombol unduh menghasilkan gambar tajam 300 DPI sehingga tidak akan pecah saat dicetak di printer warna apa pun.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
