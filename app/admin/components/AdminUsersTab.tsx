"use client";

import { Delete as DeleteIcon, Send as SendIcon } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { useState } from "react";

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
  handleUserDelete: (userId: string) => Promise<void>;
};

export default function AdminUsersTab({
  filteredUsers,
  searchTerm,
  showOnlyPending,
  setSearchTerm,
  setShowOnlyPending,
  handleRebalance,
  handleUserUpdate,
  handleUserDelete,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "revoke" | "delete";
    userId: string;
    userName: string;
  } | null>(null);

  const handleOpenConfirm = (
    type: "approve" | "revoke" | "delete",
    userId: string,
    userName: string,
  ) => {
    setConfirmAction({ type, userId, userName });
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
    setConfirmAction(null);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === "approve") {
      await handleUserUpdate(confirmAction.userId, { approved: true });
    } else if (confirmAction.type === "revoke") {
      await handleUserUpdate(confirmAction.userId, { approved: false });
    } else {
      await handleUserDelete(confirmAction.userId);
    }
    handleCloseConfirm();
  };

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
              startIcon={<SendIcon sx={{ fontSize: "16px" }} />}
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
                  <Stack direction="row" spacing={1}>
                    {user.approved ? (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() =>
                          handleOpenConfirm(
                            "revoke",
                            user._id,
                            user.name || user.email,
                          )
                        }
                        sx={{ minWidth: 90, fontSize: "0.75rem", p: 0.5 }}
                      >
                        Revoke
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() =>
                            handleOpenConfirm(
                              "approve",
                              user._id,
                              user.name || user.email,
                            )
                          }
                          sx={{ minWidth: 90, fontSize: "0.75rem", p: 0.5 }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={
                            <DeleteIcon sx={{ fontSize: "14px !important" }} />
                          }
                          onClick={() =>
                            handleOpenConfirm(
                              "delete",
                              user._id,
                              user.name || user.email,
                            )
                          }
                          sx={{ minWidth: 90, fontSize: "0.75rem", p: 0.5 }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </Stack>
                </Box>
              ))
            ) : (
              <Box sx={{ py: 5, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No {showOnlyPending ? "pending" : ""} users found.
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Dialog
        open={confirmOpen}
        onClose={handleCloseConfirm}
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {confirmAction?.type === "approve"
            ? "Approve User?"
            : confirmAction?.type === "revoke"
              ? "Revoke Access?"
              : "Remove User?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmAction?.type === "approve" ? (
              <>
                Are you sure you want to approve <b>{confirmAction.userName}</b>
                ? This will grant them immediate access to the application.
              </>
            ) : confirmAction?.type === "revoke" ? (
              <>
                Are you sure you want to revoke access for{" "}
                <b>{confirmAction.userName}</b>? This will prevent them from
                accessing the application until approved again.
              </>
            ) : (
              <>
                Are you sure you want to remove <b>{confirmAction?.userName}</b>
                ? This action will delete their account data and cannot be
                undone.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseConfirm} sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            color={confirmAction?.type === "approve" ? "primary" : "error"}
            variant="contained"
            sx={{ borderRadius: 2, fontWeight: 600 }}
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
