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
      theme: "white",
      banner_url: null,
      facebook_url: null,
      instagram_url: null,
      tiktok_url: null,
      website_url: null,
      announcement: null,
      announcement_enabled: false,
    }
  );
}
