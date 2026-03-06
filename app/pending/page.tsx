"use client";

import Link from "next/link";
import { Container, Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";

export default function PendingPage() {
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
          <Button component={Link} href="/auth/signin" variant="outlined">
            Sign in with a different account
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
}
