"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GoogleIcon from "@mui/icons-material/Google";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";

import { useToast } from "@/lib/toast";
import LoadingScreen from "@/app/loading";

function SignInContent() {
  const { showToast } = useToast();
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return <LoadingScreen />;
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

            <Button
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={() => {
                showToast("Redirecting to Google...", "info");
                signIn("google", { callbackUrl: "/" }, { prompt: "select_account" });
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
    <Suspense fallback={<LoadingScreen />}>
      <SignInContent />
    </Suspense>
  );
}
