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
    default: "market.ai - AI Model Value Rankings",
    template: "%s | market.ai",
  },
  description:
    "Compare AI models by cost-efficiency. Combines Arena quality scores with API pricing to find the best value models.",
  openGraph: {
    title: "market.ai - AI Model Value Rankings",
    description:
      "Compare AI models by cost-efficiency. Find the best value AI models.",
    siteName: "market.ai",
    type: "website",
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
