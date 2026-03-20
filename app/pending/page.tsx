"use client";

import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import LoadingScreen from "@/app/loading";

export default function PendingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const limitReached = searchParams.get("limitReached") === "1";

  useEffect(() => {
    if (status === "authenticated" && session?.user?.approved) {
      router.replace("/");
    }
  }, [router, session?.user?.approved, status]);

  if (status === "loading") {
    return <LoadingScreen />;
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
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Box
          sx={{
            p: { xs: 4, md: 5 },
            textAlign: "center",
          }}
        >
          <HourglassEmptyRoundedIcon
            sx={{
              fontSize: 44,
              color: limitReached ? "error.main" : "text.secondary",
              mb: 2,
              opacity: 0.5,
            }}
          />
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1.5 }}>
            {limitReached ? "Pending Queue Full" : "Access Pending"}
          </Typography>
          <Typography
            color="text.secondary"
            variant="body2"
            sx={{ mb: 3, maxWidth: 380, mx: "auto", lineHeight: 1.7 }}
          >
            {limitReached
              ? "This account is not already approved or pending, and there are already 3 accounts waiting for approval. Sign out and use another account, or try again later."
              : "Your account is awaiting admin approval. You'll receive an email once access is granted."}
          </Typography>
          {limitReached && status === "authenticated" ? (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              justifyContent="center"
            >
              <Button
                variant="contained"
                color="error"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              >
                Log out
              </Button>
              <Button
                variant="outlined"
                onClick={() =>
                  signIn("google", { callbackUrl: "/" }, { prompt: "select_account" })
                }
              >
                Use another account
              </Button>
            </Stack>
          ) : status === "authenticated" ? (
            <Button component={Link} href="/" variant="outlined" size="small">
              Go to home
            </Button>
          ) : (
            <Button
              component={Link}
              href="/auth/signin"
              variant="outlined"
              size="small"
            >
              Try another account
            </Button>
          )}
        </Box>
      </motion.div>
    </Container>
  );
}
