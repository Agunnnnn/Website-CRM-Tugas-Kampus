import React, { useState, useEffect } from "react";
import { getOutlets } from "../api/outletApi";
import { getProducts } from "../api/productApi";
import { getOrders, updateOrderStatus } from "../api/orderApi";

export default function AdminDashboard({ onLogout }) {
  const [adminProfile, setAdminProfile] = useState(null);
  const [outlets, setOutlets] = useState([]);
  const [selectedOutletFilter, setSelectedOutletFilter] = useState("all");
  const [orders, setOrders] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [loading, setLoading] = useState(true);

  // State untuk Modal Detail Pesanan
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    checkAdminRoleAndFetchData();
  }, []);

  const checkAdminRoleAndFetchData = async () => {
    setLoading(true);
    try {
      const localSession = localStorage.getItem("memberku_admin_session");
      const profile = localSession ? JSON.parse(localSession) : null;

      // Ambil daftar outlet & produk via Backend API
      const [outletList, productList] = await Promise.all([
        getOutlets(),
        getProducts(),
      ]);

      setOutlets(outletList || []);

      const map = {};
      if (productList) {
        productList.forEach((p) => {
          map[p.id] = p.name;
        });
      }
      setProductsMap(map);

      if (profile) {
        setAdminProfile(profile);
        if (profile.role === "outlet_admin" && profile.outlet_id) {
          setSelectedOutletFilter(profile.outlet_id);
          fetchOrdersList(profile.outlet_id);
        } else {
          fetchOrdersList("all");
        }
      } else {
        fetchOrdersList("all");
      }
    } catch (err) {
      console.error("Error memuat data admin:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersList = async (outletId) => {
    try {
      const data = await getOrders(outletId);
      setOrders(data || []);
    } catch (err) {
      console.error("Gagal mengambil data pesanan:", err.message);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus, e) => {
    if (e) e.stopPropagation();
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrdersList(selectedOutletFilter);

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Gagal memperbarui status:", err.message);
      alert("Gagal mengubah status pesanan: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("memberku_admin_session");
    onLogout();
  };

  // Kalkulasi total pendapatan
  const totalRevenue = orders.reduce((acc, curr) => {
    const orderTotal =
      curr.total_price ||
      curr.total_amount ||
      curr.order_items?.reduce(
        (sum, item) => sum + (item.unit_price || 0) * (item.quantity || 1),
        0,
      ) ||
      0;
    return acc + orderTotal;
  }, 0);

  const totalTransactions = orders.length;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto space-y-6 w-full">
        {/* HEADER DASHBOARD */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] font-extrabold uppercase tracking-wider rounded-full">
                {adminProfile?.role === "outlet_admin"
                  ? "Admin Outlet"
                  : "Super Admin"}
              </span>
              {adminProfile?.outlets?.name && (
                <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                  📍 {adminProfile.outlets.name}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Dashboard Manajemen Penjualan
            </h1>
            <p className="text-xs text-zinc-400">
              Login sebagai:{" "}
              <span className="text-zinc-200 font-medium">
                {adminProfile?.email}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {adminProfile?.role === "super_admin" && (
              <select
                value={selectedOutletFilter}
                onChange={(e) => {
                  setSelectedOutletFilter(e.target.value);
                  fetchOrders(e.target.value);
                }}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-xs outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="all">🌐 Semua Cabang (Global)</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    📍 {o.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Keluar Dashboard
            </button>
          </div>
        </div>

        {/* KARTU STATISTIK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Total Pendapatan
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-orange-500">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </h2>
          </div>
          <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Total Pesanan Masuk
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {totalTransactions}{" "}
              <span className="text-sm font-normal text-zinc-400">
                Transaksi
              </span>
            </h2>
          </div>
        </div>

        {/* DAFTAR PESANAN RINGKAS */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-lg font-black text-white">
              Daftar Pesanan Masuk
            </h2>
            <p className="text-xs text-zinc-400">
              Klik pada kartu pesanan untuk melihat rincian menu yang dibeli
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              Memuat data pesanan...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
              Belum ada pesanan masuk di outlet ini.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const calculatedTotal =
                  order.total_price ||
                  order.total_amount ||
                  order.order_items?.reduce(
                    (sum, item) =>
                      sum + (item.unit_price || 0) * (item.quantity || 1),
                    0,
                  ) ||
                  0;

                return (
                  <div
                    key={order.id}
                    onClick={() =>
                      setSelectedOrder({
                        ...order,
                        computed_total: calculatedTotal,
                      })
                    }
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:border-orange-500/50 cursor-pointer shadow-md"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-white bg-zinc-800 px-2.5 py-1 rounded-lg">
                          {order.order_number || order.id.slice(0, 8)}
                        </span>
                        {order.outlets?.name && (
                          <span className="text-[11px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full font-medium">
                            📍 {order.outlets.name}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            order.status === "Selesai"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : order.status === "Diproses"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {order.status || "Baru"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 font-medium">
                        Pemesan:{" "}
                        <strong className="text-white">
                          {order.customer_name}
                        </strong>{" "}
                        ({order.customer_phone || "-"})
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        Waktu:{" "}
                        {new Date(order.created_at).toLocaleString("id-ID")} •{" "}
                        <span className="text-orange-400 underline">
                          Klik untuk lihat rincian menu
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-800">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold">
                          Total Harga
                        </p>
                        <p className="text-sm font-black text-orange-400">
                          Rp {calculatedTotal.toLocaleString("id-ID")}
                        </p>
                      </div>

                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!order.status || order.status === "Baru" ? (
                          <button
                            onClick={(e) =>
                              handleUpdateStatus(order.id, "Diproses", e)
                            }
                            className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            Proses Pesanan
                          </button>
                        ) : order.status === "Diproses" ? (
                          <button
                            onClick={(e) =>
                              handleUpdateStatus(order.id, "Selesai", e)
                            }
                            className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            Selesaikan
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-xs font-bold rounded-xl border border-zinc-700">
                            Selesai ✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* INFORMASI KELOMPOK & COPYWRITING (SESUAI SYARAT TUGAS) */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 text-center space-y-2 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
            Tim Pengembang MemberKu CRM
          </p>
          <p className="text-xs text-zinc-300 font-medium">
            Anggota Kelompok:{" "}
            <span className="text-white font-bold">PALAGUNA (Ketua)</span> •
            PUTRA RENO HARIYANTO • IKHSAN DWI SAPUTRA
          </p>
          <p className="text-[11px] text-zinc-500 italic pt-1 border-t border-zinc-800/60">
            "Solusi Digital Terpadu untuk Manajemen Hubungan Pelanggan dan
            Optimalisasi Penjualan Multi-Cabang."
          </p>
        </div>
      </div>

      {/* MODAL DETAIL PESANAN */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#18181b] border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg">
                  Detail Pesanan #
                  {selectedOrder.order_number || selectedOrder.id.slice(0, 8)}
                </span>
                <h3 className="text-xl font-black text-white mt-2">
                  {selectedOrder.customer_name}
                </h3>
                <p className="text-xs text-zinc-400">
                  Telepon: {selectedOrder.customer_phone || "-"}
                </p>
                {selectedOrder.notes && (
                  <p className="text-[11px] text-zinc-400 mt-1 italic">
                    Catatan: {selectedOrder.notes}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="border-t border-zinc-800 pt-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Daftar Menu yang Dipesan:
              </p>

              {selectedOrder.order_items &&
              selectedOrder.order_items.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedOrder.order_items.map((item, idx) => {
                    const itemName =
                      productsMap[item.product_id] ||
                      item.product_name ||
                      item.name ||
                      "Menu Item";
                    const itemPrice = item.unit_price || 0;
                    const itemQty = item.quantity || 1;
                    const itemSubtotal = itemPrice * itemQty;

                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{itemName}</p>
                          <p className="text-zinc-400 text-[11px]">
                            Jumlah: {itemQty}x @ Rp{" "}
                            {itemPrice.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <p className="font-black text-orange-400">
                          Rp {itemSubtotal.toLocaleString("id-ID")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic bg-zinc-900 p-3 rounded-xl">
                  Tidak ada rincian item tercatat.
                </p>
              )}
            </div>

            <div className="border-t border-zinc-800 pt-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">
                  Total Pembayaran
                </p>
                <p className="text-lg font-black text-orange-400">
                  Rp{" "}
                  {(
                    selectedOrder.computed_total ||
                    selectedOrder.total_price ||
                    selectedOrder.total_amount ||
                    0
                  ).toLocaleString("id-ID")}
                </p>
              </div>

              <div className="flex gap-2">
                {!selectedOrder.status || selectedOrder.status === "Baru" ? (
                  <button
                    onClick={(e) =>
                      handleUpdateStatus(selectedOrder.id, "Diproses", e)
                    }
                    className="px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Proses Pesanan
                  </button>
                ) : selectedOrder.status === "Diproses" ? (
                  <button
                    onClick={(e) =>
                      handleUpdateStatus(selectedOrder.id, "Selesai", e)
                    }
                    className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Selesaikan Pesanan
                  </button>
                ) : (
                  <span className="px-4 py-2.5 bg-zinc-800 text-zinc-400 text-xs font-bold rounded-xl border border-zinc-700">
                    Status: Selesai ✓
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
