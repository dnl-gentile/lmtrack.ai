"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CircleHelp,
  MessageCircle,
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

const menuGroups: Array<Array<{ href: string; label: string; icon: LucideIcon; external?: boolean; discordAccent?: boolean }>> = [
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
    { href: "https://discord.gg/arena", label: "Join Discord", icon: MessageCircle, external: true, discordAccent: true },
  ],
];

const themeOptions: Array<{ value: ThemePreference; label: string; icon: LucideIcon }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "auto", label: "Auto", icon: Monitor },
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
        className="flex items-center gap-2 px-2 py-2 w-full hover:bg-chip/50 rounded-xl transition-colors text-left"
      >
        <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md">
          <Image
            src={logoSrc}
            alt="Market logo"
            width={28}
            height={28}
            className="rounded-md object-contain"
            onError={() => setLogoSrc("/market-ai-logo.png")}
          />
        </div>
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-xl font-serif font-normal tracking-tight text-primary truncate">Market</span>
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
            className={`shrink-0 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div
          className={`absolute left-1 top-full z-50 mt-1 w-[214px] rounded-2xl border py-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${
            isDark ? "border-[#3b372f] bg-[#0c0c0c]" : "border-line bg-panel"
          }`}
        >
          {menuGroups.map((group, i) => (
            <div
              key={i}
              className={i > 0 ? `border-t pt-1 ${isDark ? "border-[#3b372f]" : "border-line"}` : ""}
            >
              {group.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className={`flex items-center gap-3 px-4 py-2.5 text-[14px] transition-colors ${
                      isDark ? "text-[#ece7de] hover:bg-[#171717]" : "text-primary hover:bg-chip/60"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                        item.discordAccent ? "rounded bg-[#5865f2] text-white" : isDark ? "text-[#f0e9dd]/90" : "text-muted"
                      }`}
                    >
                      <Icon className={item.discordAccent ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={1.9} />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}

          <div className={`mt-1 border-t px-4 pb-1 pt-3 ${isDark ? "border-[#3b372f]" : "border-line"}`}>
            <div className="flex items-center justify-between gap-3">
              <span className={`text-[14px] ${isDark ? "text-[#ece7de]" : "text-primary"}`}>Theme</span>
              <div className={`inline-flex rounded-xl border p-1 ${isDark ? "border-[#4a4439] bg-[#1a1814]" : "border-line bg-chip/70"}`}>
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = themePreference === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTheme(opt.value)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        active
                          ? isDark ? "bg-[#3d3a36] text-[#f3eee5]" : "bg-chip-active-bg text-primary"
                          : isDark ? "text-[#a49988] hover:bg-[#2a2622] hover:text-[#f3eee5]" : "text-muted hover:bg-chip hover:text-primary"
                      }`}
                      aria-label={`${opt.label} mode`}
                      aria-pressed={active}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.8} />
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
