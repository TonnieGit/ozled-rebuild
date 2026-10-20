import Image from "next/image";
import Link from "next/link";
import type { ProductCard as Card } from "@/data/types";
import { Price, Rating, SpecChips, StockChip } from "./bits";
import { QuickAdd } from "./quick-add";

/**
 * Product card (SPEC §7.4): full name clamped to 2 lines, image (lit view on hover),
 * brand, rating, stock, price + RRP, one primary action.
 */
export function ProductCard({ card, priority = false, headingLevel = 3 }: { card: Card; priority?: boolean; headingLevel?: 2 | 3 }) {
  const [main, lit] = card.images;
  const H = `h${headingLevel}` as const;
  return (
    <article className="group relative flex flex-col rounded-lg border border-border bg-surface p-3 transition-shadow hover:shadow-md sm:p-4">
      <div className="relative aspect-square overflow-hidden rounded-md bg-bg-subtle">
        <Image
          src={main.src}
          alt={main.alt}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 300px, (min-width: 768px) 30vw, 50vw"
          className="object-contain p-2 transition-opacity duration-300 group-hover:opacity-100"
        />
        {lit && (
          <Image src={lit.src} alt="" aria-hidden fill sizes="(min-width: 1280px) 300px, (min-width: 768px) 30vw, 50vw" className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:hidden" />
        )}
        {card.rrp && card.rrp > card.price && (
          <span className="absolute top-2 left-2 rounded-sm bg-brand px-1.5 py-0.5 text-xs font-bold text-white uppercase">Sale</span>
        )}
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-1.5">
        <p className="text-xs font-semibold tracking-wide text-fg-subtle uppercase">{card.brand.name}</p>
        <H className="line-clamp-2 min-h-[2lh] text-[15px] leading-snug font-semibold [overflow-wrap:normal] [word-break:normal]">
          <Link href={card.path} className="after:absolute after:inset-0 hover:underline">
            {card.name}
          </Link>
        </H>
        <Rating average={card.rating.average} count={card.rating.count} />
        <SpecChips specs={card.specs} max={3} />
        <div className="mt-auto pt-2">
          <Price price={card.price} rrp={card.rrp} />
          <div className="mt-1 flex items-center justify-between gap-2">
            <StockChip stock={card.stock} />
          </div>
        </div>
        <div className="relative z-10 mt-2">
          <QuickAdd card={card} />
        </div>
      </div>
    </article>
  );
}
