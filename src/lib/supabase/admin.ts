import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// تحذير: لا يجب استيراد هذا الملف إلا داخل route handlers (مسارات /api)
// لأنه يستخدم SERVICE_ROLE_KEY التي تملك صلاحيات كاملة على قاعدة البيانات
// ولا يجب أبداً كشفها في كود المتصفح (Client Components).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
