import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HomeSectionsClient from "./HomeSectionsClient";

export const revalidate = 0;

export default async function HomeSectionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: appUser } = await supabase.from("app_users").select("role").eq("id", user.id).single();
  if (!appUser || appUser.role !== "owner") redirect("/admin/dashboard");

  const { data: sections } = await supabase.from("home_sections").select("*").order("sort_order");

  return <HomeSectionsClient initialSections={sections ?? []} />;
}
