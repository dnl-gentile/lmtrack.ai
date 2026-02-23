"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CircleHelp,
  Monitor,
  Moon,
  Newspaper,
  PenTool,
  Sun,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

type ThemePreference = "light" | "dark" | "auto";

const THEME_STORAGE_KEY = "theme-preference";

interface LogoMenuItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  external?: boolean;
  discordAccent?: boolean;
  customIcon?: "discord";
}

const menuGroups: LogoMenuItem[][] = [
  [
    { href: "/about", label: "About Us", icon: Users },
    { href: "/about#how-it-works", label: "How it Works", icon: PenTool },
    { href: "/help", label: "Help Center", icon: CircleHelp },
  ],
  [
    { href: "/blog", label: "Visit our Blog", icon: Newspaper },
    { href: "/jobs", label: "Join the Team", icon: UserPlus },
  ],
  [
    {
      href: "https://discord.gg/arena",
      label: "Join Discord",
      external: true,
      discordAccent: true,
      customIcon: "discord",
    },
  ],
];

function DiscordGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.7105 4.62271C12.9152 6.3939 13.5101 8.39175 13.2877 10.6918C13.2868 10.7015 13.2817 10.7104 13.2737 10.7163C12.3615 11.3862 11.4776 11.7927 10.6061 12.0623C10.5993 12.0644 10.5921 12.0642 10.5854 12.062C10.5787 12.0597 10.5728 12.0554 10.5687 12.0496C10.3673 11.7695 10.1844 11.4742 10.0241 11.164C10.0149 11.1458 10.0233 11.1238 10.0423 11.1166C10.3328 11.0071 10.6091 10.8759 10.8748 10.7206C10.8957 10.7083 10.8971 10.6783 10.8777 10.6639C10.8213 10.622 10.7655 10.578 10.712 10.534C10.702 10.5259 10.6885 10.5243 10.6772 10.5298C8.95199 11.3264 7.06213 11.3264 5.31655 10.5298C5.30521 10.5247 5.29175 10.5264 5.28201 10.5344C5.22868 10.5784 5.17268 10.622 5.11681 10.6639C5.09748 10.6783 5.09908 10.7083 5.12015 10.7206C5.38588 10.873 5.66215 11.0071 5.95228 11.1171C5.97108 11.1243 5.98001 11.1458 5.97068 11.164C5.81388 11.4746 5.63095 11.7699 5.42588 12.05C5.41695 12.0614 5.40228 12.0666 5.38841 12.0623C4.52109 11.7927 3.63722 11.3862 2.72495 10.7163C2.71735 10.7104 2.71189 10.7011 2.71109 10.6914C2.52522 8.70189 2.90402 6.68749 4.28682 4.62231C4.29015 4.61684 4.29522 4.61257 4.30109 4.61004C4.98148 4.29777 5.71041 4.06804 6.47228 3.93684C6.48615 3.93471 6.50001 3.94111 6.50721 3.95337C6.60135 4.12004 6.70893 4.33377 6.78173 4.50844C7.58479 4.38577 8.40039 4.38577 9.22026 4.50844C9.29306 4.33751 9.39693 4.12004 9.49066 3.95337C9.49399 3.94729 9.49919 3.94241 9.50546 3.93945C9.51173 3.93647 9.51879 3.93557 9.52559 3.93684C10.2879 4.06844 11.0168 4.29817 11.6967 4.61004C11.7027 4.61257 11.7076 4.61684 11.7105 4.62271ZM7.18999 8.40535C7.19839 7.81722 6.76959 7.33055 6.23135 7.33055C5.69748 7.33055 5.27281 7.81295 5.27281 8.40535C5.27281 8.99762 5.70588 9.48002 6.23135 9.48002C6.76533 9.48002 7.18999 8.99762 7.18999 8.40535ZM10.7343 8.40535C10.7427 7.81722 10.3139 7.33055 9.77573 7.33055C9.24173 7.33055 8.81706 7.81295 8.81706 8.40535C8.81706 8.99762 9.25013 9.48002 9.77573 9.48002C10.3139 9.48002 10.7343 8.99762 10.7343 8.40535Z"
        fill="#F3F6FF"
      />
    </svg>
  );
}

// Arena order: System/Auto first, then Light, then Dark
const themeOptions: Array<{ value: ThemePreference; label: string; icon: LucideIcon }> = [
  { value: "auto", label: "Auto", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

function resolveTheme(pref: ThemePreference): "light" | "dark" {
  if (pref === "auto") return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  return pref;
}

function applyTheme(pref: ThemePreference): "light" | "dark" {
  const resolved = resolveTheme(pref);
  if (typeof document !== "undefined") document.documentElement.setAttribute("data-theme", resolved);
  return resolved;
}

export default function LogoMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [themePreference, setThemePreference] = useState<ThemePreference>("auto");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [logoSrc, setLogoSrc] = useState("/market-ai-logo.png");
  const menuRef = useRef<HTMLDivElement>(null);
  const prefRef = useRef<ThemePreference>("auto");

  const syncTheme = (next: "light" | "dark") => {
    setResolvedTheme(next);
    setLogoSrc(next === "dark" ? "/market-ai-logo-white.png" : "/market-ai-logo.png");
  };

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    let pref: ThemePreference = "auto";
    try {
      const s = localStorage.getItem(THEME_STORAGE_KEY);
      if (s === "light" || s === "dark" || s === "auto") pref = s;
    } catch {}
    prefRef.current = pref;
    setThemePreference(pref);
    syncTheme(applyTheme(pref));
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => { if (prefRef.current === "auto") syncTheme(applyTheme("auto")); };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = (next: ThemePreference) => {
    prefRef.current = next;
    setThemePreference(next);
    try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch {}
    syncTheme(applyTheme(next));
  };

  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex max-w-full items-center gap-0 rounded-[10px] px-1 py-0.5 text-left transition-colors hover:bg-chip/50 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:shadow-[0_0_0_3px_var(--focus-glow)]"
      >
        <div className="relative h-9 w-9 shrink-0 overflow-hidden -mr-1">
          <Image
            src={logoSrc}
            alt="Market logo"
            width={36}
            height={36}
            className="object-contain"
            onError={() => setLogoSrc("/market-ai-logo.png")}
          />
        </div>
        <div className="flex items-center min-w-0">
          <span className="text-[26px] font-serif font-normal tracking-tight text-primary truncate">Market</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 text-muted transition-transform duration-200 mt-1 ml-1 ${isOpen ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 top-full z-50 mt-1 w-[216px] rounded-lg border py-1.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${
            isDark ? "border-line bg-menu" : "border-line bg-[#ffffff]"
          }`}
        >
          <div className="px-3 pb-1 pt-1">
            <div
              className={`grid grid-cols-2 overflow-hidden rounded-md border border-line ${
                isDark ? "bg-chip/40" : "bg-chip/50"
              }`}
            >
              <Link
                href="https://arena.ai"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-0 px-2 py-1.5 text-[19px] text-primary transition-colors ${
                  isDark ? "hover:bg-hover/70" : "hover:bg-chip/60"
                }`}
              >
                <Image
                  src="/brand/arena.svg"
                  alt=""
                  aria-hidden="true"
                  width={20}
                  height={20}
                  className={`-mr-[1px] h-[0.95em] w-[0.95em] shrink-0 origin-center scale-[1.3] object-contain ${isDark ? "invert brightness-0" : ""}`}
                />
                <span className="font-serif font-medium leading-none tracking-tight">Arena</span>
              </Link>
              <div className="flex items-center justify-center gap-0 border-l border-line px-2 py-1.5 text-[19px] text-primary">
                <Image
                  src="/brand/track.svg"
                  alt=""
                  aria-hidden="true"
                  width={20}
                  height={20}
                  className={`-mr-[1px] h-[0.95em] w-[0.95em] shrink-0 origin-center scale-[1.22] object-contain ${isDark ? "invert brightness-0" : ""}`}
                />
                <span className="font-serif font-medium leading-none tracking-tight">Track</span>
              </div>
            </div>
          </div>

          {menuGroups.map((group, i) => (
            <div
              key={i}
              className={i > 0 ? "mt-0.5 border-t border-line pt-0.5" : ""}
            >
              {group.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className={`flex items-center gap-3 px-4 py-2 text-[14px] transition-colors ${
                      isDark ? "text-primary hover:bg-hover" : "text-primary hover:bg-chip/60"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                        item.discordAccent ? "rounded-md bg-[#5865f2] text-white" : isDark ? "text-primary/85" : "text-muted"
                      }`}
                    >
                      {item.customIcon === "discord" ? (
                        <DiscordGlyph className="block h-3.5 w-3.5" />
                      ) : Icon ? (
                        <Icon className={item.discordAccent ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={1.9} />
                      ) : null}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}

          <div className="mt-0.5 border-t border-line px-4 pb-0 pt-2">
            <div className="flex items-center justify-between gap-4">
              <span className="shrink-0 text-[14px] text-primary">Theme</span>
              <div className={`inline-flex rounded-sm border p-0.5 shrink-0 ${
                isDark ? "border-line bg-chip" : "border-line bg-chip"
              }`}>
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = themePreference === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTheme(opt.value)}
                      className={`flex h-7 w-7 items-center justify-center rounded-[5px] transition-colors ${
                        active
                          ? isDark ? "bg-hover text-primary border border-line" : "bg-background border border-line text-primary shadow-sm"
                          : isDark ? "text-muted hover:bg-hover hover:text-primary" : "text-muted hover:text-primary"
                      }`}
                      aria-label={`${opt.label} mode`}
                      aria-pressed={active}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
