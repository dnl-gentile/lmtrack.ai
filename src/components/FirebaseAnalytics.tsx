"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getFirebaseAnalytics } from "@/lib/firebase";
import { logEvent } from "firebase/analytics";

/** Initializes Firebase Analytics and logs page_view on route change. Mount once in root layout. */
export function FirebaseAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    const analytics = getFirebaseAnalytics();
    if (!analytics) return;
    logEvent(analytics, "page_view", {
      page_path: pathname ?? window.location.pathname,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}
