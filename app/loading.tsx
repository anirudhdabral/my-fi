"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

export default function Loading() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: 3,
      }}
    >
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CircularProgress
          size={56}
          thickness={4}
          sx={{
            color: (theme) => alpha(theme.palette.primary.main, 0.15),
          }}
        />
        <CircularProgress
          size={56}
          thickness={4}
          disableShrink
          sx={{
            color: "primary.main",
            position: "absolute",
            left: 0,
            strokeLinecap: "round",
            animationDuration: "1.2s",
          }}
        />
      </Box>
      <Typography
        variant="button"
        color="text.secondary"
        sx={{
          letterSpacing: "0.15em",
          fontWeight: 700,
          opacity: 0.7,
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          "@keyframes pulse": {
            "0%, 100%": { opacity: 0.7 },
            "50%": { opacity: 0.3 },
          },
        }}
      >
        LOADING
      </Typography>
    </Box>
  );
}
