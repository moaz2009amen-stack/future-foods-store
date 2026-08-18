import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileClient from "./ProfileClient";

export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: appUser } = await supabase.from("app_users").select("*").eq("id", user.id).single();
  if (!appUser) redirect("/admin/login");

  return <ProfileClient initialUsername={appUser.username} role={appUser.role} />;
}
