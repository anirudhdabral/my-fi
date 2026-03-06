"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PendingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.approved) {
      router.replace("/");
    }
  }, [router, session?.user?.approved, status]);

  if (status === "loading") {
    return null;
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Box
          sx={{
            p: 4,
            borderRadius: 4,
            boxShadow: 4,
            backgroundColor: (theme) => theme.palette.background.paper,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" gutterBottom>
            Access Pending
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Your account is awaiting approval from the admin team. You will
            receive an email once access is granted.
          </Typography>
          {status === "authenticated" ? (
            <Button component={Link} href="/" variant="outlined">
              Go to dashboard
            </Button>
          ) : (
            <Button component={Link} href="/auth/signin" variant="outlined">
              Sign in with a different account
            </Button>
          )}
        </Box>
      </motion.div>
    </Container>
  );
}
