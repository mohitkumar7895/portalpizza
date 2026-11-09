"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  FolderTree,
  Receipt,
  Clock,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Store,
  Images,
  PanelTop,
} from "lucide-react";
import { fetchProducts } from "@/services/products";
import { fetchCategories } from "@/services/categories";
import { fetchOrdersAdmin } from "@/services/orders";

export default function AdminHomePage() {
  const [counts, setCounts] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    pending: 0,
  });
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, c] = await Promise.all([fetchProducts(), fetchCategories()]);
        let o: Awaited<ReturnType<typeof fetchOrdersAdmin>> = [];
        try {
          o = await fetchOrdersAdmin();
        } catch {
          setErr("Could not load orders. Sign in again if your session expired.");
        }
        setCounts({
          products: p.length,
          categories: c.length,
          orders: o.length,
          pending: o.filter((x) => x.status === "pending").length,
        });
      } catch {
        setErr("Could not load data. Check MySQL and network.");
      }
    })();
  }, []);

  const cards = [
    {
      label: "Pending Orders",
      value: counts.pending,
      href: "/admin/orders",
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      accent: counts.pending > 0 ? "text-amber-600" : "text-neutral-700",
      badge: counts.pending > 0 ? "Requires Action" : "All Clear",
      badgeColor: counts.pending > 0 ? "bg-amber-100 text-amber-800" : "bg-neutral-100 text-neutral-600",
    },
    {
      label: "Total Orders",
      value: counts.orders,
      href: "/admin/orders",
      icon: Receipt,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      accent: "text-blue-600",
      badge: "Lifetime",
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      label: "Menu Products",
      value: counts.products,
      href: "/admin/products",
      icon: Package,
      color: "text-[#e60000] bg-red-50 border-red-200",
      accent: "text-[#e60000]",
      badge: "Live Items",
      badgeColor: "bg-red-100 text-[#e60000]",
    },
    {
      label: "Categories",
      value: counts.categories,
      href: "/admin/categories",
      icon: FolderTree,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      accent: "text-emerald-600",
      badge: "Sections",
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-neutral-500">
            Real-time management for your store&apos;s menu, orders, and storefront.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1 sm:pt-0">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#e60000] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#c70000] transition active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-bold text-neutral-800 shadow-xs hover:bg-neutral-50 transition active:scale-95"
          >
            <Receipt className="h-4 w-4" />
            <span>View Orders</span>
          </Link>
        </div>
      </div>

      {err && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs sm:text-sm text-amber-900">
          {err}{" "}
          <Link href="/admin/login" className="font-bold underline">
            Login again
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-neutral-300"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl border ${c.color} transition-transform group-hover:scale-110`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9.5px] sm:text-[11px] font-bold ${c.badgeColor}`}
                >
                  {c.badge}
                </span>
              </div>

              <div className="mt-3 sm:mt-4">
                <p className="text-[11px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  {c.label}
                </p>
                <p
                  className={`mt-1 text-2xl sm:text-3xl font-black tabular-nums tracking-tight ${c.accent}`}
                >
                  {c.value}
                </p>
              </div>

              <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-neutral-400 group-hover:text-neutral-900 transition-colors">
                <span>Manage</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Access Shortcuts */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-[#e60000]" />
          <h2 className="text-sm sm:text-base font-bold text-neutral-900">
            Quick Store Management
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3.5">
          <Link
            href="/admin/products"
            className="flex items-center gap-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3 text-left transition hover:bg-neutral-100 hover:border-neutral-300"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs text-neutral-700">
              <Package className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-900 truncate">Products</p>
              <p className="text-[10px] text-neutral-500 truncate">Menu catalogue</p>
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="flex items-center gap-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3 text-left transition hover:bg-neutral-100 hover:border-neutral-300"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs text-neutral-700">
              <FolderTree className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-900 truncate">Categories</p>
              <p className="text-[10px] text-neutral-500 truncate">Organize menu</p>
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="flex items-center gap-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3 text-left transition hover:bg-neutral-100 hover:border-neutral-300"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs text-neutral-700">
              <Images className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-900 truncate">Banners & Info</p>
              <p className="text-[10px] text-neutral-500 truncate">Hero banners, QR</p>
            </div>
          </Link>

          <Link
            href="/admin/navbar"
            className="flex items-center gap-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3 text-left transition hover:bg-neutral-100 hover:border-neutral-300"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs text-neutral-700">
              <PanelTop className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-900 truncate">Navbar & Logo</p>
              <p className="text-[10px] text-neutral-500 truncate">Branding & phone</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
