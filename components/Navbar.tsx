"use client";

import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
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
import {
  Logout as LogoutIcon,
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
      <Container>
        <Toolbar
          disableGutters
          sx={{
            height: 72,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                textDecoration: "none",
                color: "primary.main",
                letterSpacing: "-0.5px",
                cursor: "pointer",
                flexGrow: { xs: 1, md: 0 },
                mr: { md: 4 },
              }}
            >
              MyFi Portal
            </Typography>
          </Link>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              {!session && (
                <>
                  <ThemeToggle />
                </>
              )}
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
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        mt: 1.25,
                        borderRadius: 5,
                        minWidth: 280,
                        border: "1px solid",
                        borderColor: "divider",
                        overflow: "hidden",
                        background: (theme) =>
                          theme.palette.mode === "dark"
                            ? "linear-gradient(160deg, #111622 0%, #0b1019 100%)"
                            : "linear-gradient(160deg, #ffffff 0%, #f8fbff 100%)",
                        boxShadow: (theme) =>
                          theme.palette.mode === "dark"
                            ? "0 16px 40px rgba(0,0,0,0.45)"
                            : "0 14px 32px rgba(15,23,42,0.12)",
                        "& .MuiMenuItem-root": {
                          px: 1.25,
                          py: 0.5,
                          fontSize: "0.875rem",
                        },
                      },
                    }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        display: "flex",
                        gap: 1.75,
                        alignItems: "flex-start",
                      }}
                    >
                      <Avatar
                        src={session.user?.image || ""}
                        sx={{
                          width: 44,
                          height: 44,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      />
                      <Box sx={{ overflow: "hidden", minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={800} noWrap>
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
                        <Chip
                          size="small"
                          label={
                            session.user?.role === "admin" ? "Admin" : "User"
                          }
                          color={
                            session.user?.role === "admin"
                              ? "primary"
                              : "default"
                          }
                          sx={{ mt: 1, height: 22, fontWeight: 700 }}
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ opacity: 0.6 }} />

                    <Box sx={{ p: 1 }}>
                      {session?.user?.role === "admin" && (
                        <MenuItem
                          component={Link}
                          href="/admin"
                          onClick={handleCloseUserMenu}
                          sx={{
                            borderRadius: 3,
                            py: 1,
                            "&:hover": {
                              bgcolor: (theme) =>
                                alpha(theme.palette.primary.main, 0.1),
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
                          <Box>
                            <Typography variant="body2" fontWeight={700}>
                              Admin Console
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Manage users and configuration
                            </Typography>
                          </Box>
                        </MenuItem>
                      )}

                      <MenuItem
                        sx={{
                          cursor: "default",
                          borderRadius: 3,
                          py: 1,
                          "&:hover": { bgcolor: "transparent !important" },
                        }}
                      >
                        <ListItemIcon>
                          <ThemeIcon fontSize="small" />
                        </ListItemIcon>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" fontWeight={700}>
                            Dark mode
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Switch between light and dark mode
                          </Typography>
                        </Box>
                        <ThemeToggle variant="switch" />
                      </MenuItem>

                      <Divider sx={{ my: 0.75, opacity: 0.2 }} />

                      <MenuItem
                        onClick={async () => {
                          handleCloseUserMenu();
                          showToast("Signed out successfully", "success");
                          await signOut({ callbackUrl: "/" });
                        }}
                        sx={{
                          color: "error.main",
                          fontWeight: 700,
                          borderRadius: 3,
                          py: 1,
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
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            Sign Out
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            End current session
                          </Typography>
                        </Box>
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
