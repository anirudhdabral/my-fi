"use client";

import { useToast } from "@/lib/toast";
import {
  Settings as AdminIcon,
  CalculateOutlined as CalcIcon,
  DarkMode as DarkModeIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ThemeToggle = dynamic(() => import("./ThemeToggle"), { ssr: false });

export default function Navbar() {
  const { showToast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isAdmin = session?.user?.role === "admin";

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (isAdmin) {
      router.prefetch("/admin");
    }
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (isAdmin) {
      router.prefetch("/admin");
      return;
    }

    if (!session) {
      router.prefetch("/auth/signin");
    }
  }, [isAdmin, router, session]);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? alpha(theme.palette.background.default, 0.8)
            : alpha("#fafaf9", 0.85),
        backdropFilter: "blur(16px) saturate(180%)",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="md">
        <Toolbar
          disableGutters
          sx={{
            height: 56,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Image
                src="/favicon-32x32.png"
                alt="MyFi"
                width={22}
                height={22}
                style={{ borderRadius: 4 }}
                unoptimized
                priority
              />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  letterSpacing: "-0.02em",
                }}
              >
                MyFi
              </Typography>
            </Stack>
          </Link>

          <Stack direction="row" spacing={0.5} alignItems="center">
            {!session && <ThemeToggle />}
            {session && (
              <>
                <IconButton
                  onClick={handleOpenUserMenu}
                  size="small"
                  sx={{
                    p: 0.25,
                    border: "2px solid",
                    borderColor: Boolean(anchorEl)
                      ? "primary.main"
                      : "transparent",
                    borderRadius: "100%",
                    transition: "all 0.2s ease",
                    "&:hover": { borderColor: "primary.main" },
                  }}
                >
                  <Avatar
                    alt={session.user?.name || ""}
                    src={session.user?.image || ""}
                    sx={{ width: 28, height: 28, borderRadius: "100%" }}
                    variant="rounded"
                  />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  id="account-menu"
                  open={Boolean(anchorEl)}
                  onClose={handleCloseUserMenu}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      mt: 1.5,
                      borderRadius: 2.5,
                      minWidth: 240,
                      border: "1px solid",
                      borderColor: "divider",
                      overflow: "hidden",
                      bgcolor: "background.paper",
                      boxShadow: (theme) =>
                        theme.palette.mode === "dark"
                          ? "0 12px 40px rgba(0,0,0,0.5)"
                          : "0 12px 40px rgba(0,0,0,0.08)",
                      "& .MuiMenuItem-root": {
                        px: 1.5,
                        py: 0.75,
                        fontSize: "0.8125rem",
                      },
                    },
                  }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      display: "flex",
                      gap: 1.25,
                      alignItems: "center",
                    }}
                  >
                    <Avatar
                      src={session.user?.image || ""}
                      variant="rounded"
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: "100%",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                    <Box sx={{ overflow: "hidden", minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={700} noWrap>
                        {session.user?.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{ display: "block" }}
                      >
                        {session.user?.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ opacity: 0.4 }} />

                  <Box sx={{ p: 0.5 }}>
                    {isAdmin && (
                      <MenuItem
                        component={Link}
                        href="/admin"
                        onClick={handleCloseUserMenu}
                        sx={{
                          borderRadius: 1.5,
                          py: 1,
                          "&:hover": {
                            bgcolor: (theme) =>
                              alpha(theme.palette.primary.main, 0.08),
                            color: "primary.main",
                          },
                        }}
                      >
                        <ListItemIcon>
                          <AdminIcon
                            fontSize="small"
                            sx={{ color: "inherit" }}
                          />
                        </ListItemIcon>
                        <Typography variant="body2" fontWeight={600}>
                          Admin Console
                        </Typography>
                      </MenuItem>
                    )}

                    <MenuItem
                      component={Link}
                      href="/calculators"
                      onClick={handleCloseUserMenu}
                      sx={{
                        borderRadius: 1.5,
                        py: 1,
                        "&:hover": {
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.08),
                          color: "primary.main",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <CalcIcon fontSize="small" sx={{ color: "inherit" }} />
                      </ListItemIcon>
                      <Typography variant="body2" fontWeight={600}>
                        Calculators
                      </Typography>
                    </MenuItem>

                    <MenuItem
                      sx={{
                        cursor: "default",
                        borderRadius: 1.5,
                        py: 1,
                        "&:hover": { bgcolor: "transparent !important" },
                      }}
                    >
                      <ListItemIcon>
                        <DarkModeIcon fontSize="small" />
                      </ListItemIcon>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ flexGrow: 1 }}
                      >
                        Dark mode
                      </Typography>
                      <ThemeToggle variant="switch" />
                    </MenuItem>

                    <Divider sx={{ my: 0.5, opacity: 0.15 }} />

                    <MenuItem
                      onClick={async () => {
                        handleCloseUserMenu();
                        showToast("Signed out successfully", "success");
                        await signOut({ callbackUrl: "/" });
                      }}
                      sx={{
                        color: "error.main",
                        fontWeight: 600,
                        borderRadius: 1.5,
                        py: 1,
                        "&:hover": {
                          bgcolor: (theme) =>
                            alpha(theme.palette.error.main, 0.06),
                        },
                      }}
                    >
                      <ListItemIcon>
                        <LogoutIcon
                          fontSize="small"
                          sx={{ color: "inherit" }}
                        />
                      </ListItemIcon>
                      <Typography variant="body2" fontWeight={600}>
                        Sign Out
                      </Typography>
                    </MenuItem>
                  </Box>
                </Menu>
              </>
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
