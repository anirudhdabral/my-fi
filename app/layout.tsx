import Navbar from "@/components/Navbar";
import Box from "@mui/material/Box";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Providers from "./providers";
import InstallPWA from "@/components/InstallPWA";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "MyFi",
  description: "Smart portfolio allocation engine",
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

export const viewport: Viewport = {
  themeColor: "#7c3aed",
};

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
    <html lang="en" suppressHydrationWarning className={themeMode}>
      <body className={inter.variable}>
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
