"use client";

import { useTheme as useNextTheme } from "next-themes";
import { useEffect } from "react";

const THEME_COLORS = {
  light: "#fafaf9",
  dark: "#0a0a0f",
} as const;

/**
 * Dynamically updates <meta name="theme-color"> so the Android PWA
 * status bar tracks the user's chosen in-app theme (not just the OS setting).
 */
export default function ThemeColorSync() {
  const { resolvedTheme } = useNextTheme();

  useEffect(() => {
    if (!resolvedTheme) return;

    const color =
      resolvedTheme === "dark" ? THEME_COLORS.dark : THEME_COLORS.light;

    // Update every theme-color meta tag (there may be multiple from Next.js viewport export)
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    if (metas.length > 0) {
      metas.forEach((meta) => meta.setAttribute("content", color));
    } else {
      // Create one if it doesn't exist
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = color;
      document.head.appendChild(meta);
    }
  }, [resolvedTheme]);

  return null;
}
