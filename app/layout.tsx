import Navbar from "@/components/Navbar";
import Box from "@mui/material/Box";
import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Providers from "./providers";
import InstallPWA from "@/components/InstallPWA";
import { cn } from "@/lib/utils";

const roboto = Roboto({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "MyFi | Smart Portfolio Allocation",
  description:
    "Calculate optimized investment splits across your asset classes with MyFi's intelligent allocation engine.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MyFi",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

// Static viewport removed — replaced by generateViewport() below (reads cookie)

const THEME_COLORS = { light: "#fafaf9", dark: "#0a0a0f" } as const;

export async function generateViewport(): Promise<Viewport> {
  const cookieStore = await cookies();
  const themeMode = (cookieStore.get("theme")?.value || "light") as
    | "light"
    | "dark";

  return {
    themeColor: [
      // Exact match for the user's saved preference — Android PWA picks this up on load
      { color: THEME_COLORS[themeMode] },
      // Fallback media-query entries so fresh installs without a cookie still work
      { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
      { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
    ],
    width: "device-width",
    initialScale: 1,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeMode = (cookieStore.get("theme")?.value || "light") as
    | "light"
    | "dark";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(themeMode, "font-sans", roboto.variable)}
    >
      <body>
        <Providers initialTheme={themeMode}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
              {children}
            </Box>
            <InstallPWA />
          </Box>
        </Providers>
      </body>
    </html>
  );
}
