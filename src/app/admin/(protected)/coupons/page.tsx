import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CouponsClient from "./CouponsClient";

export const revalidate = 0;

export default async function CouponsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: appUser } = await supabase.from("app_users").select("role").eq("id", user.id).single();
  if (!appUser || appUser.role !== "owner") redirect("/admin/dashboard");

  const { data: coupons } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });

  return <CouponsClient initialCoupons={coupons ?? []} />;
}
