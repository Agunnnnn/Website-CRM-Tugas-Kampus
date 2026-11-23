import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#18181b] border-t border-zinc-800 py-6 mt-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
        <div className="font-bold text-zinc-300">
          Loyaltix CRM{" "}
          <span className="font-normal text-zinc-500">
            © 2026. Tugas Sistem Informasi Manajemen.
          </span>
        </div>

        {/* Tautan Navigasi Footer dengan Anchor ID */}
        <div className="flex space-x-4 font-semibold text-zinc-400">
          <a href="#hero" className="hover:text-white transition">
            Beranda
          </a>
          <a href="#pesan" className="hover:text-white transition">
            Pesan Online
          </a>
        </div>
      </div>
    </footer>
  );
}
