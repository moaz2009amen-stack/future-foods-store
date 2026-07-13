import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { username, password } = await req.json();
  const admin = createAdminClient();

  // بنستخدم صلاحيات الأدمن هنا فقط عشان نضمن إن المستخدم مش قادر
  // يغير أي حاجة تانية غير اسمه وكلمة مروره (زي الدور أو حالة التفعيل)
  if (username) {
    const { error } = await admin.from("app_users").update({ username }).eq("id", user.id);
    if (error) {
      return NextResponse.json({ error: "اسم المستخدم مستخدم بالفعل" }, { status: 400 });
    }
  }

  if (password) {
    const { error } = await admin.auth.admin.updateUserById(user.id, { password });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
