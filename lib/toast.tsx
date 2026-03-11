"use client";

import type { AlertColor } from "@mui/material/Alert";
import Alert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import Snackbar from "@mui/material/Snackbar";
import type { TransitionProps } from "@mui/material/transitions";
import React, { createContext, useCallback, useContext, useState } from "react";

type ToastContextType = {
  showToast: (message: string, severity?: AlertColor) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

function SlideTransition(
  props: TransitionProps & { children: React.ReactElement },
) {
  return <Slide {...props} direction="up" />;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");

  const showToast = useCallback((msg: string, sev: AlertColor = "success") => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  }, []);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={SlideTransition}
        sx={{ mb: 2 }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: 2,
            fontWeight: 600,
            fontSize: "0.8125rem",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 8px 32px rgba(0,0,0,0.4)"
                : "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
