"use client";

import { signIn, useSession } from "next-auth/react";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  Skeleton,
  Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion } from "framer-motion";
import {
  ShieldRounded as ShieldIcon,
  AutoGraphRounded as InsightsIcon,
  BalanceRounded as RebalanceIcon,
} from "@mui/icons-material";
import InvestmentCalculator from "@/components/InvestmentCalculator";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Stack spacing={6}>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={400}
            sx={{ borderRadius: 4 }}
          />
          <Box>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={200}
              sx={{ borderRadius: 4, mb: 4 }}
            />
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={150}
                  sx={{ borderRadius: 4 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={150}
                  sx={{ borderRadius: 4 }}
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            mb: 6,
            position: "relative",
            overflow: "hidden",
            borderRadius: 4,
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #16161a 0%, #0a0a0c 100%)"
                : "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
            border: (theme) =>
              `1px solid ${
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(99,102,241,0.1)"
              }`,
          }}
        >
          {/* Decorative background element */}
          <Box
            sx={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              background:
                "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
              zIndex: 0,
            }}
          />

          <Stack
            spacing={3}
            sx={{ position: "relative", zIndex: 1, maxWidth: 700 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2.2rem", md: "3.4rem" },
                lineHeight: 1.1,
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? "linear-gradient(to bottom right, #fff, #94a3b8)"
                    : "linear-gradient(to bottom right, #1e293b, #64748b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              MyFi Investment
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ lineHeight: 1.6, fontWeight: 400 }}
            >
              Precision allocation management for the modern investor. Securely
              scale your wealth with data-driven insights and automated
              rebalancing.
            </Typography>
            {!session && (
              <Stack direction="row" spacing={1.25} sx={{ pt: 1 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => signIn()}
                  sx={{ borderRadius: 999, px: 4, py: 1.25, fontWeight: 700 }}
                >
                  Sign In
                </Button>
              </Stack>
            )}
          </Stack>
        </Paper>
      </motion.div>

      {!session && (
        <Grid
          id="platform-highlights"
          container
          spacing={3}
          sx={{ mb: { xs: 5, md: 7 } }}
        >
          {[
            {
              title: "Secure Access Controls",
              description:
                "Approval-based access and role boundaries keep portfolio operations tightly governed.",
              icon: <ShieldIcon fontSize="small" />,
            },
            {
              title: "Data-Driven Insights",
              description:
                "Allocation decisions are backed by structured inputs and repeatable calculation flows.",
              icon: <InsightsIcon fontSize="small" />,
            },
            {
              title: "Rebalance Ready",
              description:
                "Detect gaps, align targets, and move from intent to rebalancing with confidence.",
              icon: <RebalanceIcon fontSize="small" />,
            },
          ].map((item) => (
            <Grid key={item.title} size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  p: 3,
                  height: "100%",
                  borderRadius: 4,
                  background: (theme) =>
                    theme.palette.mode === "dark"
                      ? "linear-gradient(160deg, #151923 0%, #0f131d 100%)"
                      : "linear-gradient(160deg, #ffffff 0%, #f8fbff 100%)",
                }}
              >
                <Stack spacing={1.5}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(129,140,248,0.16)"
                          : "rgba(99,102,241,0.1)",
                      color: "primary.main",
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ mb: 8 }}>
        {session &&
          (session.user?.approved ? (
            <InvestmentCalculator />
          ) : (
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: "warning.main",
                color: "warning.contrastText",
                borderRadius: 4,
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                Access Pending
              </Typography>
              <Typography variant="body2">
                Your account is currently waiting for admin approval. You will
                be able to use the allocation engine once approved.
              </Typography>
            </Paper>
          ))}
      </Box>
    </Container>
  );
}
