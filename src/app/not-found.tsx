import Link from "next/link";
import { PackageSearch } from "lucide-react";

export default function NotFound() {
  return (
    <div data-theme="red" className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-6">
          <PackageSearch className="w-9 h-9 text-accent" />
        </div>
        <h1 className="text-2xl font-extrabold mb-2">الصفحة مش موجودة</h1>
        <p className="text-muted mb-8">
          يمكن الرابط غلط أو الصفحة اتشالت. جرب ترجع للرئيسية وتكمل تسوقك من هناك.
        </p>
        <Link href="/" className="btn-accent inline-block rounded-full px-8 py-3 font-bold">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
