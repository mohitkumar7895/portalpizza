"use client";

import { useEffect, useState, useId } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Store,
  Pizza,
  Home,
  ArrowRight,
  ShieldCheck,
  UtensilsCrossed,
  ChefHat,
  Lock,
  X,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Clock,
  Loader2,
  Star,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  ChevronDown,
  LogIn,
  User,
  Menu,
} from "lucide-react";
import { http } from "@/services/http";

export default function PlatformLandingPage() {
  // Theme state
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Modal State for "Launch Store"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState<boolean>(false);
  const [registeredStoreData, setRegisteredStoreData] = useState<{ name: string; slug: string; phone: string } | null>(null);

  // Registration Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const restNameId = useId();
  const restSlugId = useId();
  const ownerNameId = useId();
  const phoneId = useId();
  const adminUserId = useId();
  const adminPassId = useId();

  const [partnerLoggedIn, setPartnerLoggedIn] = useState(false);
  const [superAdminLoggedIn, setSuperAdminLoggedIn] = useState(false);
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("platform_theme") as "dark" | "light" | null;
      if (saved) setTheme(saved);
    }

    http
      .get<{ ok: boolean }>("/api/admin/me")
      .then((res) => {
        if (res.data?.ok) setPartnerLoggedIn(true);
      })
      .catch(() => {});

    http
      .get<{ authenticated: boolean }>("/api/super-admin/me")
      .then((res) => {
        if (res.data?.authenticated) setSuperAdminLoggedIn(true);
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("platform_theme", next);
  };

  const isDark = theme === "dark";

  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  // Auto-generate slug strictly from restaurant name (user cannot edit slug directly)
  const handleNameChange = (val: string) => {
    setName(val);
    const generated = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generated);
  };

  useEffect(() => {
    if (!slug || slug.length < 2) {
      setSlugAvailable(null);
      return;
    }
    setCheckingSlug(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/partner/check-slug?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        setSlugAvailable(data.available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setCheckingSlug(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [slug]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await http.post<{ ok: boolean; pending?: boolean; restaurantSlug?: string; message?: string }>(
        "/api/partner/register",
        {
          name,
          slug,
          ownerName,
          phone,
          username,
          password,
        }
      );

      if (res.data.ok) {
        setRegisteredStoreData({ name, slug, phone });
        setRegistrationComplete(true);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        "Failed to register partner restaurant. Please try again.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setRegistrationComplete(false);
    setName("");
    setSlug("");
    setSlugEdited(false);
    setOwnerName("");
    setPhone("");
    setUsername("");
    setPassword("");
    setErrorMsg(null);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 selection:bg-[#e60000] selection:text-white ${
      isDark ? "bg-[#0a0c10] text-white" : "bg-neutral-50 text-neutral-900"
    }`}>
      {/* Top Navbar */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl transition-colors ${
        isDark ? "bg-[#0a0c10]/90 border-b border-neutral-800/60" : "bg-white/90 border-b border-neutral-200/80"
      }`}>
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
            <Link href="/" className="hover:text-red-500 transition flex items-center gap-1.5 font-bold">
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <Link href="/features" className="hover:text-red-500 transition">
              Features
            </Link>
            <Link href="/how-it-works" className="hover:text-red-500 transition">
              How It Works
            </Link>
            <Link href="/stores" className="hover:text-red-500 transition flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Stores</span>
            </Link>
            <Link href="/faq" className="hover:text-red-500 transition">
              FAQs
            </Link>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Dark / Light Theme Toggle */}
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

            {partnerLoggedIn ? (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-[#e51b24] to-[#f58220] px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white shadow-md shadow-red-500/25 hover:opacity-95 transition"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold transition shadow-xs ${
                  isDark
                    ? "border-neutral-800 bg-neutral-900/80 text-neutral-200 hover:bg-neutral-800"
                    : "border-[#0b2545]/20 bg-white text-[#0b2545] hover:text-[#e51b24] hover:border-[#ffde00] hover:bg-[#ffde00]/15"
                }`}
                title="Partner Store Login"
              >
                <LogIn className="h-3.5 w-3.5 text-[#e51b24]" />
                <span>Login</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => {
                setRegistrationComplete(false);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-linear-to-r from-[#e60000] to-orange-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white shadow-md shadow-red-500/30 hover:opacity-95 hover:scale-[1.02] transition cursor-pointer"
            >
              <Store className="h-3.5 w-3.5" />
              <span>Launch</span>
            </button>

            {/* Mobile Hamburger Toggle Button */}
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

        {/* Mobile Navigation Dropdown Menu */}
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
                  <span>Live Stores</span>
                </div>
                <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-[#e60000] px-2 py-0.5 rounded-full font-bold">
                  Browse
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
                <LogIn className="h-3.5 w-3.5 text-[#e51b24]" />
                <span>Partner Admin Login</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  setRegistrationComplete(false);
                  setIsModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#e60000] to-orange-600 py-2.5 text-xs font-bold text-white shadow-md shadow-red-500/30 transition cursor-pointer"
              >
                <Store className="h-3.5 w-3.5" />
                <span>Launch Restaurant Store</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section: Image ON TOP, Headline & Action Buttons BELOW */}
      <section className="relative overflow-hidden pt-4 pb-8 sm:pt-6 sm:pb-12 md:pt-8 md:pb-14">
        {/* Ambient background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-600/10 blur-[160px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[280px] bg-orange-600/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-7xl px-3 sm:px-6">
          {/* 1. Full-Width Visual Showcase Banner Image ON TOP */}
          <div className="mx-auto max-w-5xl relative">
            <div className={`relative group rounded-2xl sm:rounded-3xl p-1.5 sm:p-3 shadow-xl sm:shadow-2xl backdrop-blur-md overflow-hidden border ${
              isDark ? "bg-neutral-900/70 border-neutral-800/80 shadow-black/80" : "bg-white/80 border-neutral-200 shadow-xl"
            }`}>
              {/* Top gradient highlight bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-red-600 via-orange-500 to-amber-400 rounded-t-2xl sm:rounded-t-3xl" />

              {/* The Cinematic High-Tech Visual Banner */}
              <div className={`relative aspect-16/9 sm:aspect-21/9 w-full overflow-hidden rounded-xl sm:rounded-2xl border ${
                isDark ? "border-neutral-800/90 bg-neutral-950" : "border-neutral-200 bg-neutral-100"
              }`}>
                <img
                  src="/partner-platform-hero.jpg"
                  alt="Partner Platform Showcase"
                  className="h-full w-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
                />
                <div className={`absolute inset-0 ${isDark ? "bg-linear-to-t from-neutral-950/70 via-transparent to-neutral-950/20" : "bg-linear-to-t from-neutral-900/30 via-transparent to-transparent"}`} />

                {/* Mobile top pill badge */}
                <div className="absolute top-2.5 left-2.5 sm:hidden">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/75 border border-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md shadow-xs">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <span>Restaurant Partner Hub</span>
                  </span>
                </div>
              </div>

              {/* Floating Action Bar (Shown on tablet/desktop, clean and non-blocking) */}
              <div className={`hidden sm:flex absolute bottom-4 left-4 right-4 z-20 flex-row items-center justify-between gap-3 rounded-2xl px-4 py-2.5 md:px-5 md:py-3 shadow-2xl backdrop-blur-md border ${
                isDark ? "bg-neutral-950/95 border-neutral-800/90" : "bg-white/95 border-neutral-200"
              }`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-600/20 text-[#e60000] border border-red-500/30">
                    <ChefHat className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className={`text-xs font-bold leading-tight ${isDark ? "text-white" : "text-neutral-900"}`}>
                      Ready to get your restaurant online?
                    </p>
                    <p className={`text-[11px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                      Register in 2 minutes • Verified partner onboarding
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRegistrationComplete(false);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#e60000] to-orange-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:opacity-90 transition cursor-pointer"
                >
                  <Store className="h-3.5 w-3.5" />
                  <span>Launch Restaurant Store</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Headline & Action Buttons BELOW the Image */}
          <div className="mt-5 sm:mt-8 md:mt-10 mx-auto max-w-5xl text-center space-y-3 sm:space-y-4">
            <h1 className="text-2xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl leading-[1.2]">
              <span className={`block whitespace-normal sm:whitespace-nowrap drop-shadow-sm ${isDark ? "text-white" : "text-neutral-900"}`}>
                Launch Your Branded Restaurant Store
              </span>
              <span className="block mt-1 sm:mt-2 bg-linear-to-r from-red-500 via-orange-400 to-amber-300 bg-clip-text text-transparent font-black tracking-tight drop-shadow-md">
                in 2 Minutes.
              </span>
            </h1>

            <p className={`text-xs sm:text-base max-w-xl mx-auto leading-relaxed ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
              Get your custom ordering link (<span className="text-orange-500 font-mono font-bold">/[your-slug]</span>) and a dedicated live kitchen admin dashboard. Direct orders with 100% profit.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 pt-1.5 sm:pt-2">
              <button
                type="button"
                onClick={() => {
                  setRegistrationComplete(false);
                  setIsModalOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#e60000] to-orange-600 px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-red-600/30 hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                <Store className="h-4 w-4" />
                <span>Launch Your Store (Free)</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                href="/pizzahub"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold shadow-sm active:scale-95 transition ${
                  isDark
                    ? "border-neutral-700 bg-neutral-900/80 text-neutral-200 hover:bg-neutral-800"
                    : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100"
                }`}
              >
                <UtensilsCrossed className="h-4 w-4 text-[#e60000]" />
                <span>Preview Demo Store</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Nav Cards: Direct Links to Dedicated Pages */}
      <section className="py-6 sm:py-8 md:py-10">
        <div className="mx-auto max-w-6xl px-3 sm:px-6">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            <Link
              href="/features"
              className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-200 hover:scale-[1.02] group ${
                isDark ? "bg-[#11131a] border-neutral-800/80 hover:border-red-500/40" : "bg-white border-neutral-200 hover:border-red-500/40 shadow-sm"
              }`}
            >
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-red-600/15 text-[#e60000] mb-2 sm:mb-3">
                <Store className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h3 className={`font-black text-xs sm:text-base group-hover:text-red-500 transition ${isDark ? "text-white" : "text-neutral-900"}`}>
                Platform Features →
              </h3>
              <p className={`line-clamp-2 text-[10px] sm:text-xs mt-1 leading-relaxed ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Explore the customer storefront, kitchen display, and menu manager.
              </p>
            </Link>

            <Link
              href="/how-it-works"
              className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-200 hover:scale-[1.02] group ${
                isDark ? "bg-[#11131a] border-neutral-800/80 hover:border-orange-500/40" : "bg-white border-neutral-200 hover:border-orange-500/40 shadow-sm"
              }`}
            >
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-orange-600/15 text-orange-500 mb-2 sm:mb-3">
                <ChefHat className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h3 className={`font-black text-xs sm:text-base group-hover:text-orange-500 transition ${isDark ? "text-white" : "text-neutral-900"}`}>
                How It Works →
              </h3>
              <p className={`line-clamp-2 text-[10px] sm:text-xs mt-1 leading-relaxed ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Simple 3-step setup: register, get verified, and take direct orders.
              </p>
            </Link>

            <Link
              href="/stores"
              className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-200 hover:scale-[1.02] group ${
                isDark ? "bg-[#11131a] border-neutral-800/80 hover:border-emerald-500/40" : "bg-white border-neutral-200 hover:border-emerald-500/40 shadow-sm"
              }`}
            >
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-600/15 text-emerald-500 mb-2 sm:mb-3">
                <UtensilsCrossed className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h3 className={`font-black text-xs sm:text-base group-hover:text-emerald-500 transition ${isDark ? "text-white" : "text-neutral-900"}`}>
                Live Stores Directory →
              </h3>
              <p className={`line-clamp-2 text-[10px] sm:text-xs mt-1 leading-relaxed ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Browse active restaurant partner storefronts and table QR codes.
              </p>
            </Link>

            <Link
              href="/faq"
              className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-200 hover:scale-[1.02] group ${
                isDark ? "bg-[#11131a] border-neutral-800/80 hover:border-purple-500/40" : "bg-white border-neutral-200 hover:border-purple-500/40 shadow-sm"
              }`}
            >
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-purple-600/15 text-purple-400 mb-2 sm:mb-3">
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h3 className={`font-black text-xs sm:text-base group-hover:text-purple-400 transition ${isDark ? "text-white" : "text-neutral-900"}`}>
                Got Questions? →
              </h3>
              <p className={`line-clamp-2 text-[10px] sm:text-xs mt-1 leading-relaxed ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Read answers about 0% commission, domains, and data isolation.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section (No harsh borders, smooth transition) */}
      <section className="py-6 sm:py-10">
        <div className="mx-auto max-w-4xl px-3 sm:px-6 text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/20 px-3.5 py-1 text-xs font-bold text-red-400">
            <ChefHat className="h-3.5 w-3.5 text-[#e60000]" />
            <span>Join Forward-Thinking Restaurant Partners</span>
          </div>

          <h2 className={`text-2xl sm:text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-neutral-900"}`}>
            Ready to Take Your Restaurant Online?
          </h2>

          <p className={`text-xs sm:text-base max-w-xl mx-auto leading-relaxed ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
            Register today and launch your branded food ordering website and kitchen admin dashboard in just 2 minutes!
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5">
            <button
              type="button"
              onClick={() => {
                setRegistrationComplete(false);
                setIsModalOpen(true);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#e60000] to-orange-600 px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-red-600/30 hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <Store className="h-4 w-4" />
              <span>Launch Your Store Now (Free)</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <Link
              href="/admin/login"
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold active:scale-95 transition ${
                isDark ? "border-neutral-700 bg-neutral-900/90 text-neutral-200 hover:bg-neutral-800" : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100"
              }`}
            >
              <Lock className="h-4 w-4 text-orange-400" />
              <span>Partner Admin Login</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Food Categories Showcase Section (Pizzas, Snacks, Meals/Khana Bagera) */}
      <section className="py-6 sm:py-10">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 space-y-6 sm:space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Built for Every Restaurant Concept
            </span>
            <h2 className={`text-2xl sm:text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-neutral-900"}`}>
              Pizzas, Snacks, Burgers & Full-Course Meals
            </h2>
            <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              Whether you run a specialty pizzeria, a fast-casual snack & burger joint, or a family dining multi-cuisine restaurant ("Khana Bagera") — our platform adapts seamlessly to your cuisine.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {/* Card 1: Pizzas & Italian */}
            <div className={`rounded-2xl sm:rounded-3xl border overflow-hidden shadow-lg sm:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group ${
              isDark ? "bg-[#11131a] border-neutral-800" : "bg-white border-neutral-200"
            }`}>
              <div>
                <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-900">
                  <img
                    src="/food-pizza.jpg"
                    alt="Pizzas & Italian Dining Showcase"
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-950/90 border border-red-700/80 px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-bold text-red-300 backdrop-blur-md">
                      🍕 Pizzerias & Italian
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-2">
                  <h3 className={`font-black text-lg sm:text-xl ${isDark ? "text-white" : "text-neutral-900"}`}>
                    Pizzas, Crusts & Italian Bistros
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    Designed for artisan pizzerias & cloud kitchens. Supports crust customization (Cheese Burst, Thin Crust), gourmet toppings, and size pricing (Regular, Medium, Large).
                  </p>
                  <ul className={`text-[11px] space-y-1.5 pt-1.5 ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Veg & Non-Veg badge tagging</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Extra cheese & dipping sauce add-ons</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 pt-0 sm:p-6 sm:pt-0">
                <Link
                  href="/pizzahub"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-[#e60000] to-orange-600 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 active:scale-95 transition"
                >
                  <span>Explore Pizza Demo</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Snacks, Burgers & Fast Food */}
            <div className={`rounded-2xl sm:rounded-3xl border overflow-hidden shadow-lg sm:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group ${
              isDark ? "bg-[#11131a] border-neutral-800" : "bg-white border-neutral-200"
            }`}>
              <div>
                <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-900">
                  <img
                    src="/food-snacks.jpg"
                    alt="Snacks, Burgers & Fast Food Showcase"
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-950/90 border border-orange-700/80 px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-bold text-orange-300 backdrop-blur-md">
                      🍔 Cafes & Fast Food
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-2">
                  <h3 className={`font-black text-lg sm:text-xl ${isDark ? "text-white" : "text-neutral-900"}`}>
                    Burgers, Snacks & Quick Bites
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    Engineered for quick-service burger points, cafe snack bars, loaded fries, cold shakes, and wraps. Ultra-fast add-to-cart and speedy checkout flow.
                  </p>
                  <ul className={`text-[11px] space-y-1.5 pt-1.5 ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Meal combos & beverage pairing</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Instant mobile cart & table QR ordering</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 pt-0 sm:p-6 sm:pt-0">
                <button
                  type="button"
                  onClick={() => {
                    setRegistrationComplete(false);
                    setIsModalOpen(true);
                  }}
                  className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                    isDark ? "border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800" : "border-neutral-300 bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                  }`}
                >
                  <Store className="h-3.5 w-3.5 text-orange-500" />
                  <span>Launch Snack & Cafe Store</span>
                </button>
              </div>
            </div>

            {/* Card 3: Multi-Cuisine Meals ("Khana Bagera") */}
            <div className={`rounded-2xl sm:rounded-3xl border overflow-hidden shadow-lg sm:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group ${
              isDark ? "bg-[#11131a] border-neutral-800" : "bg-white border-neutral-200"
            }`}>
              <div>
                <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-900">
                  <img
                    src="/food-meals.jpg"
                    alt="Multi-Cuisine Meals and Indian Dining Showcase"
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/90 border border-emerald-700/80 px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-bold text-emerald-300 backdrop-blur-md">
                      🍛 Meals & Dining ("Khana")
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-2">
                  <h3 className={`font-black text-lg sm:text-xl ${isDark ? "text-white" : "text-neutral-900"}`}>
                    Meals, Curries & Fine Dining
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    Ideal for full-service family dining restaurants, dhaba eateries, and multi-cuisine kitchens serving fragrant biryanis, gravies, thalis, and tandoori specials.
                  </p>
                  <ul className={`text-[11px] space-y-1.5 pt-1.5 ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Full multi-course category menus</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Contactless table standee ordering</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 pt-0 sm:p-6 sm:pt-0">
                <button
                  type="button"
                  onClick={() => {
                    setRegistrationComplete(false);
                    setIsModalOpen(true);
                  }}
                  className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                    isDark ? "border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800" : "border-neutral-300 bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                  }`}
                >
                  <Store className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Launch Restaurant Store</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section (Loved by Restaurant Owners) */}
      <section className="py-6 sm:py-10">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 space-y-6 sm:space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 text-[#e60000] px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
              Partner Success Stories
            </span>
            <h2 className={`text-2xl sm:text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-neutral-900"}`}>
              Loved by Restaurant Owners
            </h2>
            <p className={`text-xs sm:text-sm max-w-lg mx-auto leading-relaxed ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              Hear from culinary entrepreneurs who switched from third-party commission cuts to direct orders.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-lg sm:shadow-xl flex flex-col justify-between transition-colors ${
              isDark ? "bg-[#12141c] border-neutral-800" : "bg-white border-neutral-200"
            }`}>
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-2 sm:mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-amber-400" />
                  ))}
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed italic ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                  "We were paying over ₹40,000 every month in commissions to delivery apps. Launching our own store link cut our aggregator dependence dramatically. We now get 60% of our orders directly on our custom link with 0% commission!"
                </p>
              </div>
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-neutral-500/10 flex items-center gap-3">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-red-600/20 text-[#e60000] text-xs sm:text-sm font-bold flex items-center justify-center">
                  RP
                </div>
                <div>
                  <p className={`text-xs font-bold ${isDark ? "text-white" : "text-neutral-900"}`}>Rahul Patel</p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400">Founder, Royal Pizza Hub</p>
                </div>
              </div>
            </div>

            <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-lg sm:shadow-xl flex flex-col justify-between transition-colors ${
              isDark ? "bg-[#12141c] border-neutral-800" : "bg-white border-neutral-200"
            }`}>
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-2 sm:mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-amber-400" />
                  ))}
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed italic ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                  "The table QR code feature is incredible for our dine-in cafe guests. Customers scan the table standee, choose their burger toppings & shakes, and the kitchen receives tickets with audio chimes immediately."
                </p>
              </div>
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-neutral-500/10 flex items-center gap-3">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-orange-600/20 text-orange-500 text-xs sm:text-sm font-bold flex items-center justify-center">
                  AS
                </div>
                <div>
                  <p className={`text-xs font-bold ${isDark ? "text-white" : "text-neutral-900"}`}>Aman Sharma</p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400">Owner, Crust & Slice Cafe</p>
                </div>
              </div>
            </div>

            <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-lg sm:shadow-xl flex flex-col justify-between transition-colors ${
              isDark ? "bg-[#12141c] border-neutral-800" : "bg-white border-neutral-200"
            }`}>
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-2 sm:mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-amber-400" />
                  ))}
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed italic ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                  "What I love most for our dining restaurant is owning customer phone numbers. With aggregators, customer numbers were hidden. Now we have our own database and send weekend thali and curry specials on WhatsApp!"
                </p>
              </div>
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-neutral-500/10 flex items-center gap-3">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-emerald-600/20 text-emerald-500 text-xs sm:text-sm font-bold flex items-center justify-center">
                  AK
                </div>
                <div>
                  <p className={`text-xs font-bold ${isDark ? "text-white" : "text-neutral-900"}`}>Ananya Kapoor</p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400">Owner, Royal Rasoi & Dining</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-6 sm:py-8 text-xs transition-colors ${
        isDark ? "bg-[#07090e] text-neutral-500" : "bg-neutral-100 text-neutral-600"
      }`}>
        <div className="mx-auto max-w-7xl px-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 sm:h-13 sm:w-13 shrink-0 overflow-hidden rounded-full ring-2 sm:ring-2.5 ring-[#ffde00] bg-white shadow-sm">
              <Image
                src="/kya-khaugey.png"
                alt="Khaoge Kya?"
                fill
                className="object-cover"
                sizes="52px"
              />
            </div>
            <div>
              <p className={`font-black text-sm ${isDark ? "text-white" : "text-[#0b2545]"}`}>
                Khaoge <span className="text-[#e51b24]">Kya?</span>
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#ffde00]">
                Good Food For Good Moments
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-6">
            <Link href="/features" className="hover:text-red-500 transition">Features</Link>
            <Link href="/how-it-works" className="hover:text-red-500 transition">How It Works</Link>
            <Link href="/stores" className="hover:text-red-500 transition">Live Stores</Link>
            <Link href="/faq" className="hover:text-red-500 transition">FAQs</Link>
            <Link href="/super-admin/login" className="text-purple-400 hover:text-purple-300 font-bold transition">Super Admin</Link>
          </div>

          <p className="text-[11px]">© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>

      {/* Modal Dialog: "Launch Store" / Partner Registration Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border transition-colors ${
            isDark ? "bg-neutral-950 border-neutral-800 text-white shadow-red-950/40" : "bg-white border-neutral-200 text-neutral-900 shadow-2xl"
          }`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-red-600 via-orange-500 to-amber-400 rounded-t-3xl" />

            <button
              type="button"
              onClick={resetModal}
              className={`absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border transition cursor-pointer ${
                isDark ? "border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white" : "border-neutral-200 bg-neutral-100 text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <X className="h-4 w-4" />
            </button>

            {registrationComplete && registeredStoreData ? (
              <div className="text-center py-4 space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  <Clock className="h-8 w-8 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                    Registration Received
                  </span>
                  <h2 className="text-2xl font-black">
                    {registeredStoreData.name}
                  </h2>
                  <p className="font-mono text-xs text-orange-500 font-bold">/{registeredStoreData.slug}</p>
                </div>

                <div className={`p-4 rounded-2xl border text-left text-xs space-y-2 ${
                  isDark ? "border-neutral-800 bg-neutral-900/80 text-neutral-300" : "border-neutral-200 bg-neutral-50 text-neutral-700"
                }`}>
                  <p className="font-bold text-amber-500 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Pending Super Admin Verification</span>
                  </p>
                  <p className="leading-relaxed text-[11px] opacity-80">
                    Thank you for registering! Our platform super administrator will review your application and contact you at <strong className="font-mono">{registeredStoreData.phone || "your number"}</strong> to verify your store details and activate your account.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={resetModal}
                    className="px-6 py-2.5 rounded-xl bg-linear-to-r from-[#e60000] to-orange-600 text-xs font-bold text-white hover:opacity-95 transition cursor-pointer"
                  >
                    Done (Close)
                  </button>
                  <Link
                    href="/super-admin/login"
                    className="px-4 py-2.5 rounded-xl border border-purple-800/80 bg-purple-950/60 text-xs font-bold text-purple-300 hover:bg-purple-900 transition"
                  >
                    Super Admin Login
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-5 pr-8">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600/20 text-[#e60000] border border-red-500/30">
                    <ChefHat className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-xl">Partner Registration</h2>
                    <p className={`text-xs ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                      Launch your store • Verified onboarding
                    </p>
                  </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div>
                    <label htmlFor={restNameId} className="block text-xs font-semibold mb-1">
                      Restaurant Name *
                    </label>
                    <input
                      id={restNameId}
                      required
                      type="text"
                      placeholder="e.g. Royal Pizza Hub or Domino Delight"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                        isDark ? "border-neutral-800 bg-neutral-900 text-white placeholder-neutral-500 focus:border-[#e60000]" : "border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:border-[#e60000]"
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor={restSlugId} className="block text-xs font-semibold">
                        Your Unique Store URL *
                      </label>
                      <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Auto-Generated • Locked (Cannot Change)
                      </span>
                    </div>

                    <div className={`flex items-center rounded-xl border overflow-hidden ${
                      isDark ? "border-neutral-800 bg-neutral-950/80" : "border-neutral-300 bg-neutral-100/90"
                    }`}>
                      <span className={`px-3 text-xs font-mono select-none py-2.5 border-r ${
                        isDark ? "text-neutral-500 bg-neutral-900 border-neutral-800" : "text-neutral-500 bg-neutral-200/70 border-neutral-300"
                      }`}>
                        /
                      </span>
                      <input
                        id={restSlugId}
                        required
                        readOnly
                        tabIndex={-1}
                        type="text"
                        placeholder="auto-generated-from-name"
                        value={slug}
                        className="w-full bg-transparent px-3 py-2.5 text-sm outline-none font-mono cursor-not-allowed select-all text-neutral-500 font-bold"
                      />
                      <div className="px-3 shrink-0 flex items-center gap-1.5">
                        {checkingSlug && <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />}
                        {!checkingSlug && slugAvailable === true && (
                          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Available
                          </span>
                        )}
                        {!checkingSlug && slugAvailable === false && (
                          <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Already Taken
                          </span>
                        )}
                        <Lock className="h-3.5 w-3.5 text-neutral-400 ml-0.5" />
                      </div>
                    </div>

                    {slugAvailable === false && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-semibold">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Store URL '/{slug}' is already taken! Please enter a unique restaurant name.</span>
                      </p>
                    )}
                    {slugAvailable === true && (
                      <p className="mt-1 text-[11px] text-emerald-500 font-medium">
                        ✓ Storefront URL <strong>/{slug}</strong> is ready for your restaurant!
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-neutral-500">
                      ℹ️ Store URL is permanently locked to your Restaurant Name to ensure QR codes and customer links never break.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor={ownerNameId} className="block text-xs font-semibold mb-1">
                        Owner Name
                      </label>
                      <input
                        id={ownerNameId}
                        type="text"
                        placeholder="Owner Name"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${
                          isDark ? "border-neutral-800 bg-neutral-900 text-white placeholder-neutral-500" : "border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400"
                        }`}
                      />
                    </div>
                    <div>
                      <label htmlFor={phoneId} className="block text-xs font-semibold mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        id={phoneId}
                        required
                        type="tel"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${
                          isDark ? "border-neutral-800 bg-neutral-900 text-white placeholder-neutral-500" : "border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400"
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`grid grid-cols-2 gap-2.5 pt-1 border-t ${
                    isDark ? "border-neutral-800" : "border-neutral-200"
                  }`}>
                    <div>
                      <label htmlFor={adminUserId} className="block text-xs font-semibold mb-1">
                        Admin Username *
                      </label>
                      <input
                        id={adminUserId}
                        required
                        minLength={3}
                        type="text"
                        placeholder="admin"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${
                          isDark ? "border-neutral-800 bg-neutral-900 text-white placeholder-neutral-500" : "border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400"
                        }`}
                      />
                    </div>
                    <div>
                      <label htmlFor={adminPassId} className="block text-xs font-semibold mb-1">
                        Admin Password *
                      </label>
                      <div className="relative">
                        <input
                          id={adminPassId}
                          required
                          minLength={6}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full rounded-xl border pl-3 pr-8 py-2 text-sm outline-none ${
                            isDark ? "border-neutral-800 bg-neutral-900 text-white placeholder-neutral-500" : "border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="rounded-xl bg-red-950/80 p-2.5 text-xs text-red-300 border border-red-800/80">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || slugAvailable === false || !slug}
                    className="w-full rounded-xl bg-linear-to-r from-[#e60000] to-orange-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/30 hover:opacity-95 disabled:opacity-50 transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting Application…
                      </>
                    ) : slugAvailable === false ? (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        <span>Store Name / URL Already Taken</span>
                      </>
                    ) : (
                      <>
                        Submit Partner Application
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <p className={`text-[11px] text-center mt-2 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    Already an approved partner?{" "}
                    <Link href="/admin/login" className="text-orange-500 font-semibold hover:underline">
                      Login to Admin
                    </Link>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
