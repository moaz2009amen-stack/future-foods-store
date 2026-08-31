import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// حماية على مستوى الكود من محاولات Brute-force. ملحوظة مهمة: التخزين
// في الذاكرة بيتصفر مع كل نشر جديد على Vercel، فده طبقة حماية إضافية
// مش بديل كامل. للحماية الأساسية الحقيقية، فعّل Rate Limiting من
// Supabase Dashboard → Authentication → Settings كمان.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `login:${ip}:${username}`;

  if (isRateLimited(key)) {
    return NextResponse.json(
      { error: "محاولات دخول كتير في وقت قصير، حاول تاني بعد 15 دقيقة" },
      { status: 429 }
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: `${username}@store.local`,
    password,
  });

  if (error) {
    return NextResponse.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}