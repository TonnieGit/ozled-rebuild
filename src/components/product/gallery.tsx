"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/icon";
import type { Image as Img } from "@/data/types";
import { cx } from "@/lib/format";

/** Product gallery: thumbnails, click-to-zoom with pointer panning (SPEC §7.5). */
export function Gallery({ images, name }: { images: Img[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const img = images[index];

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto md:w-20 md:flex-col md:overflow-visible" aria-label="Product images">
          {images.map((im, i) => (
            <li key={im.src} className="shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIndex(i);
                  setZoom(false);
                }}
                aria-current={i === index}
                className={cx(
                  "relative block size-16 overflow-hidden rounded-md border-2 bg-bg-subtle md:size-20",
                  i === index ? "border-action" : "border-transparent hover:border-border-strong",
                )}
              >
                <Image src={im.src} alt={`${name} – image ${i + 1}`} fill sizes="80px" className="object-contain p-1" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative flex-1">
        <button
          type="button"
          onClick={() => setZoom((z) => !z)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
          }}
          aria-label={zoom ? "Zoom out" : "Zoom in"}
          className={cx("relative block aspect-square w-full overflow-hidden rounded-lg bg-bg-subtle", zoom ? "cursor-zoom-out" : "cursor-zoom-in")}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            priority={index === 0}
            fetchPriority={index === 0 ? "high" : undefined}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain p-4 transition-transform duration-200 motion-reduce:transition-none"
            style={{ transform: zoom ? "scale(2)" : undefined, transformOrigin: origin }}
          />
        </button>
        <span className="pointer-events-none absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-surface/90 text-fg-muted shadow-sm" aria-hidden>
          <Icon name="search" size={18} />
        </span>
      </div>
    </div>
  );
}
