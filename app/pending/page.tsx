"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingScreen from "@/app/loading";

export default function PendingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
              color: "text.secondary",
              mb: 2,
              opacity: 0.4,
            }}
          />
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1.5 }}>
            Access Pending
          </Typography>
          <Typography
            color="text.secondary"
            variant="body2"
            sx={{ mb: 3, maxWidth: 340, mx: "auto", lineHeight: 1.7 }}
          >
            Your account is awaiting admin approval. You&apos;ll receive an
            email once access is granted.
          </Typography>
          {status === "authenticated" ? (
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
