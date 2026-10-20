"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/icon";

/** Click-to-load YouTube (SPEC §7.5): a thumbnail until the shopper asks for the player. */
export function LiteYouTube({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
      {play ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button type="button" onClick={() => setPlay(true)} className="group absolute inset-0 size-full">
          <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover opacity-80 transition-opacity group-hover:opacity-100" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full bg-action text-white shadow-lg transition-transform group-hover:scale-105">
              <Icon name="play" size={28} />
            </span>
          </span>
          <span className="sr-only">Play video: {title}</span>
        </button>
      )}
    </div>
  );
}
