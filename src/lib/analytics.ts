// دوال مساعدة لإرسال أحداث التتبع، بتتحقق إن fbq/gtag موجودين فعلاً
// قبل الاستدعاء (يعني لو الأونر ملحطش Pixel ID أو GA4 ID، الاستدعاءات
// دي بتتجاهل بهدوء من غير أي خطأ في الكونسول)

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

interface TrackParams {
  content_name?: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
  search_string?: string;
  num_items?: number;
}

export function trackPageView() {
  if (typeof window === "undefined") return;
  window.fbq?.("track", "PageView");
}

export function trackEvent(eventName: string, params?: TrackParams) {
  if (typeof window === "undefined") return;

  // فيسبوك بيكسل
  window.fbq?.("track", eventName, params);

  // GA4 — أسماء الأحداث بصيغة snake_case حسب توثيق جوجل
  const gaEventMap: Record<string, string> = {
    ViewContent: "view_item",
    Search: "search",
    AddToCart: "add_to_cart",
    InitiateCheckout: "begin_checkout",
    Purchase: "purchase",
  };
  const gaName = gaEventMap[eventName] ?? eventName;
  window.gtag?.("event", gaName, {
    ...(params?.value != null ? { value: params.value } : {}),
    ...(params?.currency ? { currency: params.currency } : {}),
    ...(params?.search_string ? { search_term: params.search_string } : {}),
  });
}
