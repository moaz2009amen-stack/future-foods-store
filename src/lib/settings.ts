import { createClient } from "@/lib/supabase/server";
import type { StoreSettings } from "@/types";

export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single();

  return (
    data ?? {
      id: 1,
      store_name: "سر السعادة ستور",
      store_name_en: "Future Foods Store",
      logo_url: null,
      phone: null,
      address: null,
      delivery_fee: 0,
      min_order: 0,
      working_hours: null,
      theme: "red",
      banner_url: null,
    }
  );
}
