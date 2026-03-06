"use client";

import { Button, Box, Container, Typography } from "@mui/material";
import { signIn, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useToast } from "@/lib/toast";

export default function SignInPage() {
  const { showToast } = useToast();
  const { data: session, status } = useSession();
  const router = useRouter();

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
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            borderRadius: 4,
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 8px 32px rgba(0,0,0,0.4)"
                : "0 8px 32px rgba(0,0,0,0.08)",
            p: 5,
            textAlign: "center",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h4" fontWeight={700} mb={1}>
            Sign In
          </Typography>
          <Typography color="text.secondary" mb={4}>
            Welcome back to MyFi Portal
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              showToast("Redirecting to Google...", "info");
              signIn("google", { callbackUrl: "/" });
            }}
            sx={{ borderRadius: 5, px: 4 }}
          >
            Continue with Google
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
}
