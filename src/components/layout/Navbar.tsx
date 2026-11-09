"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Phone, ArrowLeft } from "lucide-react";
import { useCart } from "@/features/cart/cart-context";
import { fetchNavbar, type NavbarDTO } from "@/services/navbar";
import { WavySeparator } from "./WavySeparator";

export function Navbar({
  onCartClick,
  restaurantSlug,
}: {
  onCartClick?: () => void;
  restaurantSlug?: string;
}) {
  const { itemCount } = useCart();
  const displayCount = itemCount > 99 ? "99+" : String(itemCount);

  const [data, setData] = useState<NavbarDTO | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(() => {
    return fetchNavbar(restaurantSlug)
      .then(setData)
      .catch(() => setData({ logoUrl: "", brand: "", tagline: "", phone: "" }))
      .finally(() => setReady(true));
  }, [restaurantSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [load]);

  const logoUrl = data?.logoUrl.trim() ?? "";
  const effectiveLogo = logoUrl || "/kya-khaugey.png";
  const brand = data?.brand.trim() || "Khaoge Kya?";
  const taglineText = data?.tagline.trim() || "Good Food For Good Moments";
  const callPhone = data?.phone.trim() ?? "";

  const logoUnopt =
    logoUrl &&
    (logoUrl.startsWith("http") ||
      logoUrl.startsWith("//") ||
      logoUrl.startsWith("/uploads"));

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#ffde00]/70 shadow-[0_4px_20px_-4px_rgba(11,37,69,0.08)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-3 py-1.5 sm:gap-3.5 sm:px-5 sm:py-2">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[#0b2545]/35 focus-visible:ring-offset-2 sm:gap-3.5"
          aria-label={brand}
        >
          <span className="relative h-13 w-13 shrink-0 overflow-hidden rounded-full bg-white ring-2.5 ring-[#ffde00] shadow-[0_3px_12px_rgba(11,37,69,0.18)] sm:h-15 sm:w-15 md:h-16 md:w-16 transition-transform duration-300 group-hover:scale-105">
            {!ready ? (
              <span className="absolute inset-0 animate-pulse bg-neutral-200" />
            ) : (
              <Image
                key={effectiveLogo}
                src={effectiveLogo}
                alt={brand}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 56px, 68px"
                priority
                unoptimized={Boolean(logoUnopt || effectiveLogo.startsWith("/"))}
              />
            )}
          </span>
          <span className="min-w-0">
            {!ready ? (
              <>
                <span className="block h-[1.1rem] w-36 max-w-[55vw] animate-pulse rounded bg-neutral-200 sm:h-7 sm:w-44" />
                <span className="mt-1 block h-2.5 w-28 max-w-[45vw] animate-pulse rounded bg-neutral-100 sm:mt-1.5" />
              </>
            ) : (
              <>
                <p className="font-navbar-brand text-[clamp(1.1rem,3.5vw,1.7rem)] font-black leading-none tracking-tight text-[#0b2545] transition-transform duration-200 group-hover:scale-[1.02] sm:text-[clamp(1.25rem,3.9vw,1.85rem)] truncate max-w-[130px] min-[400px]:max-w-[190px] sm:max-w-none">
                  {brand}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ffde00]/25 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#e51b24] border border-[#ffde00]/80 sm:text-[10.5px] max-w-[125px] min-[400px]:max-w-[180px] sm:max-w-none">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#e51b24] animate-pulse shrink-0" />
                    <span className="truncate">{taglineText}</span>
                  </span>
                </div>
              </>
            )}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <Link
            href="/stores"
            className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[#0b2545]/20 bg-white px-3 py-1.5 text-[11px] font-bold text-[#0b2545] hover:text-[#e51b24] hover:border-[#ffde00] hover:bg-[#ffde00]/15 transition shadow-xs"
            title="Browse other restaurants"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Stores</span>
          </Link>

          <Link
            href="/admin/login"
            className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[#0b2545]/20 bg-white px-3 py-1.5 text-[11px] font-bold text-[#0b2545] hover:text-[#e51b24] hover:border-[#ffde00] hover:bg-[#ffde00]/15 transition shadow-xs"
            title="Partner Store Login"
          >
            <span>Login</span>
          </Link>

          {!ready ? (
            <span
              className="inline-flex h-9 w-20 shrink-0 animate-pulse rounded-full bg-neutral-200 sm:h-10"
              aria-hidden
            />
          ) : callPhone ? (
            <a
              href={`tel:${callPhone.replace(/\s/g, "")}`}
              className="inline-flex h-9 items-center gap-1 rounded-full bg-linear-to-r from-[#e51b24] to-[#f58220] px-3 font-body text-[0.65rem] font-black uppercase tracking-[0.09em] text-white shadow-[0_2px_8px_rgba(229,27,36,0.4)] transition hover:brightness-105 active:translate-y-px active:brightness-95 sm:h-10 sm:gap-1.5 sm:px-4 sm:text-xs"
            >
              <Phone
                className="h-3.5 w-3.5 shrink-0 stroke-[2.5] sm:h-4 sm:w-4"
                aria-hidden
              />
              Call
            </a>
          ) : null}
          <button
            type="button"
            onClick={onCartClick}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0b2545] text-white ring-2 ring-[#ffde00]/70 shadow-[0_3px_10px_rgba(11,37,69,0.3)] transition hover:brightness-110 active:translate-y-px active:brightness-95 sm:h-10 sm:w-10 md:h-11 md:w-11"
            aria-label={`Open cart, ${itemCount} items`}
          >
            <ShoppingCart
              className="h-4 w-4 sm:h-[1.15rem] sm:w-[1.15rem]"
              strokeWidth={2.25}
            />
            <span className="font-body absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full border-2 border-white bg-[#e51b24] px-1 text-[9.5px] font-black leading-none text-white shadow-xs sm:h-5 sm:min-w-5 sm:text-[10.5px]">
              {displayCount}
            </span>
          </button>
        </div>
      </div>
      <WavySeparator />
    </header>
  );
}
