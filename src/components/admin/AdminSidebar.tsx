"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Receipt,
  Users,
  Settings,
  LogOut,
  UserCircle,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";

const NAV_ITEMS: { href: string; label: string; icon: typeof LayoutDashboard; ownerOnly?: boolean }[] = [
  { href: "/admin/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/admin/orders", label: "الطلبات", icon: ClipboardList },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/invoices", label: "الفواتير", icon: Receipt },
  { href: "/admin/reports", label: "التقارير", icon: BarChart3, ownerOnly: true },
  { href: "/admin/users", label: "المستخدمون", icon: Users, ownerOnly: true },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings, ownerOnly: true },
  { href: "/admin/profile", label: "الملف الشخصي", icon: UserCircle },
];

export default function AdminSidebar({
  role,
  username,
  storeName,
}: {
  role: UserRole;
  username: string;
  storeName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // اقفل الـ Drawer تلقائياً كل ما تنتقل لصفحة تانية
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <>
      {/* شريط علوي يظهر بس في الموبايل */}
      <div className="sm:hidden sticky top-0 z-30 bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="font-bold text-sm">{storeName}</div>
        <button onClick={() => setOpen(true)} className="p-2" aria-label="فتح القائمة">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* خلفية معتمة تقفل الـ Drawer لما تضغط عليها (موبايل بس) */}
      {open && (
        <div
          className="sm:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          w-64 sm:w-56 shrink-0 bg-surface border-l border-border p-4 flex flex-col
          fixed sm:static inset-y-0 right-0 z-50 sm:z-auto
          transition-transform duration-200
          ${open ? "translate-x-0" : "translate-x-full sm:translate-x-0"}
          sm:min-h-screen
        `}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="font-bold text-sm">{storeName}</div>
            <div className="text-xs text-muted mt-0.5">{username} · {role === "owner" ? "أونر" : "عامل"}</div>
          </div>
          <button onClick={() => setOpen(false)} className="sm:hidden p-1" aria-label="إغلاق القائمة">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {NAV_ITEMS.filter((item) => !item.ownerOnly || role === "owner").map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? "btn-accent" : "text-muted hover:bg-surface2 hover:text-text"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-danger hover:bg-surface2"
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </aside>
    </>
  );
}
