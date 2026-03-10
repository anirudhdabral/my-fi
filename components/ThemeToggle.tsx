"use client";

import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useTheme as useNextTheme } from "next-themes";
import { useMemo } from "react";

type ThemeToggleProps = {
  variant?: "icon" | "switch";
};

export default function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useNextTheme();

  const icon = useMemo(
    () => (resolvedTheme === "dark" ? <LightModeIcon /> : <DarkModeIcon />),
    [resolvedTheme],
  );

  const checked = resolvedTheme === "dark";
  const oppositeTheme = checked ? "light" : "dark";
  const handleThemeChange = () => {
    const next = oppositeTheme;
    setTheme(next);
    document.cookie = `theme=${next}; path=/; max-age=31536000; samesite=lax`;
  };

  if (variant === "switch") {
    return (
      <Switch
        size="small"
        checked={checked}
        onChange={handleThemeChange}
        inputProps={{ "aria-label": "Toggle theme" }}
      />
    );
  }

  return (
    <IconButton
      aria-label="Toggle theme"
      color="inherit"
      onClick={handleThemeChange}
    >
      {icon}
    </IconButton>
  );
}
