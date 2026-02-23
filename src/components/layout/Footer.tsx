"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Use Cases",
    links: [
      { label: "Chat with AI", href: "#" },
      { label: "Build Apps & Websites", href: "#" },
      { label: "Write & Edit Text", href: "#" },
      { label: "Search the Web", href: "#" },
      { label: "Generate Images", href: "#" },
      { label: "Generate Videos", href: "#" },
      { label: "Chose any model", href: "#" },
      { label: "Compare Models Side by Side", href: "/compare" },
    ],
  },
  {
    title: "Leaderboard Rankings",
    links: [
      { label: "Overview", href: "/leaderboard" },
      { label: "Text", href: "/leaderboard/text" },
      { label: "Code", href: "/leaderboard/code" },
      { label: "Text to Image", href: "/leaderboard/text-to-image" },
      { label: "Image Edit", href: "/leaderboard/image-edit" },
      { label: "Text to Video", href: "/leaderboard/text-to-video" },
      { label: "Image to Video", href: "/leaderboard/image-to-video" },
      { label: "Vision", href: "/leaderboard/vision" },
      { label: "Search", href: "/leaderboard/search" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "How It Works", href: "/about#how-it-works" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/jobs" },
      { label: "Changelog", href: "#" },
      { label: "Help Center", href: "/help" },
      { label: "FAQ", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms-of-use" },
      { label: "Privacy", href: "/privacy-policy" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
  {
    title: "Follow",
    links: [
      { label: "X", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "YouTube", href: "#" },
      { label: "Discord", href: "#" },
    ],
  },
];

const FOOTER_DISCLAIMER =
  "We're a non-profit fan project and we're not associated with arena.ai (unless they want to talk).";

export default function Footer() {
  const [logoSrc, setLogoSrc] = useState("/market-ai-logo.png");
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const syncTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      const isDark = theme === "dark";
      setIsDarkTheme(isDark);
      setLogoSrc(isDark ? "/market-ai-logo-white.png" : "/market-ai-logo.png");
    };

    syncTheme();
    const el = document.documentElement;
    const observer = new MutationObserver(() => {
      syncTheme();
    });
    observer.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="mt-auto shrink-0 bg-background">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-8 py-10 md:grid-cols-5 lg:gap-x-10 lg:py-12">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="font-serif text-[12px] font-normal uppercase tracking-[0.04em] text-muted">
                {section.title}
              </h4>
              <div className="flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <Link
                    key={`${section.title}-${link.label}`}
                    href={link.href}
                    className="font-sans text-[14px] font-normal text-primary transition-colors hover:text-muted"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={`border-t py-7 lg:py-8 ${isDarkTheme ? "border-white/70" : "border-[#5a554f]"}`}>
          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[auto_1fr_auto] sm:gap-4">
            <Link href="/" className="inline-flex items-center leading-none">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden -mr-1 lg:h-14 lg:w-14">
                <Image
                  src={logoSrc}
                  alt=""
                  width={56}
                  height={56}
                  className="object-contain"
                  onError={() => setLogoSrc("/market-ai-logo.png")}
                />
              </div>
              <span className="font-serif text-[34px] leading-[0.88] tracking-tight text-primary sm:text-[38px] lg:text-[42px]">
                Market
              </span>
            </Link>
            <p className="text-center text-[10px] font-light italic leading-tight text-muted/85 [font-family:var(--font-cursive)]">
              {FOOTER_DISCLAIMER}
            </p>
            <span className="text-center text-[15px] text-muted sm:text-right">© lmmarket.ai 2026</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
