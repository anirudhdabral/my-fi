"use client";

import InvestmentCalculator from "@/components/InvestmentCalculator";
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

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={4}>
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
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Box
            sx={{
              textAlign: "center",
              py: { xs: 8, md: 14 },
              px: { xs: 3, md: 6 },
              position: "relative",
            }}
          >
            {/* Decorative gradient orb */}
            <Box
              sx={{
                position: "absolute",
                top: "10%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 400,
                height: 400,
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? "radial-gradient(circle, rgba(196,181,253,0.08) 0%, transparent 65%)"
                    : "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 65%)",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: "2rem", sm: "2.75rem", md: "3.5rem" },
                  lineHeight: 1.1,
                  mb: 2,
                  background: (theme) =>
                    theme.palette.mode === "dark"
                      ? "linear-gradient(135deg, #e4e4e7 0%, #52525b 100%)"
                      : "linear-gradient(135deg, #18181b 0%, #71717a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Smart portfolio
                <br />
                allocation
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  maxWidth: 400,
                  mx: "auto",
                  mb: 4,
                  fontSize: { xs: "0.95rem", md: "1.05rem" },
                  lineHeight: 1.7,
                }}
              >
                Calculate optimized investment splits across your asset classes.
              </Typography>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => signIn()}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "0.95rem",
                }}
              >
                Get Started
              </Button>
            </Box>
          </Box>
        </motion.div>
      )}

      {/* Main Content */}
      {session && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {session.user?.approved ? (
            <InvestmentCalculator />
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
