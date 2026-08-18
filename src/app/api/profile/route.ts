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

  const { username, password, currentPassword } = await req.json();
  const admin = createAdminClient();

  if (username) {
    const { error } = await admin.from("app_users").update({ username }).eq("id", user.id);
    if (error) {
      return NextResponse.json({ error: "اسم المستخدم مستخدم بالفعل" }, { status: 400 });
    }
  }

  if (password) {
    // لازم يثبت إنه عارف كلمة المرور الحالية قبل ما يقدر يغيرها،
    // عشان لو حد قاعد على جهازه وهو مسجل دخول ميقدرش يستولي على
    // الحساب بمجرد تغيير الباسورد من غير ما يعرف القديمة
    if (!currentPassword) {
      return NextResponse.json({ error: "لازم تدخل كلمة المرور الحالية" }, { status: 400 });
    }

    const { data: appUser } = await admin.from("app_users").select("username").eq("id", user.id).single();
    if (!appUser) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const verifyClient = await createClient();
    const { error: verifyError } = await verifyClient.auth.signInWithPassword({
      email: `${appUser.username}@store.local`,
      password: currentPassword,
    });

    if (verifyError) {
      return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 401 });
    }

    const { error } = await admin.auth.admin.updateUserById(user.id, { password });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
