"use client";

import Link from "next/link";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Stack,
  useTheme,
  alpha,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  ListItemIcon,
  IconButton,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  PersonOutline as PersonIcon,
  ColorLens as ThemeIcon,
  Settings as AdminIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import { useToast } from "@/lib/toast";

export default function Navbar() {
  const { showToast } = useToast();
  const { data: session } = useSession();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? alpha(theme.palette.background.default, 0.7)
            : alpha("#ffffff", 0.8),
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 72 }}>
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              fontWeight: 700,
              textDecoration: "none",
              color: "primary.main",
              flexGrow: { xs: 1, md: 0 },
              mr: { md: 4 },
              letterSpacing: "-0.5px",
            }}
          >
            MyFi Portal
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}
          >
            {/* Nav items if any */}
          </Stack>

          <Box sx={{ flexGrow: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              {!session && <ThemeToggle />}
              {session && (
                <>
                  <IconButton
                    onClick={handleOpenUserMenu}
                    size="small"
                    sx={{
                      p: 0.25,
                      border: "1px solid",
                      borderColor: Boolean(anchorEl)
                        ? "primary.main"
                        : "divider",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: "primary.main" },
                    }}
                  >
                    <Avatar
                      alt={session.user?.name || ""}
                      src={session.user?.image || ""}
                      sx={{ width: 32, height: 32 }}
                    />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={Boolean(anchorEl)}
                    onClose={handleCloseUserMenu}
                    onClick={handleCloseUserMenu}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        mt: 1,
                        borderRadius: 4,
                        minWidth: 220,
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: (theme) =>
                          theme.palette.mode === "dark"
                            ? "0 8px 32px rgba(0,0,0,0.4)"
                            : "0 8px 32px rgba(0,0,0,0.08)",
                        "& .MuiMenuItem-root": {
                          px: 2,
                          py: 1,
                          fontSize: "0.875rem",
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
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <Avatar
                        src={session.user?.image || ""}
                        sx={{
                          width: 40,
                          height: 40,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      />
                      <Box sx={{ overflow: "hidden" }}>
                        <Typography variant="body2" fontWeight={700} noWrap>
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

                    <Divider sx={{ my: 0.5, opacity: 0.6 }} />

                    <Box sx={{ px: 2, py: 0.5 }}>
                      {session?.user?.role === "admin" && (
                        <>
                          <MenuItem
                            component={Link}
                            href="/admin"
                            onClick={handleCloseUserMenu}
                            sx={{
                              borderRadius: 4,
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
                            Admin
                          </MenuItem>
                          <Divider sx={{ mx: 2, my: 0.5, opacity: 0.1 }} />
                        </>
                      )}

                      <MenuItem
                        sx={{
                          cursor: "default",
                          borderRadius: 4,
                          "&:hover": { bgcolor: "transparent !important" },
                        }}
                      >
                        <ListItemIcon>
                          <ThemeIcon fontSize="small" />
                        </ListItemIcon>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" fontWeight={500}>
                            Appearance
                          </Typography>
                        </Box>
                        <ThemeToggle />
                      </MenuItem>

                      <Divider sx={{ mx: 2, my: 0.5, opacity: 0.1 }} />

                      <MenuItem
                        onClick={async () => {
                          showToast("Signed out successfully", "success");
                          await signOut({ callbackUrl: "/" });
                        }}
                        sx={{
                          color: "error.main",
                          fontWeight: 600,
                          borderRadius: 4,
                          "&:hover": {
                            bgcolor: (theme) =>
                              alpha(theme.palette.error.main, 0.08),
                          },
                        }}
                      >
                        <ListItemIcon>
                          <LogoutIcon
                            fontSize="small"
                            sx={{ color: "inherit" }}
                          />
                        </ListItemIcon>
                        Sign Out
                      </MenuItem>
                    </Box>
                  </Menu>
                </>
              )}
            </Stack>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
