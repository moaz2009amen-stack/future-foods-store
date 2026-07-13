import type { StoreSettings } from "@/types";

export default function StoreFooter({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="border-t border-border mt-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-3 text-sm">
        <div>
          <div className="font-bold mb-2">{settings.store_name}</div>
          <p className="text-muted">{settings.store_name_en}</p>
          {settings.working_hours && (
            <p className="text-muted mt-2">مواعيد العمل: {settings.working_hours}</p>
          )}
        </div>
        <div>
          <div className="font-bold mb-2">تواصل معنا</div>
          {settings.phone && <p className="text-muted">{settings.phone}</p>}
          {settings.address && <p className="text-muted mt-1">{settings.address}</p>}
        </div>
        <div>
          <div className="font-bold mb-2">التوصيل</div>
          <p className="text-muted">تكلفة التوصيل: {settings.delivery_fee} ج.م</p>
          <p className="text-muted mt-1">الحد الأدنى للطلب: {settings.min_order} ج.م</p>
        </div>
      </div>
      <div className="text-center text-xs text-muted border-t border-border py-4">
        © {new Date().getFullYear()} {settings.store_name_en} — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
