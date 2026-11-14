import React, { useState, useEffect } from "react";

export default function Navbar({
  onNavigateToLogin,
  onNavigateToMemberLogin,
  memberSession,
  onLogoutMember,
  onOpenPointsModal,
}) {
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const promo = document.getElementById("promo");
      const pesan = document.getElementById("pesan");

      const scrollPos = window.scrollY + 220;

      if (pesan && scrollPos >= pesan.offsetTop) {
        setActiveSection("pesan");
      } else if (promo && scrollPos >= promo.offsetTop) {
        setActiveSection("promo");
      } else {
        setActiveSection("hero");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const memberInitial = memberSession?.name
    ? memberSession.name.trim().charAt(0).toUpperCase()
    : "M";

  return (
    <header className="sticky top-4 z-40 mb-8 transition-all duration-300">
      {/* Outer Floating Pill Bar */}
      <div className="bg-[#18181b]/85 backdrop-blur-xl border border-zinc-800/80 hover:border-zinc-700/80 rounded-full p-2 pl-4 sm:pl-6 pr-2 sm:pr-3 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all">
        {/* Logo / Identitas with playful hover animation */}
        <div
          onClick={() => scrollToSection("hero")}
          className="flex items-center space-x-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
            MK
          </div>
          <div className="flex items-center">
            <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-zinc-100 transition">
              MemberKu
            </span>
            <span className="text-orange-500 text-xl font-black animate-pulse">
              .
            </span>
          </div>
        </div>

        {/* Navigasi Desktop dengan Active Scroll Spy & Hover Glow */}
        <nav className="hidden md:flex items-center space-x-1.5 bg-zinc-900/60 p-1 rounded-full border border-zinc-800/60">
          <button
            type="button"
            onClick={() => scrollToSection("hero")}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
              activeSection === "hero"
                ? "bg-zinc-800 text-white shadow-md border border-zinc-700 scale-105"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            Beranda
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("pesan")}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
              activeSection === "pesan"
                ? "bg-zinc-800 text-white shadow-md border border-zinc-700 scale-105"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            Pesan Online
          </button>
          <button
            type="button"
            onClick={() => {
              if (onOpenPointsModal) onOpenPointsModal();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              activeSection === "promo"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 scale-105 shadow-md shadow-orange-500/10"
                : "text-zinc-400 hover:text-orange-400 hover:bg-orange-500/10"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>Sistem Poin</span>
          </button>
        </nav>

        {/* Bagian Kanan / User & Aksi */}
        <div className="flex items-center space-x-2">
          {memberSession ? (
            <div className="flex items-center space-x-1.5">
              {/* Badge Poin Interaktif dengan Avatar */}
              <button
                type="button"
                onClick={onOpenPointsModal}
                className="group flex items-center gap-2 bg-zinc-900/90 hover:bg-zinc-800/90 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-zinc-800 hover:border-orange-500/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-orange-500/15 hover:scale-[1.03] active:scale-95"
                title="Klik untuk membuka rincian & status poin"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                  {memberInitial}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[11px] font-bold text-zinc-200 group-hover:text-white leading-tight">
                    {memberSession.name}
                  </span>
                  <span className="text-[10px] text-orange-400 font-extrabold flex items-center gap-1 leading-tight">
                    ⭐ {memberSession.points_balance || 0} Poin
                  </span>
                </div>
                <span className="sm:hidden text-xs font-black text-orange-400 pr-1">
                  {memberSession.points_balance || 0}★
                </span>
              </button>

              <button
                onClick={onLogoutMember}
                className="p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition cursor-pointer active:scale-95"
                title="Keluar akun"
              >
                <span className="hidden sm:inline">Keluar</span>
                <span className="sm:hidden text-sm">🚪</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onNavigateToMemberLogin}
              className="px-4 py-2 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer shadow-lg shadow-orange-500/25 hover:scale-105 active:scale-95"
            >
              Login Member
            </button>
          )}

          {/* Tombol Admin */}
          <button
            onClick={onNavigateToLogin}
            className="p-2 sm:px-3 sm:py-2 rounded-full text-xs font-semibold text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition cursor-pointer active:scale-95 flex items-center gap-1"
            title="Akses Dashboard Admin"
          >
            <span>🔒</span>
            <span className="hidden sm:inline">Admin</span>
          </button>

          {/* Tombol Menu Mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Dropdown Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-3 bg-[#18181b]/95 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl space-y-1">
          <button
            type="button"
            onClick={() => scrollToSection("hero")}
            className="w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition flex items-center justify-between"
          >
            <span>🏠 Beranda</span>
            {activeSection === "hero" && (
              <span className="text-orange-500 text-xs">●</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("pesan")}
            className="w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition flex items-center justify-between"
          >
            <span>🛍️ Pesan Online</span>
            {activeSection === "pesan" && (
              <span className="text-orange-500 text-xs">●</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenPointsModal) onOpenPointsModal();
            }}
            className="w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold text-orange-400 hover:bg-orange-500/10 transition flex items-center justify-between"
          >
            <span>⭐ Sistem Poin & Loyalty</span>
            <span className="text-[10px] bg-orange-500/20 px-2 py-0.5 rounded-full font-extrabold border border-orange-500/30">
              Lihat
            </span>
          </button>
        </div>
      )}
    </header>
  );
}
