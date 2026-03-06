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

  const oppositeTheme = resolvedTheme === "dark" ? "light" : "dark";
  const checked = resolvedTheme === "dark";

  if (variant === "switch") {
    return (
      <Switch
        size="small"
        checked={checked}
        onChange={() => setTheme(oppositeTheme)}
        inputProps={{ "aria-label": "Toggle theme" }}
      />
    );
  }

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
