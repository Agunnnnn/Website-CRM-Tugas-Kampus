import { supabase } from "../config/supabase.js";

export const adminLogin = async (req, res) => {
  try {
    const { loginInput, password } = req.body;

    if (!loginInput || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/Email dan password wajib diisi!",
      });
    }

    const formattedEmail = loginInput.includes("@")
      ? loginInput.trim()
      : `${loginInput.trim().toLowerCase()}@memberku.com`;

    // 1. Verifikasi login via Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: formattedEmail,
        password: password,
      });

    if (authError) {
      return res.status(401).json({
        success: false,
        message: "Username/Email atau Password salah!",
      });
    }

    const user = authData.user;

    // 2. Ambil profil admin
    let { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("*, outlets(name)")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      profile = {
        id: user.id,
        role: "super_admin",
        email: user.email,
        outlet_id: null,
      };
    }

    res.json({
      success: true,
      data: {
        user,
        profile,
        session: authData.session,
      },
    });
  } catch (error) {
    console.error("Error adminLogin:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

