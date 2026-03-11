"use client";

import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";

import type { AdminUser } from "../types";

type Props = {
  filteredUsers: AdminUser[];
  searchTerm: string;
  showOnlyPending: boolean;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setShowOnlyPending: React.Dispatch<React.SetStateAction<boolean>>;
  handleRebalance: () => Promise<void>;
  handleUserUpdate: (
    userId: string,
    payload: { approved?: boolean },
  ) => Promise<void>;
};

export default function AdminUsersTab({
  filteredUsers,
  searchTerm,
  showOnlyPending,
  setSearchTerm,
  setShowOnlyPending,
  handleRebalance,
  handleUserUpdate,
}: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Stack direction={"column"} alignItems="flex-start" spacing={1.5}>
            <Box
              display={"flex"}
              alignItems={"center"}
              justifyContent={"space-between"}
              width="100%"
            >
              <Typography variant="h6" fontWeight={700}>
                Users
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={showOnlyPending}
                    onChange={(e) => setShowOnlyPending(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    Pending only
                  </Typography>
                }
                sx={{ mx: 0 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Manage access and broadcast updates.
            </Typography>
          </Stack>

          <Box display="flex" gap={1} mb={3}>
            <TextField
              size="small"
              placeholder="Search users..."
              sx={{ flexGrow: 1 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="contained"
              color="secondary"
              size="small"
              startIcon={<SendIcon sx={{ fontSize: "16px !important" }} />}
              onClick={handleRebalance}
            >
              Broadcast
            </Button>
          </Box>

          <Stack spacing={1}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Box
                  key={user._id}
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 1.5,
                    borderRadius: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: user.approved
                        ? "success.main"
                        : "warning.main",
                    },
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {user.name || "Unnamed"}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      variant="caption"
                      noWrap
                      sx={{ display: "block" }}
                    >
                      {user.email}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={user.approved ? "Approved" : "Pending"}
                      color={user.approved ? "success" : "warning"}
                      size="small"
                      variant="outlined"
                      icon={user.approved ? <CheckCircleIcon /> : <InfoIcon />}
                      sx={{ fontWeight: 600 }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      color={user.approved ? "error" : "primary"}
                      onClick={() =>
                        handleUserUpdate(user._id, {
                          approved: !user.approved,
                        })
                      }
                      sx={{ minWidth: 100, fontSize: "0.75rem" }}
                    >
                      {user.approved ? "Revoke" : "Approve"}
                    </Button>
                  </Stack>
                </Box>
              ))
            ) : (
              <Box sx={{ py: 5, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No users found.
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>
      </Paper>
    </motion.div>
  );
}
