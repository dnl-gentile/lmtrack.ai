import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { FirebaseAnalytics } from "@/components/FirebaseAnalytics";
import AppLayoutClient from "@/components/layout/AppLayoutClient";

const inter = Inter({ subsets: ["latin"] });

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var key = "theme-preference";
    var stored = localStorage.getItem(key);
    var pref = (stored === "light" || stored === "dark" || stored === "auto") ? stored : "auto";
    var useDark = pref === "dark" || (pref === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.setAttribute("data-theme", useDark ? "dark" : "light");
  } catch (_) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`;

export const metadata: Metadata = {
  title: {
    default: "AI Model Speed Rankings",
    template: "%s | Track",
  },
  description:
    "Benchmark AI model speed and compare latency records across providers.",
  openGraph: {
    title: "AI Model Speed Rankings",
    description: "Benchmark model latency and track global speed records.",
    siteName: "lmtrack.ai",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.ico", type: "image/x-icon", media: "(prefers-color-scheme: dark)" },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-16x16-dark.png",
        sizes: "16x16",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/favicon-32x32-dark.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/apple-touch-icon-dark.png",
        sizes: "180x180",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    other: [
      {
        rel: "manifest",
        url: "/site.webmanifest",
        media: "(prefers-color-scheme: light)",
      },
      {
        rel: "manifest",
        url: "/site-dark.webmanifest",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body className={`antialiased ${inter.className}`}>
        <FirebaseAnalytics />
        <AppLayoutClient>{children}</AppLayoutClient>
      </body>
    </html>
  );
}
