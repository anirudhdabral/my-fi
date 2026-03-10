"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  People as PeopleIcon,
  Send as SendIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  percentage: z.coerce.number().min(1).max(100),
});

const instrumentSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  categoryId: z.string().min(1, "Category is required"),
  inv_percentage: z.coerce.number().min(1).max(100),
});

const categoryFormSchema = z.object({
  categories: z.array(categorySchema).min(1),
});

const instrumentFormSchema = z.object({
  instruments: z.array(instrumentSchema).min(0),
});

type AdminUser = {
  _id: string;
  name?: string;
  email: string;
  role: string;
  approved: boolean;
};

type CategoryApiItem = {
  _id: string;
  name: string;
  percentage: number;
};

type InstrumentApiItem = {
  _id: string;
  type: string;
  categoryId: string | { toString: () => string };
  inv_percentage: number;
};

type BootstrapResponse = {
  categories?: CategoryApiItem[];
  instruments?: InstrumentApiItem[];
  users?: AdminUser[];
  error?: string;
};

type CategorySaveResponse = {
  categories: CategoryApiItem[];
  error?: string;
};

type InstrumentSaveResponse = {
  instruments: InstrumentApiItem[];
  error?: string;
};

import { useToast } from "@/lib/toast";

export default function AdminClient() {
  const { showToast } = useToast();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyPending, setShowOnlyPending] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const categoryForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { categories: [] },
  });

  const instrumentForm = useForm<z.infer<typeof instrumentFormSchema>>({
    resolver: zodResolver(instrumentFormSchema),
    defaultValues: { instruments: [] },
  });

  const {
    fields: categoryFields,
    append: appendCategory,
    remove: removeCategory,
  } = useFieldArray({
    name: "categories",
    control: categoryForm.control,
  });

  const {
    fields: instrumentFields,
    append: appendInstrument,
    remove: removeInstrument,
  } = useFieldArray({
    name: "instruments",
    control: instrumentForm.control,
  });

  const canSubmitCategories = categoryForm.formState.isDirty;
  const canSubmitInstruments = instrumentForm.formState.isDirty;

  const watchedCategories = useWatch({
    control: categoryForm.control,
    name: "categories",
  });
  const categoryOptions = useMemo(
    () => watchedCategories ?? [],
    [watchedCategories],
  );
  const currentCategorySum = useMemo(() => {
    return categoryOptions.reduce(
      (sum, cat) => sum + (Number(cat.percentage) || 0),
      0,
    );
  }, [categoryOptions]);

  const loadAdminData = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/bootstrap");
      const payload: BootstrapResponse = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load admin data.");
      }

      categoryForm.reset({
        categories: (payload?.categories ?? []).map((c) => ({
          ...c,
          id: c._id,
        })),
      });
      instrumentForm.reset({
        instruments: (payload?.instruments ?? []).map((i) => ({
          ...i,
          id: i._id,
          categoryId: i.categoryId?.toString() ?? "",
        })),
      });
      setUsers(payload?.users ?? []);
    } catch {
      showToast("Unable to load admin data.", "error");
    } finally {
      setIsLoadingData(false);
    }
  }, [categoryForm, instrumentForm, showToast]);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (session && session.user?.role !== "admin") {
      router.replace("/");
      return;
    }
    void loadAdminData();
  }, [loadAdminData, router, session, status]);

  const onSubmitCategories = async (
    data: z.infer<typeof categoryFormSchema>,
  ) => {
    try {
      const response = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload: CategorySaveResponse = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save categories");
      }
      categoryForm.reset({
        categories: payload.categories.map((c) => ({ ...c, id: c._id })),
      });
      showToast("Categories updated", "success");
    } catch (error) {
      showToast((error as Error).message, "error");
    }
  };

  const onSubmitInstruments = async (
    data: z.infer<typeof instrumentFormSchema>,
  ) => {
    try {
      const response = await fetch("/api/admin/instruments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload: InstrumentSaveResponse = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save instruments");
      }
      instrumentForm.reset({
        instruments: payload.instruments.map((i) => ({
          ...i,
          id: i._id,
          categoryId: i.categoryId?.toString() ?? "",
        })),
      });
      showToast("Instruments saved", "success");
    } catch (error) {
      showToast((error as Error).message, "error");
    }
  };

  const handleUserUpdate = async (
    userId: string,
    payload: { approved?: boolean },
  ) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...payload }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error ?? "Unable to update user");
      }
      setUsers((prev) =>
        prev.map((user) => (user._id === userId ? result.user : user)),
      );
      showToast(
        payload.approved ? "Access granted" : "Access revoked",
        "success",
      );
    } catch (error) {
      showToast((error as Error).message, "error");
    }
  };

  const handleRebalance = async () => {
    try {
      const response = await fetch("/api/admin/rebalance", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to send rebalance emails");
      }
      showToast(payload.message ?? "Emails queued", "success");
    } catch (error) {
      showToast((error as Error).message, "error");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPending = showOnlyPending ? !user.approved : true;
    const isNotMe = user.email !== session?.user?.email;
    return matchesSearch && matchesPending && isNotMe;
  });

  if (status === "loading" || isLoadingData) {
    return (
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
            height={300}
            sx={{ borderRadius: 3 }}
          />
        </Stack>
      </Container>
    );
  }

  const isAllocationValid = Math.abs(currentCategorySum - 100) < 0.1;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ mb: 1, ml: -1.5 }}
        >
          <IconButton
            onClick={() => router.push("/")}
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "primary.main",
                bgcolor: alpha("#000", 0.05),
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight={800}>
            Admin
          </Typography>
        </Stack>
        <Typography color="text.secondary" variant="body2" sx={{ mb: 4 }}>
          Manage portfolio configuration and user access.
        </Typography>
      </motion.div>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            "& .MuiTab-root": {
              minHeight: 52,
              fontSize: "0.875rem",
              fontWeight: 600,
            },
          }}
        >
          <Tab
            icon={<SettingsIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Config"
          />
          <Tab
            icon={<PeopleIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Users"
          />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Stack spacing={3}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Paper sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                    Categories
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Asset class distribution. Must total 100%.
                  </Typography>
                </Box>

                {/* Progress bar */}
                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={0.75}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="text.secondary"
                    >
                      Allocation
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color={
                        isAllocationValid ? "success.main" : "warning.main"
                      }
                    >
                      {currentCategorySum.toFixed(1)}%
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      width: "100%",
                      height: 4,
                      bgcolor: (theme) => alpha(theme.palette.divider, 0.1),
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(currentCategorySum, 100)}%`,
                      }}
                      style={{
                        height: "100%",
                        backgroundColor: isAllocationValid
                          ? "#34d399"
                          : "#fbbf24",
                        borderRadius: 2,
                      }}
                    />
                  </Box>
                </Box>

                <Stack spacing={1.5}>
                  {categoryFields.map((field, index) => (
                    <Box
                      key={field.id}
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: (theme) =>
                          alpha(theme.palette.action.hover, 0.03),
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.02),
                        },
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Name"
                            fullWidth
                            variant="standard"
                            placeholder="e.g. Stocks, Gold"
                            {...categoryForm.register(
                              `categories.${index}.name` as const,
                            )}
                            InputProps={{
                              disableUnderline: false,
                              sx: { fontSize: "0.95rem", fontWeight: 600 },
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 9, md: 4 }}>
                          <TextField
                            label="Weight"
                            type="number"
                            fullWidth
                            variant="standard"
                            inputProps={{ step: 0.1, min: 1, max: 100 }}
                            onKeyDown={(e: React.KeyboardEvent) => {
                              if (["e", "E", "+", "-"].includes(e.key))
                                e.preventDefault();
                            }}
                            {...categoryForm.register(
                              `categories.${index}.percentage` as const,
                              {
                                valueAsNumber: true,
                                onChange: (
                                  e: React.ChangeEvent<HTMLInputElement>,
                                ) => {
                                  const val = e.target.value;
                                  if (val === "") return;
                                  const num = Number(val);
                                  if (num > 100) {
                                    categoryForm.setValue(
                                      `categories.${index}.percentage`,
                                      100,
                                    );
                                  } else if (num < 0) {
                                    categoryForm.setValue(
                                      `categories.${index}.percentage`,
                                      0,
                                    );
                                  }
                                },
                              },
                            )}
                            InputProps={{
                              endAdornment: (
                                <Typography
                                  variant="caption"
                                  sx={{ ml: 0.5, opacity: 0.4 }}
                                >
                                  %
                                </Typography>
                              ),
                              sx: { fontSize: "0.95rem", fontWeight: 600 },
                            }}
                          />
                        </Grid>
                        <Grid
                          size={{ xs: 3, md: 2 }}
                          display="flex"
                          justifyContent="flex-end"
                        >
                          <Tooltip title="Remove">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => removeCategory(index)}
                              sx={{
                                bgcolor: (theme) =>
                                  alpha(theme.palette.error.main, 0.08),
                                "&:hover": {
                                  bgcolor: (theme) =>
                                    alpha(theme.palette.error.main, 0.15),
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Stack>

                <Divider sx={{ opacity: 0.3 }} />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => appendCategory({ name: "", percentage: 0 })}
                    sx={{ flex: 1 }}
                  >
                    Add Category
                  </Button>
                  <Button
                    variant="contained"
                    onClick={categoryForm.handleSubmit(onSubmitCategories)}
                    disabled={!canSubmitCategories || !isAllocationValid}
                    sx={{ flex: 2 }}
                  >
                    Save Categories
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <Paper sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                    Instruments
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Specific vehicles within each category.
                  </Typography>
                </Box>

                <Stack spacing={1.5}>
                  {instrumentFields.map((field, index) => (
                    <Box
                      key={field.id}
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: (theme) =>
                          alpha(theme.palette.action.hover, 0.03),
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "secondary.main",
                          bgcolor: (theme) =>
                            alpha(theme.palette.secondary.main, 0.02),
                        },
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            label="Instrument"
                            fullWidth
                            variant="standard"
                            placeholder="e.g. Mutual Fund"
                            {...instrumentForm.register(
                              `instruments.${index}.type` as const,
                            )}
                            InputProps={{
                              disableUnderline: false,
                              sx: { fontSize: "0.9rem", fontWeight: 600 },
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Controller
                            name={`instruments.${index}.categoryId` as const}
                            control={instrumentForm.control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                select
                                label="Category"
                                fullWidth
                                variant="standard"
                              >
                                {categoryOptions.map((cat) => (
                                  <MenuItem
                                    key={cat.id ?? cat.name}
                                    value={cat.id ?? ""}
                                    disabled={!cat.id}
                                  >
                                    {cat.name || "Save category first"}
                                  </MenuItem>
                                ))}
                              </TextField>
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 9, md: 2 }}>
                          <TextField
                            label="Target"
                            fullWidth
                            variant="standard"
                            type="number"
                            inputProps={{ step: 0.1, min: 1, max: 100 }}
                            onKeyDown={(e: React.KeyboardEvent) => {
                              if (["e", "E", "+", "-"].includes(e.key))
                                e.preventDefault();
                            }}
                            {...instrumentForm.register(
                              `instruments.${index}.inv_percentage` as const,
                              {
                                valueAsNumber: true,
                                onChange: (
                                  e: React.ChangeEvent<HTMLInputElement>,
                                ) => {
                                  const val = e.target.value;
                                  if (val === "") return;
                                  const num = Number(val);
                                  if (num > 100) {
                                    instrumentForm.setValue(
                                      `instruments.${index}.inv_percentage`,
                                      100,
                                    );
                                  } else if (num < 0) {
                                    instrumentForm.setValue(
                                      `instruments.${index}.inv_percentage`,
                                      0,
                                    );
                                  }
                                },
                              },
                            )}
                            InputProps={{
                              endAdornment: (
                                <Typography
                                  variant="caption"
                                  sx={{ ml: 0.5, opacity: 0.4 }}
                                >
                                  %
                                </Typography>
                              ),
                              sx: { fontSize: "0.9rem", fontWeight: 600 },
                            }}
                          />
                        </Grid>
                        <Grid
                          size={{ xs: 3, md: 2 }}
                          display="flex"
                          justifyContent="flex-end"
                        >
                          <Tooltip title="Remove">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => removeInstrument(index)}
                              sx={{
                                bgcolor: (theme) =>
                                  alpha(theme.palette.error.main, 0.08),
                                "&:hover": {
                                  bgcolor: (theme) =>
                                    alpha(theme.palette.error.main, 0.15),
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Stack>

                <Divider sx={{ opacity: 0.3 }} />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    color="secondary"
                    onClick={() =>
                      appendInstrument({
                        type: "",
                        categoryId: categoryOptions[0]?.id ?? "",
                        inv_percentage: 0,
                      })
                    }
                    sx={{ flex: 1 }}
                  >
                    Add Instrument
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={instrumentForm.handleSubmit(onSubmitInstruments)}
                    disabled={!canSubmitInstruments}
                    sx={{ flex: 2 }}
                  >
                    Save Instruments
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </motion.div>
        </Stack>
      )}

      {activeTab === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Paper sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1.5}
              >
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Users
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage access and broadcast updates.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  startIcon={<SendIcon sx={{ fontSize: "16px !important" }} />}
                  onClick={handleRebalance}
                >
                  Broadcast Update
                </Button>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  size="small"
                  placeholder="Search users..."
                  sx={{ flexGrow: 1 }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                />
              </Stack>

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
                          icon={
                            user.approved ? <CheckCircleIcon /> : <InfoIcon />
                          }
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
      )}
    </Container>
  );
}
