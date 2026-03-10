"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GoogleIcon from "@mui/icons-material/Google";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { useToast } from "@/lib/toast";

function SignInContent() {
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
        minHeight: "calc(100vh - 56px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Paper
          sx={{
            p: 3,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            width: { xs: 300, sm: 320 },
          }}
        >
          <Stack spacing={2}>
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              Sign in to MyFi
            </Typography>

            {isPaused && (
              <Alert severity="warning">Sign-ins are temporarily paused.</Alert>
            )}

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
                py: 1.25,
                fontWeight: 700,
              }}
            >
              Continue with Google
            </Button>

            <Button
              variant="text"
              size="small"
              startIcon={<ArrowBackIcon sx={{ fontSize: "16px !important" }} />}
              onClick={() => router.push("/")}
              sx={{
                color: "text.secondary",
                fontWeight: 500,
              }}
            >
              Back to home
            </Button>
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  );
}
