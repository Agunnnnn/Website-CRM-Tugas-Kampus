import React, { useState, useEffect } from "react";
import { getProducts } from "../api/productApi";
import { getOutlets } from "../api/outletApi";
import { getMemberById } from "../api/memberApi";
import { createOrder } from "../api/orderApi";

export default function PublicOrder({
  memberSession,
  onLogoutMember,
  onNavigateToLoginMember,
  onUpdateMemberSession,
  onOpenPointsModal,
}) {
  const [products, setProducts] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState("");
  const [cart, setCart] = useState([]);
  const [usePoints, setUsePoints] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentMember, setCurrentMember] = useState(memberSession);

  const [successOrderData, setSuccessOrderData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (successOrderData) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [successOrderData]);

  useEffect(() => {
    fetchProducts();
    fetchOutlets();
    if (memberSession?.id) {
      refreshMemberPoints();
    } else {
      setCurrentMember(null);
    }
  }, [memberSession]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (error) {
      console.error("Gagal mengambil produk:", error.message);
    }
  };

  const fetchOutlets = async () => {
    try {
      const data = await getOutlets();
      setOutlets(data || []);
    } catch (error) {
      console.error("Gagal mengambil outlet:", error.message);
    }
  };

  const refreshMemberPoints = async () => {
    try {
      const data = await getMemberById(memberSession.id);
      if (data) {
        setCurrentMember(data);
        localStorage.setItem("memberku_session", JSON.stringify(data));
        if (onUpdateMemberSession) {
          onUpdateMemberSession(data);
        }
      }
    } catch (err) {
      console.error("Error refreshing points:", err.message);
    }
  };

  const addToCart = (product) => {
    const existingIndex = cart.findIndex((item) => item.id === product.id);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    const existingItem = cart.find((item) => item.id === productId);
    if (!existingItem) return;

    const newQty = existingItem.quantity + delta;
    if (newQty <= 0) {
      setCart(cart.filter((item) => item.id !== productId));
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity: newQty } : item,
        ),
      );
    }
  };

  const subtotal = cart.reduce(
    (acc, curr) => acc + curr.price * curr.quantity,
    0,
  );

  const maxUsablePoints = currentMember
    ? Math.min(
        Math.floor((currentMember.points_balance || 0) / 100) * 100,
        Math.floor(subtotal / 10000) * 100,
      )
    : 0;

  const discountAmount = usePoints ? (maxUsablePoints / 100) * 10000 : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!currentMember) {
      alert("Silakan login member terlebih dahulu untuk memesan.");
      onNavigateToLoginMember();
      return;
    }

    if (!selectedOutletId) {
      setErrorMessage(
        "⚠️ Silakan pilih outlet / cabang tujuan terlebih dahulu sebelum memesan!",
      );
      return;
    }

    if (cart.length === 0) {
      setErrorMessage("⚠️ Keranjang belanja masih kosong!");
      return;
    }

    setLoading(true);
    try {
      const result = await createOrder({
        memberId: currentMember.id,
        outletId: selectedOutletId,
        cart,
        usePoints,
        notes,
      });

      const chosenOutletObj = outlets.find((o) => o.id === selectedOutletId);

      setSuccessOrderData({
        orderNumber: result.orderNumber,
        outletName: chosenOutletObj ? chosenOutletObj.name : "Outlet MemberKu",
        items: [...cart],
        subtotal: result.subtotal,
        discountAmount: result.discountAmount,
        finalTotal: result.finalTotal,
        earnedPoints: result.earnedPoints,
        usedPoints: result.usedPoints,
      });

      setCart([]);
      setNotes("");
      setUsePoints(false);
      setSelectedOutletId("");
      refreshMemberPoints();
    } catch (error) {
      console.error("Detail Error:", error);
      setErrorMessage("Gagal mengirim pesanan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 relative">
      {successOrderData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overscroll-contain">
          <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden overscroll-contain">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold border border-emerald-500/30">
                ✓
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Pesanan Berhasil Dikirim!
              </h2>
              <p className="text-xs text-zinc-400">
                No. Pesanan:{" "}
                <span className="text-orange-400 font-bold">
                  {successOrderData.orderNumber}
                </span>
              </p>
              <p className="text-xs text-zinc-400">
                Cabang:{" "}
                <span className="text-white font-bold">
                  {successOrderData.outletName}
                </span>
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 max-h-48 overflow-y-auto">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Rincian Pesanan:
              </p>
              {successOrderData.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-xs"
                >
                  <span className="text-white font-medium">
                    {item.name}{" "}
                    <span className="text-zinc-500">x{item.quantity}</span>
                  </span>
                  <span className="text-zinc-300">
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>
                  Rp {successOrderData.subtotal.toLocaleString("id-ID")}
                </span>
              </div>
              {successOrderData.discountAmount > 0 && (
                <div className="flex justify-between text-orange-400 font-semibold">
                  <span>Diskon Poin ({successOrderData.usedPoints} Poin)</span>
                  <span>
                    - Rp{" "}
                    {successOrderData.discountAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-zinc-800/60">
                <span>Total Pembayaran</span>
                <span className="text-orange-400">
                  Rp {successOrderData.finalTotal.toLocaleString("id-ID")}
                </span>
              </div>
              {successOrderData.earnedPoints > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/20 p-2.5 rounded-xl text-center text-orange-400 font-bold mt-2">
                  🎉 Kamu akan mendapatkan +{successOrderData.earnedPoints} Poin
                  setelah pesanan diselesaikan admin!
                </div>
              )}
            </div>

            <button
              onClick={() => setSuccessOrderData(null)}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer"
            >
              Tutup & Buat Pesanan Baru
            </button>
          </div>
        </div>
      )}

      <section
        id="hero"
        className="bg-[#18181b] border border-zinc-800 rounded-3xl p-8 sm:p-12 text-center shadow-lg relative overflow-hidden"
      >
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
          Selamat Datang di <span className="text-orange-500">MemberKu</span>
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto mb-8">
          Nikmati kemudahan memesan menu favorit dan kumpulkan poin member
          otomatis di setiap transaksi Anda.
        </p>

        {currentMember && (
          <div className="bg-zinc-900/80 border border-zinc-800 inline-flex flex-col sm:flex-row items-center gap-4 p-4 px-6 rounded-2xl">
            <div className="text-left">
              <p className="text-xs text-zinc-400">Member Terhubung:</p>
              <p className="text-sm font-black text-white">
                {currentMember.name} ({currentMember.phone})
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenPointsModal}
              className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40 px-4 py-2 rounded-xl text-orange-400 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Lihat status & panduan poin"
            >
              <span>Saldo: {currentMember.points_balance || 0} Poin</span>
              <span className="text-[10px] bg-orange-500/20 px-1.5 py-0.5 rounded-md font-extrabold">
                Rincian →
              </span>
            </button>
            <button
              onClick={onLogoutMember}
              className="text-xs text-red-400 hover:text-red-300 font-bold underline cursor-pointer"
            >
              Keluar
            </button>
          </div>
        )}
      </section>

      {/* SECTION CARA KERJA POIN & REWARD */}
      <section
        id="promo"
        className="bg-gradient-to-r from-zinc-900 via-[#18181b] to-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-extrabold uppercase tracking-wider rounded-full flex items-center gap-1">
                ⭐ Loyalty Program
              </span>
              <span className="text-xs text-zinc-400">
                1 Pesanan Selesai = +1 Poin
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Kumpulkan Poin, Dapatkan Diskon Belanja!
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tiap kali pesananmu selesai, kamu otomatis mendapatkan poin
              member. Tukarkan kelipatan 100 poin untuk mendapatkan potongan
              harga langsung Rp 10.000 saat memesan.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenPointsModal}
            className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-orange-400 border border-orange-500/30 hover:border-orange-500/60 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 shadow-md"
          >
            <span>⭐ Lihat Status & Panduan Poin</span>
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-800/80">
          <div className="flex items-center gap-3 bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800/60">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-lg shrink-0 border border-orange-500/20">
              🛍️
            </div>
            <div>
              <p className="text-xs font-bold text-white">1. Pesan Menu</p>
              <p className="text-[10px] text-zinc-400">Pilih menu favoritmu</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800/60">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0 border border-emerald-500/20">
              ⚡
            </div>
            <div>
              <p className="text-xs font-bold text-white">2. Dapat +1 Poin</p>
              <p className="text-[10px] text-zinc-400">
                Saat pesanan berstatus Selesai
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800/60">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg shrink-0 border border-blue-500/20">
              🎁
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                3. Diskon Rp 10.000
              </p>
              <p className="text-[10px] text-zinc-400">Setiap tukar 100 poin</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pesan" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-white tracking-tight">
              Katalog Produk
            </h2>
            <span className="text-xs text-zinc-400">
              Pilih menu favorit Anda
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-[#18181b] border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between hover:border-orange-500/50 transition group"
              >
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-orange-400 transition">
                    {product.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 mb-4 line-clamp-2">
                    {product.description || "Tidak ada deskripsi."}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/60">
                  <span className="font-black text-orange-400 text-sm">
                    Rp {product.price?.toLocaleString("id-ID")}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-zinc-800 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border border-zinc-700 hover:border-orange-500"
                  >
                    + Tambah
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#18181b] border border-zinc-800 rounded-3xl p-6 h-fit space-y-6">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">
              Keranjang Pesanan
            </h2>
            <p className="text-xs text-zinc-400">
              Ringkasan item & pemilihan outlet
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Pilih Outlet / Cabang Tujuan{" "}
              <span className="text-orange-500">*</span>
            </label>
            <select
              value={selectedOutletId}
              onChange={(e) => {
                setSelectedOutletId(e.target.value);
                setErrorMessage("");
              }}
              className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-xs outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <option value="">-- Pilih Outlet Terdekat --</option>
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </option>
              ))}
            </select>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-zinc-800 rounded-2xl">
              <p className="text-xs text-zinc-500">Keranjang masih kosong.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-50 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-zinc-900 p-3 rounded-2xl border border-zinc-800"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {item.name}
                    </h4>
                    <span className="text-[10px] text-orange-400 font-semibold">
                      Rp {item.price?.toLocaleString("id-ID")} x {item.quantity}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-bold hover:bg-zinc-700 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-bold hover:bg-zinc-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentMember && (
            <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Pemesan:
              </span>
              <p className="text-xs font-bold text-white">
                {currentMember.name} ({currentMember.phone})
              </p>
            </div>
          )}

          {currentMember && maxUsablePoints >= 100 && cart.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/20 p-3.5 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 rounded"
                  />
                  <span className="text-xs font-bold text-white">
                    Tukarkan {maxUsablePoints} Poin
                  </span>
                </label>
                <span className="text-xs font-extrabold text-orange-400">
                  - Rp{" "}
                  {((maxUsablePoints / 100) * 10000).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-zinc-800 space-y-1">
            <div className="flex justify-between items-center text-xs text-zinc-400">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            {usePoints && (
              <div className="flex justify-between items-center text-xs text-orange-400 font-semibold">
                <span>Diskon Poin ({maxUsablePoints} Poin)</span>
                <span>- Rp {discountAmount.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 text-base font-black text-white">
              <span>Total Akhir</span>
              <span>Rp {finalTotal.toLocaleString("id-ID")}</span>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs text-center font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmitOrder} className="space-y-3 pt-1">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan (opsional)..."
              rows="2"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-xs outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            ></textarea>

            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className={`w-full py-3.5 rounded-xl text-white font-extrabold text-xs transition shadow-lg ${
                loading || cart.length === 0
                  ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 cursor-pointer shadow-orange-500/20"
              }`}
            >
              {loading ? "Mengirim Pesanan..." : "Kirim Pesanan Sekarang"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
