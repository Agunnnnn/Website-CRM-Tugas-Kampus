import React, { useState } from "react";
import { adminLogin } from "../api/adminApi";

export default function AdminLogin({ onLoginSuccess, onBack }) {
  const [loginInput, setLoginInput] = useState(""); // Bisa diisi "pamulang" atau "admin@gmail.com"
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const data = await adminLogin(loginInput, password);
      localStorage.setItem("memberku_admin_session", JSON.stringify(data.profile));
      onLoginSuccess(data.profile);
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg(err.message || "Login gagal: Username/Email atau Password salah!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="absolute top-5 left-5 text-zinc-400 hover:text-white px-3 py-1.5 hover:bg-zinc-800/80 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold border border-transparent hover:border-zinc-700"
            title="Kembali"
          >
            <span>←</span>
            <span>Kembali</span>
          </button>
        )}
        <div className="text-center space-y-2 pt-2 sm:pt-0">
          <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-2xl flex items-center justify-center mx-auto text-xl font-black">
            🔒
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Login Admin & Kasir
          </h1>
          <p className="text-xs text-zinc-400">
            Masukkan username/email dan password untuk masuk
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Username Cabang / Email Admin
            </label>
            <input
              type="text"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="Contoh: pamulang atau admin@gmail.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-xs outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              *Admin cabang cukup ketik username (misal:{" "}
              <span className="text-orange-400 font-medium">pamulang</span>).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-xs outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 text-white font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer mt-2 ${
              loading
                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20"
            }`}
          >
            {loading ? "Memverifikasi..." : "Masuk Dashboard"}
          </button>
        </form>

        {onBack && (
          <div className="pt-2 border-t border-zinc-800/60 text-center">
            <button
              type="button"
              onClick={onBack}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
            >
              <span>←</span>
              <span>Kembali ke Halaman Pelanggan</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
