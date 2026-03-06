"use client";

import { useMemo, useState, useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import {
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
  createTheme,
} from "@mui/material";
import type { PaletteMode } from "@mui/material";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    primary: {
      main: mode === "dark" ? "#818cf8" : "#6366f1", // More vibrant in dark mode
      light: "#a5b4fc",
      dark: "#4f46e5",
    },
    secondary: {
      main: mode === "dark" ? "#94a3b8" : "#64748b",
    },
    background: {
      default: mode === "dark" ? "#0b0e14" : "#f8fafc", // Deep charcoal/blue
      paper: mode === "dark" ? "#11141b" : "#ffffff", // Slightly lighter for contrast
    },
    text: {
      primary: mode === "dark" ? "#f8fafc" : "#0f172a",
      secondary: mode === "dark" ? "#94a3b8" : "#475569",
    },
    divider: mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
  },
  typography: {
    fontFamily: "var(--font-roboto), var(--font-sans), Inter, sans-serif",
    h1: { fontWeight: 900, letterSpacing: "-0.03em" },
    h2: { fontWeight: 900, letterSpacing: "-0.03em" },
    h3: { fontWeight: 700, letterSpacing: "-0.02em" },
    h4: { fontWeight: 700, letterSpacing: "-0.015em" },
    h5: { fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontWeight: 700 },
    subtitle1: { letterSpacing: "0.01em", fontWeight: 500 },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", lineHeight: 1.6 },
    button: {
      textTransform: "none" as const,
      fontWeight: 700,
      letterSpacing: "0.02em",
    },
  },
  shape: {
    borderRadius: 1, // Use 1px as unit for predictability
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 5, // 5px radius for buttons
          padding: "8px 20px",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          fontWeight: 700,
        },
        contained: {
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 4, // 4px radius for divs/blocks
          backgroundImage: "none",
          border:
            mode === "dark"
              ? "1px solid rgba(255,255,255,0.06)"
              : "1px solid rgba(0,0,0,0.06)",
          boxShadow:
            mode === "dark"
              ? "0 4px 20px rgba(0,0,0,0.4)"
              : "0 2px 12px rgba(0,0,0,0.04)",
        },
      },
    },
  },
});

function MuiThemeWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useNextTheme();
  // Handle SSR: wait until component is mounted to show corrected theme
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const mode = (
    mounted && resolvedTheme === "dark" ? "dark" : "light"
  ) as PaletteMode;
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

import { ToastProvider } from "@/lib/toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system">
      <SessionProvider>
        <MuiThemeWrapper>
          <ToastProvider>{children}</ToastProvider>
        </MuiThemeWrapper>
      </SessionProvider>
    </NextThemesProvider>
  );
}
