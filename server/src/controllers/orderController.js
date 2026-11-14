import { supabase } from "../config/supabase.js";

// Buat pesanan baru dari pelanggan
export const createOrder = async (req, res) => {
  try {
    const { memberId, outletId, cart, usePoints, notes } = req.body;

    if (!memberId) {
      return res.status(401).json({ success: false, message: "Member wajib terhubung!" });
    }

    if (!outletId) {
      return res.status(400).json({ success: false, message: "Outlet/cabang tujuan harus dipilih!" });
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ success: false, message: "Keranjang belanja masih kosong!" });
    }

    // 1. Verifikasi member di database
    const { data: member, error: memberErr } = await supabase
      .from("members")
      .select("*")
      .eq("id", memberId)
      .single();

    if (memberErr || !member) {
      return res.status(404).json({ success: false, message: "Data member tidak ditemukan!" });
    }

    // 2. Hitung subtotal di server
    const subtotal = cart.reduce((acc, curr) => {
      const price = Number(curr.price) || 0;
      const qty = Number(curr.quantity) || 1;
      return acc + price * qty;
    }, 0);

    // 3. Hitung diskon poin dengan aman di server
    const currentPoints = member.points_balance || 0;
    const maxUsablePoints = Math.min(
      Math.floor(currentPoints / 100) * 100,
      Math.floor(subtotal / 10000) * 100
    );

    const discountAmount = usePoints && maxUsablePoints > 0 ? (maxUsablePoints / 100) * 10000 : 0;
    const finalTotal = Math.max(0, subtotal - discountAmount);

    const uniqueOrderNumber = "ORD-" + Date.now();

    // 4. Buat pesanan (status awal: 'Baru', points_awarded: 0)
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          order_number: uniqueOrderNumber,
          member_id: member.id,
          customer_name: member.name,
          customer_phone: member.phone,
          total_amount: finalTotal,
          status: "Baru",
          points_awarded: 0,
          outlet_id: outletId,
          notes: usePoints && discountAmount > 0
            ? `${notes || ""} (Diskon poin Rp${discountAmount.toLocaleString("id-ID")})`.trim()
            : notes || "-",
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 5. Simpan item belanja ke order_items
    const orderItems = cart.map((item) => ({
      order_id: orderData.id,
      product_id: item.id,
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.price) || 0,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 6. Jika gunakan poin diskon, potong poin member & catat transaksi
    let remainingPoints = currentPoints;
    if (usePoints && maxUsablePoints > 0) {
      remainingPoints -= maxUsablePoints;

      await supabase.from("point_transactions").insert([
        {
          member_id: member.id,
          type: "redeem",
          points_delta: -maxUsablePoints,
          reference_type: "order",
          reference_id: orderData.id,
          description: `Penukaran ${maxUsablePoints} poin untuk diskon pesanan ${uniqueOrderNumber}`,
        },
      ]);

      await supabase
        .from("members")
        .update({ points_balance: remainingPoints })
        .eq("id", member.id);
    }

    res.status(201).json({
      success: true,
      data: {
        order: orderData,
        orderNumber: uniqueOrderNumber,
        subtotal,
        discountAmount,
        finalTotal,
        earnedPoints: 1,
        usedPoints: usePoints ? maxUsablePoints : 0,
        remainingPoints,
      },
    });
  } catch (error) {
    console.error("Error createOrder:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Ambil semua pesanan (untuk dashboard admin)
export const getOrders = async (req, res) => {
  try {
    const { outletId } = req.query;

    let query = supabase
      .from("orders")
      .select(`
        *,
        outlets (name),
        order_items (*)
      `)
      .order("created_at", { ascending: false });

    if (outletId && outletId !== "all") {
      query = query.eq("outlet_id", outletId);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Error getOrders:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update status pesanan (Baru -> Diproses -> Selesai / Dibatalkan)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Baru", "Diproses", "Selesai", "Dibatalkan"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Status pesanan tidak valid!" });
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error updateOrderStatus:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

