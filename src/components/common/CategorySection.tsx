import type { ReactNode } from "react";

type Props = {
  id: string;
  title: string;
  children: ReactNode;
};

export function CategorySection({ id, title, children }: Props) {
  return (
    <section id={id} className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28 lg:scroll-mt-32">
      <div className="relative mb-2 sm:mb-3 flex items-center gap-2 sm:gap-2.5">
        <span className="h-4.5 w-1.5 rounded-full bg-[#e51b24] shadow-xs" />
        <h2 className="font-navbar-brand text-xs font-black uppercase tracking-wide text-[#0b2545] sm:text-sm md:text-base">
          {title}
        </h2>
        <div
          aria-hidden
          className="h-0.5 flex-1 bg-linear-to-r from-[#ffde00] via-[#e51b24]/30 to-transparent rounded-full"
        />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5 md:grid-cols-3 lg:gap-3">
        {children}
      </div>
    </section>
  );
}
