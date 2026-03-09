"use client";

import { useState, useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Extend the Event interface to support beforeinstallprompt
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
    // Only show the prompt if it hasn't been dismissed before
    const isDismissed = localStorage.getItem("pwaPromptDismissed");

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
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

    // Show the install modal
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
    // We optionally still allow them to click again if they cancel
  };

  const handleCloseClick = () => {
    setShowPrompt(false);
    // Remember the user's choice to not be bothered again
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
          <Typography variant="body2" color="text.secondary">
            Install this app on your device for quick access.
          </Typography>
        </Box>
      }
      action={
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", ml: 2 }}>
          <Button
            color="primary"
            size="small"
            onClick={handleInstallClick}
            variant="contained"
            sx={{ fontWeight: "bold", textTransform: "none" }}
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
              ? "0 8px 32px rgba(0,0,0,0.6)"
              : "0 8px 32px rgba(0,0,0,0.1)",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        },
      }}
    />
  );
}
