import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: `${username}@store.local`,
    password,
  });

  if (error) {
    return NextResponse.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
  }

  // في هذه المرحلة تم حفظ الكوكيز الخاصة بالجلسة في الـ response بشكل مضمون
  // (على عكس تسجيل الدخول من المتصفح مباشرة اللي بياخد وقت لحظي لحفظ الكوكيز)
  return NextResponse.json({ success: true });
}
