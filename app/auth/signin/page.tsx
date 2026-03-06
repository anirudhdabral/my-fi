"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GoogleIcon from "@mui/icons-material/Google";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { motion } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useToast } from "@/lib/toast";

export default function SignInPage() {
  const { showToast } = useToast();
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPaused, setIsPaused] = useState(false);
  const [isCheckingPause, setIsCheckingPause] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchSignInStatus = async () => {
      try {
        const response = await fetch("/api/auth/signin-status");
        const payload = await response.json();

        if (!cancelled) {
          setIsPaused(Boolean(payload?.paused));
        }
      } catch {
        if (!cancelled) {
          setIsPaused(false);
        }
      } finally {
        if (!cancelled) {
          setIsCheckingPause(false);
        }
      }
    };

    void fetchSignInStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "PendingLimitReached") {
      showToast(
        "New sign-ins are temporarily paused. Please try again later.",
        "warning",
      );
    }
  }, [searchParams, showToast]);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return null;
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "calc(100vh - 72px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Paper
          sx={{
            p: 2,
            borderRadius: 5,
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(160deg, rgba(17,22,34,0.9), rgba(11,16,25,0.9))"
                : "linear-gradient(160deg, rgba(255,255,255,0.92), rgba(248,251,255,0.92))",
            backdropFilter: "blur(10px)",
            border: "1px solid",
            borderColor: "divider",
            width: { xs: 300, sm: 340 },
          }}
        >
          <Stack spacing={1.5} sx={{ mx: "auto" }}>
            {isPaused && (
              <Alert severity="warning">
                Sign-ins are temporarily paused. Please try again later.
              </Alert>
            )}
            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/")}
              sx={{
                borderRadius: 999,
                py: 1.2,
                fontWeight: 700,
                borderWidth: 1.5,
                "&:hover": { borderWidth: 1.5, transform: "translateY(-1px)" },
              }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              disabled={isPaused || isCheckingPause}
              onClick={() => {
                if (isPaused || isCheckingPause) {
                  return;
                }
                showToast("Redirecting to Google...", "info");
                signIn("google", { callbackUrl: "/" });
              }}
              sx={{
                borderRadius: 999,
                py: 1.2,
                fontWeight: 800,
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 10px 24px rgba(99,102,241,0.35)"
                    : "0 10px 24px rgba(79,70,229,0.28)",
                "&:hover": { transform: "translateY(-1px)" },
              }}
            >
              Sign in with Google
            </Button>
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
}
