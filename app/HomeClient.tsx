"use client";

import dynamic from "next/dynamic";
const InvestmentCalculator = dynamic(
  () => import("@/components/InvestmentCalculator"),
  {
    loading: () => (
      <Stack spacing={3}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={180}
          sx={{ borderRadius: 2.5 }}
        />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={300}
          sx={{ borderRadius: 2.5 }}
        />
      </Stack>
    ),
  },
);
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { alpha } from "@mui/material/styles";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function HomeClient({
  initialMetadata,
}: {
  initialMetadata: any;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={3}>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={180}
            sx={{ borderRadius: 2.5 }}
          />
          <Skeleton
            variant="rectangular"
            width="100%"
            height={300}
            sx={{ borderRadius: 2.5 }}
          />
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
      {/* Hero Section — only for unauthenticated users */}
      {!session && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Box
            sx={{
              textAlign: "center",
              py: { xs: 8, md: 14 },
              px: { xs: 3, md: 6 },
              position: "relative",
            }}
          >
            {/* Decorative gradient orb — primary */}
            <Box
              sx={{
                position: "absolute",
                top: "5%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 500,
                height: 500,
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? "radial-gradient(circle, rgba(196,181,253,0.07) 0%, transparent 60%)"
                    : "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 60%)",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
            {/* Decorative gradient orb — secondary */}
            <Box
              sx={{
                position: "absolute",
                bottom: "15%",
                right: "-5%",
                width: 300,
                height: 300,
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? "radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 65%)"
                    : "radial-gradient(circle, rgba(217,119,6,0.04) 0%, transparent 65%)",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />

            <Box sx={{ position: "relative", zIndex: 1 }}>
              <motion.div variants={itemVariants}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    mb: 3,
                    px: 2,
                    py: 0.75,
                    borderRadius: 6,
                    border: "1px solid",
                    borderColor: (theme) =>
                      alpha(theme.palette.primary.main, 0.15),
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                  }}
                >
                  <AutoAwesomeRoundedIcon
                    sx={{ fontSize: 14, color: "primary.main" }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      letterSpacing: "0.03em",
                    }}
                  >
                    Smart Allocation Engine
                  </Typography>
                </Box>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: "2rem", sm: "2.75rem", md: "3.5rem" },
                    lineHeight: 1.1,
                    mb: 2,
                    background: (theme) =>
                      theme.palette.mode === "dark"
                        ? "linear-gradient(135deg, #f4f4f5 0%, #71717a 100%)"
                        : "linear-gradient(135deg, #18181b 0%, #52525b 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Smart portfolio
                  <br />
                  allocation
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    maxWidth: 420,
                    mx: "auto",
                    mb: 4.5,
                    fontSize: { xs: "0.95rem", md: "1.05rem" },
                    lineHeight: 1.7,
                  }}
                >
                  Calculate optimized investment splits across your asset
                  classes with precision.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => signIn()}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: "0.95rem",
                    borderRadius: 2,
                    background: (theme) =>
                      theme.palette.mode === "dark"
                        ? "linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%)"
                        : "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                    color: (theme) =>
                      theme.palette.mode === "dark" ? "#18181b" : "#fff",
                    "&:hover": {
                      background: (theme) =>
                        theme.palette.mode === "dark"
                          ? "linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)"
                          : "linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: (theme) =>
                        theme.palette.mode === "dark"
                          ? "0 8px 24px rgba(196,181,253,0.2)"
                          : "0 8px 24px rgba(124,58,237,0.25)",
                    },
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  Get Started
                </Button>
              </motion.div>
            </Box>
          </Box>
        </motion.div>
      )}

      {/* Main Content */}
      {session && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {session.user?.approved ? (
            <InvestmentCalculator initialMetadata={initialMetadata} />
          ) : (
            <Paper
              sx={{
                p: { xs: 4, md: 5 },
                textAlign: "center",
                border: (theme) =>
                  `1px solid ${
                    theme.palette.mode === "dark"
                      ? "rgba(252,211,77,0.12)"
                      : "rgba(217,119,6,0.1)"
                  }`,
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(252,211,77,0.03)"
                    : "rgba(217,119,6,0.02)",
              }}
            >
              <HourglassEmptyRoundedIcon
                sx={{
                  fontSize: 36,
                  color: "warning.main",
                  mb: 2,
                  opacity: 0.6,
                }}
              />
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                Access Pending
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 360, mx: "auto" }}
              >
                Your account is waiting for admin approval. You&apos;ll get
                access once approved.
              </Typography>
            </Paper>
          )}
        </motion.div>
      )}
    </Container>
  );
}
