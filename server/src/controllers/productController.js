import { supabase } from "../config/supabase.js";

export const getProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Error getProducts:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

