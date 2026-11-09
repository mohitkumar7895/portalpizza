"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Pizza,
  Store,
  Home,
  ExternalLink,
  Search,
  Copy,
  Check,
  QrCode,
  MessageCircle,
  Lock,
  Sun,
  Moon,
  Loader2,
  ShieldCheck,
  X,
  ArrowLeft,
  Menu,
} from "lucide-react";
import { http } from "@/services/http";

interface RestaurantItem {
  id: number;
  name: string;
  slug: string;
  ownerName: string;
  phone: string;
  status: string;
  createdAt?: string;
}

export default function LiveStoresPage() {
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [qrModalStore, setQrModalStore] = useState<RestaurantItem | null>(null);
  const [originUrl, setOriginUrl] = useState("http://localhost:3000");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOriginUrl(window.location.origin);
      const saved = localStorage.getItem("platform_theme") as "dark" | "light" | null;
      if (saved) setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("platform_theme", next);
  };

  const isDark = theme === "dark";

  const loadRestaurants = async () => {
    try {
      const { data } = await http.get<RestaurantItem[]>("/api/restaurants");
      setRestaurants(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const copyStoreUrl = (storeSlug: string) => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      navigator.clipboard.writeText(`${origin}/${storeSlug}`);
      setCopiedSlug(storeSlug);
      setTimeout(() => setCopiedSlug(null), 2000);
    }
  };

  const shareOnWhatsApp = (restaurant: RestaurantItem) => {
    if (typeof window !== "undefined") {
      const url = `${originUrl}/${restaurant.slug}`;
      const msg = encodeURIComponent(`Order delicious food online directly from ${restaurant.name}! Browse menu & order here: ${url}`);
      window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
    }
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return restaurants;
    const q = searchQuery.toLowerCase().trim();
    return restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q) ||
        r.phone.includes(q)
    );
  }, [restaurants, searchQuery]);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDark ? "bg-[#0a0c10] text-white" : "bg-neutral-50 text-neutral-900"}`}>
      {/* Navbar */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl transition-colors border-b ${isDark ? "bg-[#0a0c10]/90 border-neutral-800/80" : "bg-white/90 border-neutral-200"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3.5">
          <Link href="/" className="flex items-center gap-2 group min-w-0">
            <div className="relative h-11 w-11 sm:h-15 sm:w-15 shrink-0 overflow-hidden rounded-full ring-2.5 ring-[#ffde00] bg-white shadow-md group-hover:scale-105 transition">
              <Image
                src="/kya-khaugey.png"
                alt="Khaoge Kya?"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 44px, 60px"
                priority
              />
            </div>
            <div className="min-w-0">
              <span className={`font-black text-lg sm:text-xl tracking-tight block leading-tight truncate ${isDark ? "text-white" : "text-[#0b2545]"}`}>
                KHA<span className="text-[#e51b24]">OGE</span> KYA<span className="text-[#e51b24]">?</span>
              </span>
              <span className={`text-[9px] sm:text-[10px] font-bold tracking-wide uppercase truncate block max-w-[120px] min-[400px]:max-w-none ${isDark ? "text-[#ffde00]/90" : "text-[#e51b24]"}`}>
                Good Food For Good Moments
              </span>
            </div>
          </Link>

          <nav className={`hidden md:flex items-center gap-6 text-xs font-semibold ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
            <Link href="/" className="hover:text-red-500 transition flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <Link href="/features" className="hover:text-red-500 transition">
              Features
            </Link>
            <Link href="/how-it-works" className="hover:text-red-500 transition">
              How It Works
            </Link>
            <Link href="/stores" className="text-[#e60000] font-bold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Stores ({restaurants.length})</span>
            </Link>
            <Link href="/faq" className="hover:text-red-500 transition">
              FAQs
            </Link>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
              className={`p-1.5 sm:p-2 rounded-full border transition cursor-pointer ${
                isDark
                  ? "border-neutral-800 bg-neutral-900 text-amber-300 hover:bg-neutral-800"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 shadow-sm"
              }`}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <Link
              href="/admin/login"
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold transition shadow-xs ${
                isDark
                  ? "border-neutral-800 bg-neutral-900/80 text-neutral-200 hover:bg-neutral-800"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <Lock className="h-3.5 w-3.5 text-neutral-400" />
              <span>Login</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-linear-to-r from-[#e60000] to-orange-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white shadow-md hover:opacity-95 transition"
            >
              <Store className="h-3.5 w-3.5" />
              <span>Launch</span>
            </Link>

            {/* Mobile Hamburger Menu */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className={`p-1.5 rounded-xl border md:hidden transition cursor-pointer ${
                isDark
                  ? "border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 shadow-xs"
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileNavOpen && (
          <div
            className={`border-b md:hidden px-4 py-4 space-y-3 transition-all ${
              isDark
                ? "bg-[#0d1017] border-neutral-800 text-neutral-200"
                : "bg-white border-neutral-200 text-neutral-800 shadow-xl"
            }`}
          >
            <div className="flex flex-col gap-1 text-sm font-semibold">
              <Link
                href="/"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition"
              >
                <Home className="h-4 w-4 text-[#e51b24]" />
                <span>Home</span>
              </Link>
              <Link
                href="/features"
                onClick={() => setMobileNavOpen(false)}
                className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition"
              >
                Features
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setMobileNavOpen(false)}
                className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition"
              >
                How It Works
              </Link>
              <Link
                href="/stores"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition text-[#e60000]"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Stores ({restaurants.length})</span>
                </div>
                <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-[#e60000] px-2 py-0.5 rounded-full font-bold">
                  Active
                </span>
              </Link>
              <Link
                href="/faq"
                onClick={() => setMobileNavOpen(false)}
                className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition"
              >
                FAQs
              </Link>
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
              <Link
                href="/admin/login"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 py-2.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                <Lock className="h-3.5 w-3.5 text-neutral-400" />
                <span>Partner Admin Login</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
        <div>
          <Link
            href="/"
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              isDark
                ? "border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 shadow-xs"
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>← Back to Home</span>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Verified Network
            </span>
            <h1 className={`text-3xl sm:text-4xl font-black mt-2 tracking-tight ${isDark ? "text-white" : "text-neutral-900"}`}>
              Live Partner Restaurants
            </h1>
            <p className={`text-xs sm:text-sm mt-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              Browse active restaurant storefronts taking direct customer orders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search by name, slug, phone…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-full border pl-9 pr-4 py-2 text-xs outline-none transition ${
                  isDark
                    ? "bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500 focus:border-[#e60000]"
                    : "bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-[#e60000] shadow-sm"
                }`}
              />
            </div>
            <div className={`px-4 py-2 rounded-full border text-xs font-bold shrink-0 ${
              isDark ? "bg-neutral-900 border-neutral-800 text-neutral-300" : "bg-white border-neutral-300 text-neutral-700 shadow-sm"
            }`}>
              {restaurants.length} Active
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-[#e60000]" />
            <p className="text-xs text-neutral-400">Loading partner restaurants…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`rounded-3xl border border-dashed p-14 text-center ${
            isDark ? "border-neutral-800 text-neutral-500" : "border-neutral-300 text-neutral-500"
          }`}>
            <Store className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-bold">No active restaurants found matching your search.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <div
                key={r.id}
                className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 group ${
                  isDark
                    ? "bg-[#12141c] border-neutral-800 hover:border-neutral-700 shadow-xl"
                    : "bg-white border-neutral-200 hover:border-neutral-300 shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600/10 text-[#e60000] border border-red-500/20 group-hover:scale-105 transition">
                      <Store className="h-5 w-5" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Live Store
                    </span>
                  </div>

                  <h2 className={`font-black text-xl group-hover:text-red-500 transition ${isDark ? "text-white" : "text-neutral-900"}`}>
                    {r.name}
                  </h2>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-orange-500 font-bold">/{r.slug}</span>
                    <button
                      type="button"
                      onClick={() => copyStoreUrl(r.slug)}
                      title="Copy URL"
                      className={`p-1 rounded-md transition cursor-pointer ${
                        isDark ? "bg-neutral-900 text-neutral-400 hover:text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      }`}
                    >
                      {copiedSlug === r.slug ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>

                  {r.phone && (
                    <p className={`text-xs mt-3 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                      Contact: <span className="font-mono font-semibold">{r.phone}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-500/10">
                    <button
                      type="button"
                      onClick={() => setQrModalStore(r)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isDark ? "bg-neutral-900 text-neutral-300 hover:text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      <QrCode className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Table QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => shareOnWhatsApp(r)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition cursor-pointer"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-neutral-500/10 flex items-center justify-between gap-3">
                  <Link
                    href={`/${r.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-[#e60000] to-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-95 transition"
                  >
                    <span>Visit Store</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>

                  <Link
                    href={`/${r.slug}/admin`}
                    className={`inline-flex items-center gap-1 text-xs font-semibold hover:text-red-500 transition ${isDark ? "text-neutral-400" : "text-neutral-600"}`}
                  >
                    <Lock className="h-3 w-3" />
                    <span>Kitchen Admin</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* QR Modal */}
      {qrModalStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className={`relative w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl border ${
            isDark ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
          }`}>
            <button
              type="button"
              onClick={() => setQrModalStore(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-black">{qrModalStore.name}</h3>
            <p className="text-xs text-orange-500 font-mono mt-0.5">{originUrl}/{qrModalStore.slug}</p>

            <div className="my-5 p-4 rounded-2xl bg-white shadow-xl inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(originUrl + "/" + qrModalStore.slug)}`}
                alt={`${qrModalStore.name} QR Code`}
                className="w-48 h-48 mx-auto"
              />
            </div>

            <p className="text-xs text-neutral-500">
              Diners scan with any camera app to order directly.
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(originUrl + "/" + qrModalStore.slug)}`, "_blank");
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  isDark ? "bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800" : "bg-neutral-100 border-neutral-200 text-neutral-800 hover:bg-neutral-200"
                }`}
              >
                Print High-Res
              </button>
              <button
                type="button"
                onClick={() => copyStoreUrl(qrModalStore.slug)}
                className="flex-1 py-2 rounded-xl bg-linear-to-r from-[#e60000] to-orange-600 text-xs font-bold text-white hover:opacity-95 transition cursor-pointer"
              >
                {copiedSlug === qrModalStore.slug ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`py-10 text-xs transition-colors border-t ${isDark ? "bg-neutral-950 border-neutral-800 text-neutral-500" : "bg-neutral-100 border-neutral-200 text-neutral-600"}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="font-extrabold text-sm">PizzaHub Partner Platform</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-red-500">Home</Link>
            <Link href="/features" className="hover:text-red-500">Features</Link>
            <Link href="/how-it-works" className="hover:text-red-500">How It Works</Link>
            <Link href="/stores" className="hover:text-red-500">Live Stores</Link>
            <Link href="/faq" className="hover:text-red-500">FAQs</Link>
          </div>
          <p>© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
