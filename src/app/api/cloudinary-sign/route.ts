import { NextResponse } from "next/server";
import crypto from "crypto";

// حماية بسيطة من إساءة استخدام الـ endpoint ده (طلب توقيعات كتير
// في وقت قصير). في الذاكرة بس فبيتصفر مع كل نشر جديد على Vercel،
// لكنه خط دفاع إضافي مفيد ضد سكريبتات آلية بسيطة
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 20;
const WINDOW_MS = 10 * 60 * 1000;

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

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(`cloudinary-sign:${ip}`)) {
    return NextResponse.json({ error: "محاولات كتير، حاول تاني بعد شوية" }, { status: 429 });
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!apiSecret || !apiKey || !cloudName) {
    return NextResponse.json({ error: "Cloudinary غير مُعد على السيرفر" }, { status: 500 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "future-foods-store";

  // القيم دي (المجلد والوقت) بتتحط جوه التوقيع نفسه، فمحدش من المتصفح
  // يقدر يغيّرها — أي محاولة تلاعب في المعاملات هتخلي التوقيع مش
  // متطابق وCloudinary هيرفض الرفع تلقائياً من غير ما يوصل لسيرفرنا أصلاً
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto.createHash("sha1").update(paramsToSign + apiSecret).digest("hex");

  return NextResponse.json({ timestamp, signature, folder, apiKey, cloudName });
}