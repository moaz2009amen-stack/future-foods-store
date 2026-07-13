import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: appUser } = await supabase.from("app_users").select("*").eq("id", user.id).single();
  if (!appUser || appUser.role !== "owner") return null;
  return appUser;
}

export async function POST(req: Request) {
  const owner = await requireOwner();
  if (!owner) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { username, password, role } = await req.json();
  if (!username || !password || !role) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: `${username}@store.local`,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? "تعذر إنشاء المستخدم" }, { status: 500 });
  }

  const { error: insertError } = await admin.from("app_users").insert({
    id: created.user.id,
    username,
    role,
  });

  if (insertError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: "اسم المستخدم مستخدم بالفعل" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
