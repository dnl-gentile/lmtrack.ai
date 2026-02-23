"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface ArenaMobileCarouselItem {
  id: string;
  content: ReactNode;
}

interface ArenaMobileCarouselProps {
  items: ArenaMobileCarouselItem[];
}

export default function ArenaMobileCarousel({ items }: ArenaMobileCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    if (scrollerRef.current) {
      scrollerRef.current.scrollTo({ left: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [items.length]);

  const onScroll = () => {
    const node = scrollerRef.current;
    if (!node) return;
    const width = node.clientWidth;
    if (width <= 0) return;
    const nextIndex = Math.round(node.scrollLeft / width);
    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  };

  return (
    <div className="space-y-2">
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="arena-mobile-carousel flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1"
      >
        {items.map((item) => (
          <div key={item.id} className="min-w-full snap-center">
            {item.content}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-1">
        {items.map((item, index) => (
          <span
            key={item.id}
            className={`h-1.5 rounded-full transition-all ${
              index === activeIndex ? "w-5 bg-primary" : "w-1.5 bg-muted/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
