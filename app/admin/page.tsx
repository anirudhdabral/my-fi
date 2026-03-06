"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as AddIcon,
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
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
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

import { useToast } from "@/lib/toast";

export default function AdminPage() {
  const { showToast } = useToast();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<
    {
      _id: string;
      name?: string;
      email: string;
      role: string;
      approved: boolean;
    }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyPending, setShowOnlyPending] = useState(false);
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

  const categoryOptions = categoryForm.watch("categories") ?? [];
  const currentCategorySum = useMemo(() => {
    return categoryOptions.reduce(
      (sum, cat) => sum + (Number(cat.percentage) || 0),
      0,
    );
  }, [categoryOptions]);

  const loadAdminData = async () => {
    try {
      const [catRes, instRes, userRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/instruments"),
        fetch("/api/admin/users"),
      ]);

      const [categories, instruments, usersData] = await Promise.all([
        catRes.json(),
        instRes.json(),
        userRes.json(),
      ]);

      categoryForm.reset({
        categories: (categories?.categories ?? []).map((c: any) => ({
          ...c,
          id: c._id,
        })),
      });
      instrumentForm.reset({
        instruments: (instruments?.instruments ?? []).map((i: any) => ({
          ...i,
          id: i._id,
          categoryId: i.categoryId?.toString() ?? "",
        })),
      });
      setUsers(usersData?.users ?? []);
    } catch {
      showToast("Unable to load admin data.", "error");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (session && session.user?.role !== "admin") {
      window.location.href = "/";
      return;
    }
    loadAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const onSubmitCategories = async (
    data: z.infer<typeof categoryFormSchema>,
  ) => {
    try {
      const response = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save categories");
      }
      categoryForm.reset({
        categories: payload.categories.map((c: any) => ({ ...c, id: c._id })),
      });
      showToast("Category targets updated", "success");
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
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save instruments");
      }
      instrumentForm.reset({
        instruments: payload.instruments.map((i: any) => ({
          ...i,
          id: i._id,
          categoryId: i.categoryId?.toString() ?? "",
        })),
      });
      showToast("Instrument targets saved", "success");
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
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack spacing={4}>
          <Box>
            <Skeleton
              variant="rectangular"
              width={300}
              height={48}
              sx={{ mb: 1, borderRadius: 1 }}
            />
            <Skeleton
              variant="rectangular"
              width={500}
              height={24}
              sx={{ borderRadius: 1 }}
            />
          </Box>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Stack direction="row" spacing={4}>
              <Skeleton
                variant="rectangular"
                width={150}
                height={40}
                sx={{ borderRadius: "4px 4px 0 0" }}
              />
              <Skeleton
                variant="rectangular"
                width={150}
                height={40}
                sx={{ borderRadius: "4px 4px 0 0" }}
              />
            </Stack>
          </Box>
          <Paper sx={{ p: 5, borderRadius: 1 }}>
            <Stack spacing={4}>
              <Box>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="40%" height={24} />
              </Box>
              <Stack spacing={2}>
                {[1, 2].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    width="100%"
                    height={80}
                    sx={{ borderRadius: 1 }}
                  />
                ))}
              </Stack>
            </Stack>
          </Paper>
          <Paper sx={{ p: 5, borderRadius: 1 }}>
            <Stack spacing={4}>
              <Box>
                <Skeleton variant="text" width="50%" height={32} />
                <Skeleton variant="text" width="30%" height={24} />
              </Box>
              <Stack spacing={2}>
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    width="100%"
                    height={80}
                    sx={{ borderRadius: 1 }}
                  />
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={1} mb={6}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Typography variant="h3" fontWeight={800}>
            Admin
          </Typography>
          <Typography color="text.secondary" variant="h6" fontWeight={400}>
            Control center for your financial portfolio and user access.
          </Typography>
        </motion.div>
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            "& .MuiTab-root": {
              minHeight: 64,
              fontSize: "1rem",
              fontWeight: 600,
            },
          }}
        >
          <Tab
            icon={<SettingsIcon />}
            iconPosition="start"
            label="Investment Config"
          />
          <Tab icon={<PeopleIcon />} iconPosition="start" label="User Access" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Stack spacing={4}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Paper sx={{ p: { xs: 3, md: 5 } }}>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h5" mb={1} fontWeight={700}>
                    Category Allocation Targets
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Define the high-level distribution across your asset
                    classes. Must total exactly 100%.
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.secondary"
                      >
                        Overall Allocation Progress
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={
                          Math.abs(currentCategorySum - 100) < 0.1
                            ? "success.main"
                            : "warning.main"
                        }
                      >
                        {currentCategorySum.toFixed(1)}% / 100%
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        width: "100%",
                        height: 8,
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
                          backgroundColor:
                            Math.abs(currentCategorySum - 100) < 0.1
                              ? "#10b981"
                              : "#f59e0b",
                          borderRadius: 2,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                <Stack spacing={1.5}>
                  {categoryFields.map((field, index) => (
                    <Box
                      key={field.id}
                      sx={{
                        p: 2.5,
                        borderRadius: 1,
                        bgcolor: (theme) =>
                          alpha(theme.palette.action.hover, 0.04),
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.02),
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        },
                      }}
                    >
                      <Grid container spacing={3} alignItems="center">
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Asset Class Name"
                            fullWidth
                            variant="standard"
                            placeholder="e.g. Stocks, Gold, Debt"
                            {...categoryForm.register(
                              `categories.${index}.name` as const,
                            )}
                            InputProps={{
                              disableUnderline: false,
                              sx: { fontSize: "1.05rem", fontWeight: 600 },
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
                            onKeyDown={(e) => {
                              if (["e", "E", "+", "-"].includes(e.key))
                                e.preventDefault();
                            }}
                            {...categoryForm.register(
                              `categories.${index}.percentage` as const,
                            )}
                            InputProps={{
                              endAdornment: (
                                <Typography
                                  variant="body2"
                                  sx={{ ml: 1, opacity: 0.5 }}
                                >
                                  %
                                </Typography>
                              ),
                              sx: { fontSize: "1.05rem", fontWeight: 600 },
                            }}
                          />
                        </Grid>
                        <Grid
                          size={{ xs: 3, md: 2 }}
                          display="flex"
                          justifyContent="flex-end"
                        >
                          <Tooltip title="Remove Category">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => removeCategory(index)}
                              sx={{
                                bgcolor: (theme) =>
                                  alpha(theme.palette.error.main, 0.1),
                                "&:hover": {
                                  bgcolor: (theme) =>
                                    alpha(theme.palette.error.main, 0.2),
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

                <Divider sx={{ my: 1 }} />

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ mt: 2 }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => appendCategory({ name: "", percentage: 0 })}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: 5,
                      textTransform: "none",
                      fontWeight: 700,
                      borderWidth: 2,
                      "&:hover": { borderWidth: 2 },
                    }}
                  >
                    Add Asset Class
                  </Button>
                  <Button
                    variant="contained"
                    onClick={categoryForm.handleSubmit(onSubmitCategories)}
                    disabled={
                      !canSubmitCategories ||
                      Math.abs(currentCategorySum - 100) > 0.1
                    }
                    sx={{
                      flex: 2,
                      py: 1.5,
                      borderRadius: 5,
                      textTransform: "none",
                      fontWeight: 700,
                      boxShadow: (theme) =>
                        `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  >
                    Save Allocation Targets
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Paper sx={{ p: { xs: 3, md: 5 } }}>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h5" mb={1} fontWeight={700}>
                    Investment Instruments
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Drill down into specific vehicles within each asset class.
                  </Typography>
                </Box>

                <Stack spacing={1.5}>
                  {instrumentFields.map((field, index) => (
                    <Box
                      key={field.id}
                      sx={{
                        p: 2.5,
                        borderRadius: 4,
                        bgcolor: (theme) =>
                          alpha(theme.palette.action.hover, 0.04),
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "secondary.main",
                          bgcolor: (theme) =>
                            alpha(theme.palette.secondary.main, 0.02),
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        },
                      }}
                    >
                      <Grid container spacing={3} alignItems="center">
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
                              sx: { fontSize: "1rem", fontWeight: 600 },
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
                            onKeyDown={(e) => {
                              if (["e", "E", "+", "-"].includes(e.key))
                                e.preventDefault();
                            }}
                            {...instrumentForm.register(
                              `instruments.${index}.inv_percentage` as const,
                            )}
                            InputProps={{
                              endAdornment: (
                                <Typography
                                  variant="caption"
                                  sx={{ ml: 0.5, opacity: 0.5 }}
                                >
                                  %
                                </Typography>
                              ),
                              sx: { fontSize: "1rem", fontWeight: 600 },
                            }}
                          />
                        </Grid>
                        <Grid
                          size={{ xs: 3, md: 2 }}
                          display="flex"
                          justifyContent="flex-end"
                        >
                          <Tooltip title="Remove Instrument">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => removeInstrument(index)}
                              sx={{
                                bgcolor: (theme) =>
                                  alpha(theme.palette.error.main, 0.1),
                                "&:hover": {
                                  bgcolor: (theme) =>
                                    alpha(theme.palette.error.main, 0.2),
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

                <Divider sx={{ my: 1 }} />

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ mt: 2 }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      appendInstrument({
                        type: "",
                        categoryId: categoryOptions[0]?.id ?? "",
                        inv_percentage: 0,
                      })
                    }
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: 5,
                      textTransform: "none",
                      fontWeight: 700,
                      borderWidth: 2,
                      borderColor: "secondary.main",
                      color: "secondary.main",
                      "&:hover": {
                        borderWidth: 2,
                        borderColor: "secondary.dark",
                        bgcolor: (theme) =>
                          alpha(theme.palette.secondary.main, 0.05),
                      },
                    }}
                  >
                    Add Instrument
                  </Button>
                  <Button
                    variant="contained"
                    onClick={instrumentForm.handleSubmit(onSubmitInstruments)}
                    disabled={!canSubmitInstruments}
                    sx={{
                      flex: 2,
                      py: 1.5,
                      borderRadius: 5,
                      textTransform: "none",
                      fontWeight: 700,
                      bgcolor: "secondary.main",
                      boxShadow: (theme) =>
                        `0 8px 16px ${alpha(theme.palette.secondary.main, 0.2)}`,
                      "&:hover": { bgcolor: "secondary.dark" },
                    }}
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Paper sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={4}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={2}
              >
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    Users
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Review join requests and manage messaging.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={handleRebalance}
                  sx={{
                    bgcolor: "secondary.main",
                    "&:hover": { bgcolor: "secondary.dark" },
                  }}
                >
                  Broadcast Rebalance Update
                </Button>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  size="small"
                  placeholder="Filter by name or email..."
                  sx={{ flexGrow: 1 }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showOnlyPending}
                      onChange={(e) => setShowOnlyPending(e.target.checked)}
                    />
                  }
                  label="Show pending only"
                />
              </Stack>

              <Stack spacing={1}>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <Paper
                      key={user._id}
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: "rgba(99, 102, 241, 0.02)",
                        },
                      }}
                    >
                      <Box>
                        <Typography fontWeight={600}>
                          {user.name || "Unnamed User"}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {user.email}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={2} alignItems="center">
                        {user.approved ? (
                          <Chip
                            label="Approved"
                            color="success"
                            size="small"
                            variant="filled"
                            icon={<CheckCircleIcon />}
                          />
                        ) : (
                          <Chip
                            label="Pending"
                            color="warning"
                            size="small"
                            variant="filled"
                            icon={<InfoIcon />}
                          />
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          color={user.approved ? "error" : "primary"}
                          onClick={() =>
                            handleUserUpdate(user._id, {
                              approved: !user.approved,
                            })
                          }
                          sx={{ minWidth: 140 }}
                        >
                          {user.approved ? "Revoke Access" : "Grant Access"}
                        </Button>
                      </Stack>
                    </Paper>
                  ))
                ) : (
                  <Box sx={{ py: 6, textAlign: "center" }}>
                    <Typography color="text.secondary">
                      No users matched your criteria.
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
