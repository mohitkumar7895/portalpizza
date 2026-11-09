"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import type { ProductDTO } from "@/types";
import { NonVegIcon, VegIcon } from "@/components/common/VegIcon";
import { ImageLightbox } from "@/components/modals/ImageLightbox";

type Props = {
  product: ProductDTO;
  onAdd: (product: ProductDTO) => void;
};

function resolveImage(url: string | undefined) {
  if (!url || url.length === 0) return "/placeholder-food.svg";
  if (url.startsWith("http") || url.startsWith("//")) return url;
  if (url.startsWith("/")) return url;
  return `/${url}`;
}

function cardPriceLabel(product: ProductDTO): { text: string; sub?: string } {
  const v = product.variants;
  if (v && v.length > 0) {
    const minP = Math.min(...v.map((x) => x.price));
    const maxP = Math.max(...v.map((x) => x.price));
    if (minP === maxP) {
      return { text: `₹ ${minP}`, sub: `${v.length} type` };
    }
    return { text: `₹ ${minP}`, sub: `${v.length} types` };
  }
  return { text: `₹ ${product.price}` };
}

export function ProductCard({ product, onAdd }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const src = resolveImage(product.image);
  const priceLine = cardPriceLabel(product);
  const imgUnopt =
    src.startsWith("http") || src.startsWith("//") || src.startsWith("/uploads");

  return (
    <>
      <article
        className="group flex items-stretch overflow-hidden rounded-2xl border-2 border-[#ffde00]/60 bg-white shadow-[0_4px_16px_-6px_rgba(11,37,69,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(229,27,36,0.22)] hover:border-[#e51b24]/50"
      >
      {/* Left: larger image, fills strip height */}
      <div className="flex w-[36%] min-w-22 shrink-0 items-center justify-center bg-white px-1 py-1 sm:min-w-25 sm:px-1.5 sm:py-1.5 md:w-[34%]">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative aspect-square w-full max-w-22 overflow-hidden rounded-md bg-neutral-100 hover:opacity-80 transition cursor-pointer sm:max-w-25 md:rounded-lg md:max-w-26"
          aria-label="View image"
        >
          <Image
            src={src}
            alt={product.name}
            fill
            className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width:640px) 88px, (max-width:1024px) 100px, 104px"
            unoptimized={imgUnopt}
          />
        </button>
      </div>

      {/* Right: yellow panel — title + desc; bottom row = ₹ | Add */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0 bg-[#fff9ee] py-1.5 pl-2 pr-2 border-l border-[#ffde00]/40 sm:py-2 sm:pl-2.5 sm:pr-2.5">
        <div className="min-w-0">
          <div className="flex items-start gap-1">
            <span className="mt-px shrink-0">
              {product.isVeg ? <VegIcon /> : <NonVegIcon />}
            </span>
            <h3 className="line-clamp-2 font-navbar-brand text-[0.8rem] font-black leading-[1.2] text-[#0b2545] group-hover:text-[#e51b24] transition-colors sm:text-[0.875rem]">
              {product.name}
            </h3>
          </div>
          <p className="mt-0.5 line-clamp-1 pl-5.5 font-body text-[0.625rem] leading-tight text-neutral-600 sm:text-[10.5px]">
            {product.description || "—"}
          </p>
        </div>

        <div className="mt-1 flex flex-nowrap items-center justify-between gap-1.5 pl-5.5 sm:mt-1.5">
          <div className="min-w-0">
            <p className="font-body text-sm font-black tabular-nums leading-none tracking-tight text-[#e51b24] sm:text-base">
              {priceLine.text}
            </p>
            {priceLine.sub && (
              <span className="mt-0.5 block text-[8.5px] font-bold text-neutral-500 uppercase tracking-tight sm:text-[9.5px]">
                {priceLine.sub} • Customisable
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onAdd(product)}
            className="inline-flex shrink-0 items-center justify-center gap-1 rounded-full bg-linear-to-r from-[#e51b24] to-[#f58220] px-3 py-1.5 min-h-8 text-[9.5px] font-black uppercase tracking-wide text-white shadow-[0_2px_8px_rgba(229,27,36,0.35)] transition hover:scale-[1.04] hover:shadow-[0_4px_14px_rgba(229,27,36,0.5)] active:scale-[0.98] sm:px-3.5 sm:py-2 sm:text-[10.5px] cursor-pointer"
          >
            <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
            Add
          </button>
        </div>
      </div>
      </article>

      <ImageLightbox
        open={lightboxOpen}
        src={src}
        alt={product.name}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
