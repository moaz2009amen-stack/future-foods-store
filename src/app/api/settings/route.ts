import { NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getStoreSettings();

  // بنرجّع بس الحقول اللي فعلاً محتاجينها في صفحات المتجر (السلة،
  // إتمام الطلب، التتبع). أرقام التتبع الإعلانية (Meta Pixel، GA4)
  // بتتحقن مباشرة من السيرفر في الـ layout ومحتاجاش تتعرض هنا خالص
  return NextResponse.json({
    store_name: settings.store_name,
    store_name_en: settings.store_name_en,
    logo_url: settings.logo_url,
    phone: settings.phone,
    address: settings.address,
    delivery_fee: settings.delivery_fee,
    min_order: settings.min_order,
    working_hours: settings.working_hours,
    banner_url: settings.banner_url,
    facebook_url: settings.facebook_url,
    instagram_url: settings.instagram_url,
    tiktok_url: settings.tiktok_url,
    website_url: settings.website_url,
    announcement: settings.announcement,
    announcement_enabled: settings.announcement_enabled,
    cash_payment_details: settings.cash_payment_details,
    instapay_account_name: settings.instapay_account_name,
    instapay_number: settings.instapay_number,
    wallet_account_name: settings.wallet_account_name,
    wallet_number: settings.wallet_number,
    whatsapp_number: settings.whatsapp_number,
    free_delivery_threshold: settings.free_delivery_threshold,
  });
}
