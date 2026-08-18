import { createClient } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/settings";
import SettingsClient from "./SettingsClient";

export const revalidate = 0;

export default async function SettingsPage() {
  const supabase = await createClient();
  const settings = await getStoreSettings();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");

  return <SettingsClient initialSettings={settings} initialCategories={categories ?? []} />;
}
