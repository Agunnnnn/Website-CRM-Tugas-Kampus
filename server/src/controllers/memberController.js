import { supabase } from "../config/supabase.js";

// Login atau Registrasi Member berdasarkan nomor HP
export const loginOrRegisterMember = async (req, res) => {
  try {
    const { phone, name, email, isRegister } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Nomor HP wajib diisi!" });
    }

    const cleanPhone = phone.trim();

    // 1. Cari apakah member sudah terdaftar
    const { data: existingMember, error: searchError } = await supabase
      .from("members")
      .select("*")
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (searchError) throw searchError;

    if (existingMember) {
      if (isRegister) {
        return res.status(400).json({
          success: false,
          message: "Nomor HP sudah terdaftar. Silakan pilih tab Masuk!",
        });
      }
      return res.json({ success: true, data: existingMember });
    }

    // Jika member belum ada dan mode Masuk
    if (!isRegister && !existingMember) {
      return res.status(404).json({
        success: false,
        message: "Nomor HP belum terdaftar. Silakan daftar terlebih dahulu!",
      });
    }

    // 2. Registrasi member baru
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Nama lengkap wajib diisi!" });
    }

    const newMemberPayload = {
      name: name.trim(),
      phone: cleanPhone,
      email: email ? email.trim() : null,
      points_balance: 0,
    };

    const { data: newMember, error: insertError } = await supabase
      .from("members")
      .insert([newMemberPayload])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ success: true, data: newMember });
  } catch (error) {
    console.error("Error loginOrRegisterMember:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Ambil profil member & saldo poin terbaru
export const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error getMemberById:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Ambil riwayat transaksi poin member
export const getMemberPointsHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("point_transactions")
      .select("*")
      .eq("member_id", id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Error getMemberPointsHistory:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

