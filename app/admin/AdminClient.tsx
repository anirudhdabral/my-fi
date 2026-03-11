"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { useToast } from "@/lib/toast";
import AdminConfigTab from "./components/AdminConfigTab";
import AdminUsersTab from "./components/AdminUsersTab";
import {
  type AdminUser,
  type BootstrapResponse,
  categoryFormSchema,
  type CategoryFormValues,
  type CategorySaveResponse,
  instrumentFormSchema,
  type InstrumentFormValues,
  type InstrumentSaveResponse,
} from "./types";

export default function AdminClient() {
  const { showToast } = useToast();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyPending, setShowOnlyPending] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { categories: [] },
  });

  const instrumentForm = useForm<InstrumentFormValues>({
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

  const onSubmitCategories = async (data: CategoryFormValues) => {
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

  const onSubmitInstruments = async (data: InstrumentFormValues) => {
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
        <AdminConfigTab
          categoryForm={categoryForm}
          instrumentForm={instrumentForm}
          categoryFields={categoryFields}
          instrumentFields={instrumentFields}
          appendCategory={appendCategory}
          removeCategory={removeCategory}
          appendInstrument={appendInstrument}
          removeInstrument={removeInstrument}
          categoryOptions={categoryOptions}
          currentCategorySum={currentCategorySum}
          canSubmitCategories={canSubmitCategories}
          canSubmitInstruments={canSubmitInstruments}
          onSubmitCategories={onSubmitCategories}
          onSubmitInstruments={onSubmitInstruments}
        />
      )}

      {activeTab === 1 && (
        <AdminUsersTab
          filteredUsers={filteredUsers}
          searchTerm={searchTerm}
          showOnlyPending={showOnlyPending}
          setSearchTerm={setSearchTerm}
          setShowOnlyPending={setShowOnlyPending}
          handleRebalance={handleRebalance}
          handleUserUpdate={handleUserUpdate}
        />
      )}
    </Container>
  );
}
