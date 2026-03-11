"use client";

import CssBaseline from "@mui/material/CssBaseline";
import type { PaletteMode } from "@mui/material/styles";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { SessionProvider } from "next-auth/react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";
import { useMemo, useSyncExternalStore } from "react";

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    primary: {
      main: mode === "dark" ? "#c4b5fd" : "#7c3aed",
      light: "#ddd6fe",
      dark: "#6d28d9",
    },
    secondary: {
      main: mode === "dark" ? "#fbbf24" : "#d97706",
      light: "#fde68a",
      dark: "#b45309",
    },
    background: {
      default: mode === "dark" ? "#0a0a0f" : "#fafaf9",
      paper: mode === "dark" ? "#12121a" : "#ffffff",
    },
    text: {
      primary: mode === "dark" ? "#e4e4e7" : "#18181b",
      secondary: mode === "dark" ? "#71717a" : "#71717a",
    },
    divider: mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    error: {
      main: mode === "dark" ? "#fca5a5" : "#dc2626",
    },
    warning: {
      main: mode === "dark" ? "#fcd34d" : "#d97706",
    },
    success: {
      main: mode === "dark" ? "#86efac" : "#16a34a",
    },
  },
  typography: {
    fontFamily: '"Inter", var(--font-sans), system-ui, sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.1 },
    h2: { fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15 },
    h3: { fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.2 },
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700, letterSpacing: "-0.015em" },
    h6: { fontWeight: 600, letterSpacing: "-0.01em" },
    subtitle1: { fontWeight: 500, lineHeight: 1.5 },
    subtitle2: { fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: "0.9375rem", lineHeight: 1.65 },
    body2: { fontSize: "0.8125rem", lineHeight: 1.6 },
    button: {
      textTransform: "none" as const,
      fontWeight: 600,
      letterSpacing: "0.01em",
    },
    caption: { fontSize: "0.75rem", lineHeight: 1.5 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollBehavior: "smooth",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "9px 22px",
          fontWeight: 600,
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow:
              mode === "dark"
                ? "0 4px 16px rgba(196,181,253,0.12)"
                : "0 4px 16px rgba(124,58,237,0.18)",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundImage: "none",
          border:
            mode === "dark"
              ? "1px solid rgba(255,255,255,0.05)"
              : "1px solid rgba(0,0,0,0.04)",
          boxShadow:
            mode === "dark"
              ? "0 1px 4px rgba(0,0,0,0.4)"
              : "0 1px 3px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)",
          transition:
            "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            transition: "all 0.2s ease",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: mode === "dark" ? "#c4b5fd" : "#7c3aed",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none" as const,
          fontWeight: 600,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          "& .MuiSwitch-switchBase.Mui-checked": {
            color: mode === "dark" ? "#c4b5fd" : "#7c3aed",
          },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: mode === "dark" ? "#c4b5fd" : "#7c3aed",
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: "0.75rem",
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
      defaultProps: {
        animation: "wave" as const,
      },
    },
  },
});

function MuiThemeWrapper({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme: PaletteMode;
}) {
  const { resolvedTheme } = useNextTheme();
  const isHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const mode = (
    isHydrated ? resolvedTheme || initialTheme : initialTheme
  ) as PaletteMode;

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

import { ToastProvider } from "@/lib/toast";
import ThemeColorSync from "@/components/ThemeColorSync";

export default function Providers({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme: PaletteMode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={initialTheme}
      enableSystem={false}
    >
      <ThemeColorSync />
      <SessionProvider>
        <MuiThemeWrapper initialTheme={initialTheme}>
          <ToastProvider>{children}</ToastProvider>
        </MuiThemeWrapper>
      </SessionProvider>
    </NextThemesProvider>
  );
}
