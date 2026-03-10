"use client";

import { useState, useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("pwaPromptDismissed");

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      if (!isDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleCloseClick = () => {
    setShowPrompt(false);
    localStorage.setItem("pwaPromptDismissed", "true");
  };

  return (
    <Snackbar
      open={showPrompt}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      message={
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Install MyFi
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Add to your device for quick access.
          </Typography>
        </Box>
      }
      action={
        <Box sx={{ display: "flex", gap: 0.75, alignItems: "center", ml: 1 }}>
          <Button
            color="primary"
            size="small"
            onClick={handleInstallClick}
            variant="contained"
            sx={{ fontWeight: 600, fontSize: "0.75rem" }}
          >
            Install
          </Button>
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseClick}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      }
      sx={{
        "& .MuiSnackbarContent-root": {
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 8px 32px rgba(0,0,0,0.5)"
              : "0 8px 32px rgba(0,0,0,0.08)",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        },
      }}
    />
  );
}
