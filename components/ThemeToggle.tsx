"use client";

import IconButton from "@mui/material/IconButton";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useTheme as useNextTheme } from "next-themes";
import { useMemo } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useNextTheme();

  const icon = useMemo(
    () => (resolvedTheme === "dark" ? <LightModeIcon /> : <DarkModeIcon />),
    [resolvedTheme]
  );

  const oppositeTheme = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <IconButton
      aria-label="Toggle theme"
      color="inherit"
      onClick={() => setTheme(oppositeTheme)}
    >
      {icon}
    </IconButton>
  );
}
