"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <aside className="w-56 shrink-0 bg-surface border-l border-border min-h-screen p-4 flex flex-col">
      <div className="mb-6">
        <div className="font-bold text-sm">{storeName}</div>
        <div className="text-xs text-muted mt-0.5">{username} · {role === "owner" ? "أونر" : "عامل"}</div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
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
  );
}
