import React, { useState } from "react";
import { loginOrRegisterMember } from "../api/memberApi";

export default function MemberLogin({
  onLoginSuccess,
  onNavigateToAdminLogin,
}) {
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const memberData = await loginOrRegisterMember({
        phone,
        name,
        email,
        isRegister,
      });

      if (isRegister) {
        setSuccessMessage("Pendaftaran berhasil! Mengalihkan...");
        setTimeout(() => {
          localStorage.setItem("memberku_session", JSON.stringify(memberData));
          onLoginSuccess(memberData);
        }, 800);
      } else {
        localStorage.setItem("memberku_session", JSON.stringify(memberData));
        onLoginSuccess(memberData);
      }
    } catch (error) {
      console.error("Error Auth Member:", error.message);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0e] text-zinc-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#18181b] border border-zinc-800 p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-6">
          <span className="bg-orange-500 text-white px-3 py-1.5 rounded-2xl font-black text-sm inline-block mb-3 shadow-lg shadow-orange-500/20">
            MK
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isRegister ? "Daftar Member Baru" : "Login MemberKu"}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {isRegister
              ? "Buat akun untuk mulai memesan & kumpulkan poin"
              : "Masuk dengan Nomor HP terdaftar Anda"}
          </p>
        </div>

        {/* TAB SWITCH */}
        <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMessage("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              !isRegister
                ? "bg-zinc-800 text-white shadow"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMessage("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              isRegister
                ? "bg-orange-500 text-white shadow"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Daftar Member
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs mb-4 text-center font-medium">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs mb-4 text-center font-medium">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Palaguna"
                required
                className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900 text-white text-xs outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Nomor HP (WhatsApp)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="081234567890"
              required
              className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900 text-white text-xs outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Email (Opsional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@domain.com"
                className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900 text-white text-xs outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/20 transition cursor-pointer disabled:bg-zinc-800 disabled:text-zinc-600"
          >
            {loading
              ? "Memproses..."
              : isRegister
                ? "Daftar & Mulai Pesan"
                : "Masuk ke Akun Member"}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-zinc-800/60 text-center">
          <button
            type="button"
            onClick={onNavigateToAdminLogin}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition underline cursor-pointer"
          >
            Akses Login Admin Toko
          </button>
        </div>
      </div>
    </div>
  );
}
