import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/settings";
import AdminSidebar from "@/components/admin/AdminSidebar";
import NotificationSound from "@/components/admin/NotificationSound";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: appUser } = await supabase
    .from("app_users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!appUser || !appUser.active) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  const settings = await getStoreSettings();

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <AdminSidebar role={appUser.role} username={appUser.username} storeName={settings.store_name} />
      <main className="flex-1 p-4 sm:p-6 max-w-full overflow-x-hidden">{children}</main>
      <NotificationSound />
    </div>
  );
}
