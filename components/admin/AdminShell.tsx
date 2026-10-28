"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Mail,
  Wrench,
  FileText,
  Images,
  Settings,
  LogOut,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
const links = [
  ["/admin", "Overview", LayoutDashboard],
  ["/admin/bookings", "Bookings", CalendarDays],
  ["/admin/enquiries", "Enquiries", Mail],
  ["/admin/services", "Services", Wrench],
  ["/admin/pages", "Page content", FileText],
  ["/admin/media", "Media library", Images],
  ["/admin/settings", "Site settings", Settings],
] as const;
export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  async function logout() {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      router.push("/admin/login");
      router.refresh();
    } else toast.error("Unable to sign out. Please try again.");
  }
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          COPENHAGEN<span>SERVICE & REPAIR / ADMIN</span>
        </Link>
        <p className="admin-section-label">WORKSPACE</p>
        <nav>
          {links.map(([href, label, Icon]) => (
            <Link
              href={href}
              className={path === href ? "selected" : ""}
              key={href}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/" target="_blank">
            <ArrowUpRight size={17} />
            View website
          </Link>
          <button onClick={logout}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span>
            Copenhagen /{" "}
            <strong>{links.find(([h]) => h === path)?.[1] || "Admin"}</strong>
          </span>
          <span className="admin-status">
            <span className="status-dot" />
            ADMIN WORKSPACE
          </span>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
