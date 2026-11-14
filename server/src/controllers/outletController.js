import { supabase } from "../config/supabase.js";

export const getOutlets = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("outlets")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Error getOutlets:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

