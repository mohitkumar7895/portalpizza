"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Receipt,
  Images,
  PanelTop,
  ExternalLink,
  Store,
  KeyRound,
  ArrowLeft,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { AdminLogoutButton } from "@/components/layout/AdminLogoutButton";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/navbar", label: "Navbar", icon: PanelTop },
  { href: "/admin/settings", label: "Site Settings", icon: Images },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/security", label: "Change Password", icon: KeyRound },
];

interface AdminInfo {
  id: string;
  username: string;
  restaurantId: number;
  restaurantSlug: string;
  restaurantName: string;
}

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ok && data.admin) {
          setAdminInfo(data.admin);
        }
      })
      .catch(() => {});
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const storeUrl = adminInfo?.restaurantSlug
    ? `/${adminInfo.restaurantSlug}`
    : "/";

  return (
    <div className="min-h-dvh bg-neutral-50 font-body text-neutral-900">
      {/* Mobile Top App Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-2.5 md:hidden shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-neutral-900 leading-tight truncate">
              {adminInfo?.restaurantName || "Partner Admin"}
            </h2>
            <p className="text-[10px] text-neutral-500 font-mono truncate">
              /{adminInfo?.restaurantSlug || "store"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#e60000] transition"
          >
            <Store className="h-3 w-3" />
            <span>Live</span>
            <ExternalLink className="h-2.5 w-2.5 opacity-70" />
          </a>
        </div>
      </header>

      {/* Mobile Navigation Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Content */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[80vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 p-4">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-[#e60000]">
              Partner Portal
            </span>
            <h3 className="mt-1 text-base font-black text-neutral-900 truncate">
              {adminInfo?.restaurantName || "Ad Pizza Hub"}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-900 transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-neutral-900 py-2.5 px-3 text-xs font-bold text-white hover:bg-[#e60000] transition"
          >
            <Store className="h-4 w-4" />
            <span>View Live Storefront</span>
            <ExternalLink className="h-3 w-3 opacity-70" />
          </a>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {nav.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin" || pathname === "/admin/(dashboard)"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                  isActive
                    ? "bg-[#e60000] text-white shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-neutral-100 p-4 space-y-2.5">
          {adminInfo?.username && (
            <div className="text-xs text-neutral-500">
              Logged in as: <strong className="text-neutral-900">@{adminInfo.username}</strong>
            </div>
          )}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Platform Home</span>
          </Link>
          <div className="pt-2">
            <AdminLogoutButton />
          </div>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="flex flex-col md:flex-row">
        {/* Desktop Sidebar (Hidden on mobile) */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:min-h-dvh md:border-r border-neutral-200 bg-white shadow-sm shrink-0">
          {/* Header */}
          <div className="border-b border-neutral-100 p-5">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition"
                title="Go to Platform Home"
              >
                ← Platform Home
              </Link>
            </div>

            <div className="mt-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-[#e60000]">
                Partner Portal
              </span>
              <h2 className="mt-2 text-xl font-black text-neutral-900 leading-tight">
                {adminInfo?.restaurantName || "Ad Pizza Hub"}
              </h2>
              <p className="text-xs text-neutral-500 font-mono">
                /{adminInfo?.restaurantSlug || "pizzahub"}
              </p>
            </div>

            {/* Direct Link to Live Storefront */}
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3.5 flex items-center justify-center gap-2 w-full rounded-xl bg-neutral-900 py-2.5 px-3 text-xs font-bold text-white shadow-sm hover:bg-[#e60000] transition-colors"
            >
              <Store className="h-4 w-4" />
              <span>View Live Store</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </a>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3">
            {nav.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin" || pathname === "/admin/(dashboard)"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-linear-to-r from-[#e60000]/10 to-transparent text-[#e60000] shadow-sm border-l-4 border-[#e60000]"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="border-t border-neutral-100 p-4">
            {adminInfo?.username && (
              <div className="mb-2 px-2 text-xs text-neutral-500">
                Logged in as: <span className="font-semibold text-neutral-800">@{adminInfo.username}</span>
              </div>
            )}
            <Link
              href="/super-admin/login"
              className="mb-2.5 flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-purple-600 hover:text-purple-700 hover:underline transition"
              title="Super Admin Management"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Super Admin Console</span>
            </Link>
            <AdminLogoutButton />
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Universal Admin Top Bar with Back Button */}
          <div className="hidden md:flex border-b border-neutral-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-3 items-center justify-between gap-4 sticky top-0 z-20">
            <div className="flex items-center gap-2.5">
              {pathname === "/admin" || pathname === "/admin/(dashboard)" ? (
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-bold text-neutral-700 shadow-xs hover:bg-neutral-50 hover:text-neutral-900 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>← Platform Home</span>
                </Link>
              ) : (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-bold text-neutral-700 shadow-xs hover:bg-neutral-50 hover:text-neutral-900 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>← Back to Dashboard</span>
                </Link>
              )}

              <span className="hidden sm:inline-block text-xs text-neutral-400 font-medium">
                • Store: <strong className="text-neutral-700">{adminInfo?.restaurantName || "Partner"}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#e60000] hover:underline"
              >
                <span>View Storefront</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="p-3 sm:p-5 lg:p-8 flex-1 pb-20 md:pb-8">{children}</div>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-neutral-200/80 bg-white/95 backdrop-blur-md px-1 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden pb-[max(0.375rem,env(safe-area-inset-bottom))]"
      >
        <Link
          href="/admin"
          className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
            pathname === "/admin" || pathname === "/admin/(dashboard)"
              ? "text-[#e60000] font-black"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 font-bold">Home</span>
        </Link>

        <Link
          href="/admin/orders"
          className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
            pathname.startsWith("/admin/orders")
              ? "text-[#e60000] font-black"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Receipt className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 font-bold">Orders</span>
        </Link>

        <Link
          href="/admin/products"
          className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
            pathname.startsWith("/admin/products")
              ? "text-[#e60000] font-black"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Package className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 font-bold">Products</span>
        </Link>

        <Link
          href="/admin/categories"
          className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
            pathname.startsWith("/admin/categories")
              ? "text-[#e60000] font-black"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <FolderTree className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 font-bold">Categories</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-xl text-neutral-500 hover:text-neutral-900 cursor-pointer"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 font-bold">More</span>
        </button>
      </nav>
    </div>
  );
}
