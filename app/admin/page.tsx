"use client";

import dynamic from "next/dynamic";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";

const AdminClient = dynamic(() => import("./AdminClient"), {
  ssr: false,
  loading: () => (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Skeleton
          variant="rectangular"
          width={200}
          height={36}
          sx={{ borderRadius: 2 }}
        />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={48}
          sx={{ borderRadius: 2 }}
        />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={400}
          sx={{ borderRadius: 3 }}
        />
      </Stack>
    </Container>
  ),
});

export default function AdminPage() {
  return <AdminClient />;
}
