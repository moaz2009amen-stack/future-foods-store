import { createClient } from "@/lib/supabase/server";
import UsersClient from "./UsersClient";

export const revalidate = 0;

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase.from("app_users").select("*").order("created_at");

  return <UsersClient initialUsers={users ?? []} />;
}
