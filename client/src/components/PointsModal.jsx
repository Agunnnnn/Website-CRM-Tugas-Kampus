import React, { useState, useEffect } from "react";
import { getMemberPointsHistory } from "../api/memberApi";

export default function PointsModal({ isOpen, onClose, member, onNavigateToOrder }) {
  const [activeTab, setActiveTab] = useState("rules"); // "rules" | "history"
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const points = member?.points_balance || 0;
  const usablePoints = Math.floor(points / 100) * 100;
  const discountValue = (usablePoints / 100) * 10000;
  const pointsToNextHundred = points % 100 === 0 ? 100 : 100 - (points % 100);
  const progressPercent = ((points % 100) / 100) * 100;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && activeTab === "history" && member?.id) {
      fetchHistory();
    }
  }, [isOpen, activeTab, member?.id]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getMemberPointsHistory(member.id);
      setHistory(data || []);
    } catch (err) {
      console.warn("Gagal memuat riwayat poin:", err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overscroll-contain"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#18181b] border border-zinc-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] overscroll-contain"
      >
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg text-orange-400 font-bold shadow-sm">
              ⭐
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Sistem Poin MemberKu
              </h2>
              <p className="text-xs text-zinc-400">
                Kumpulkan poin di setiap transaksi & nikmati diskonnya
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Konten Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain space-y-6">
          {/* Kartu Saldo Member */}
          {member ? (
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-orange-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                    Akun Member
                  </span>
                  <h3 className="text-base font-black text-white mt-2">
                    {member.name}
                  </h3>
                  <p className="text-xs text-zinc-400">{member.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Saldo Poin
                  </p>
                  <p className="text-3xl font-black text-orange-400">
                    {points}
                  </p>
                  <p className="text-[11px] text-zinc-400 font-medium">Poin Aktif</p>
                </div>
              </div>

              {/* Box Konversi Diskon */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-400">Dapat ditukarkan:</span>
                  <p className="font-extrabold text-white">
                    {usablePoints > 0 ? (
                      <span className="text-emerald-400">
                        Diskon Rp {discountValue.toLocaleString("id-ID")}
                      </span>
                    ) : (
                      <span className="text-zinc-500">Belum mencapai 100 poin</span>
                    )}
                  </p>
                </div>
                <span className="text-[10px] text-zinc-500">
                  {usablePoints} poin siap pakai
                </span>
              </div>

              {/* Progress Bar ke 100 Poin Berikutnya */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Progres kelipatan 100 poin berikutnya</span>
                  <span className="font-bold text-orange-400">
                    {points % 100}/100
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-zinc-500 text-right">
                  Kumpulkan <strong className="text-zinc-300">{pointsToNextHundred} poin lagi</strong> untuk tambahan diskon Rp 10.000!
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center text-xs text-zinc-400">
              Silakan login member untuk melihat saldo poin dan menukarkan diskon.
            </div>
          )}

          {/* Tab Switcher */}
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab("rules")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === "rules"
                  ? "bg-zinc-800 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              📖 Cara Kerja Poin
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === "history"
                  ? "bg-zinc-800 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              🕒 Riwayat Transaksi Poin
            </button>
          </div>

          {/* Konten Tab 1: Cara Kerja Poin */}
          {activeTab === "rules" && (
            <div className="space-y-3">
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-sm shrink-0 border border-orange-500/20">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-white">
                    Pesan Menu & Hubungkan Member
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Pilih menu favorit Anda dari outlet yang tersedia dengan akun member yang aktif.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/20">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-white">
                    Dapatkan +1 Poin Otomatis
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Setiap kali pesanan Anda telah diproses dan diselesaikan oleh admin cabang, Anda otomatis memperoleh <span className="text-orange-400 font-bold">+1 Poin</span>.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-500/20">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-white">
                    Tukarkan Diskon: 100 Poin = Rp 10.000
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Poin yang terkumpul dapat ditukarkan saat memesan berikutnya. Cukup centang opsi tukar poin di keranjang belanja untuk mendapatkan potongan langsung kelipatan <span className="text-emerald-400 font-bold">Rp 10.000</span>!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Konten Tab 2: Riwayat Poin */}
          {activeTab === "history" && (
            <div className="space-y-2">
              {loadingHistory ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  Memuat riwayat transaksi...
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs bg-zinc-900/40 rounded-2xl border border-zinc-800/50">
                  Belum ada riwayat transaksi poin tercatat.
                </div>
              ) : (
                history.map((tx) => {
                  const isPositive = tx.points_delta > 0;
                  return (
                    <div
                      key={tx.id}
                      className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 flex justify-between items-center text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-white">
                          {tx.description || (isPositive ? "Poin Masuk" : "Penukaran Poin")}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          {new Date(tx.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span
                        className={`font-black text-sm px-2.5 py-1 rounded-lg border ${
                          isPositive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {isPositive ? `+${tx.points_delta}` : tx.points_delta}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-zinc-400 hover:text-white text-xs font-bold transition cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={() => {
              onClose();
              if (onNavigateToOrder) onNavigateToOrder();
            }}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl shadow-lg shadow-orange-500/20 transition cursor-pointer"
          >
            Mulai Pesan Menu 🛍️
          </button>
        </div>
      </div>
    </div>
  );
}

