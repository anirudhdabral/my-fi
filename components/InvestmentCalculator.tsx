"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Tooltip as MuiTooltip,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const currencies = [
  { value: "INR", label: "₹ (INR)", symbol: "₹" },
  { value: "USD", label: "$ (USD)", symbol: "$" },
  { value: "EUR", label: "€ (EUR)", symbol: "€" },
  { value: "GBP", label: "£ (GBP)", symbol: "£" },
];
import { motion } from "framer-motion";

const calculatorSchema = z.object({
  amount: z.coerce.number().positive(),
});

type InvestmentCategory = {
  _id: string;
  name: string;
  percentage: number;
};

type InvestmentInstrument = {
  _id: string;
  type: string;
  categoryId: string;
  inv_percentage: number;
};

type Allocation = {
  instrumentId: string;
  categoryId: string;
  allocatedAmount: number;
};

import { useToast } from "@/lib/toast";

export default function InvestmentCalculator() {
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ amount: number }>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: { amount: 10000 },
  });

  const [allocations, setAllocations] = useState<Allocation[] | null>(null);
  const [metadata, setMetadata] = useState<{
    categories: InvestmentCategory[];
    instruments: InvestmentInstrument[];
  } | null>(null);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    fetch("/api/investments/metadata")
      .then((res) => res.json())
      .then((payload) => {
        setMetadata(payload);
        if (payload?.categories) {
          setSelectedCategoryIds(payload.categories.map((c: any) => c._id));
        }
      })
      .catch(() => setMetadata(null));
  }, []);

  const categorizedResults = useMemo(() => {
    if (!allocations || !metadata) {
      return [];
    }

    return allocations.map((allocation) => {
      const category = metadata.categories.find(
        (item) => item._id === allocation.categoryId,
      );
      const instrument = metadata.instruments.find(
        (item) => item._id === allocation.instrumentId,
      );
      return {
        ...allocation,
        categoryName: category?.name ?? "Unknown category",
        instrumentType: instrument?.type ?? "Unknown type",
      };
    });
  }, [allocations, metadata]);

  const groupedResults = useMemo(() => {
    if (!allocations || !metadata) return {};
    const grouped = categorizedResults.reduce(
      (acc, res) => {
        if (!acc[res.categoryName]) acc[res.categoryName] = [];
        acc[res.categoryName].push(res);
        return acc;
      },
      {} as Record<string, typeof categorizedResults>,
    );
    return grouped;
  }, [categorizedResults, allocations, metadata]);

  const handleCopyAll = () => {
    if (!categorizedResults.length) return;
    const text = categorizedResults
      .map(
        (r) =>
          `${r.categoryName} > ${r.instrumentType}: ${
            currencies.find((c) => c.value === currency)?.symbol
          }${r.allocatedAmount.toLocaleString()}`,
      )
      .join("\n");
    navigator.clipboard.writeText(text);
    showToast("Results copied to clipboard", "success");
  };

  const onSubmit = async (data: { amount: number }) => {
    try {
      const response = await fetch("/api/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          categoryIds: selectedCategoryIds,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to calculate allocations");
      }

      setAllocations(payload.allocations);
      showToast("Allocations optimized successfully", "success");
    } catch (error) {
      setAllocations(null);
      showToast((error as Error).message, "error");
    }
  };

  return (
    <>
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          background: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          border: (theme) =>
            theme.palette.mode === "dark"
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(0,0,0,0.05)",
          borderRadius: 4,
        }}
      >
        <Typography
          variant="h5"
          mb={3}
          sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
        >
          <AutoAwesomeIcon sx={{ color: "primary.main" }} />
          Allocation Engine
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} alignItems="flex-end">
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                variant="outlined"
              >
                {currencies.map((curr) => (
                  <MenuItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                label="Total to Invest"
                fullWidth
                type="number"
                error={Boolean(errors.amount)}
                helperText={errors.amount ? errors.amount.message : ""}
                inputProps={{ step: 100 }}
                {...register("amount", { valueAsNumber: true })}
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Target Buckets</InputLabel>
                <Select
                  multiple
                  value={selectedCategoryIds}
                  onChange={(e) =>
                    setSelectedCategoryIds(
                      typeof e.target.value === "string"
                        ? e.target.value.split(",")
                        : e.target.value,
                    )
                  }
                  input={<OutlinedInput label="Target Buckets" />}
                  renderValue={(selected) => {
                    if (selected.length === metadata?.categories.length)
                      return "All categories";
                    return metadata?.categories
                      .filter((c) => selected.includes(c._id))
                      .map((c) => c.name)
                      .join(", ");
                  }}
                >
                  {metadata?.categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      <Checkbox
                        checked={selectedCategoryIds.indexOf(cat._id) > -1}
                        size="small"
                      />
                      <ListItemText primary={cat.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button
                disabled={isSubmitting || !selectedCategoryIds.length}
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ py: 1.5, fontSize: "1.1rem" }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Calculate allocation"
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {Object.keys(groupedResults).length ? (
        <Box
          component={motion.div}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h5">Optimization Results</Typography>
            <Button
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyAll}
              variant="text"
              color="primary"
            >
              Copy results
            </Button>
          </Stack>

          <Stack spacing={4}>
            {Object.entries(groupedResults).map(([categoryName, results]) => (
              <Box key={categoryName}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 2,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "primary.main",
                    fontWeight: 800,
                  }}
                >
                  {categoryName}
                </Typography>
                <Grid container spacing={2}>
                  {results.map((allocation) => (
                    <Grid
                      key={`${allocation.instrumentId}-${allocation.categoryId}`}
                      size={{ xs: 12, md: 6, lg: 4 }}
                    >
                      <Paper
                        component={motion.div}
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        whileHover={{
                          y: -4,
                          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                        }}
                        sx={{
                          p: 3,
                          height: "100%",
                          transition: "box-shadow 0.2s ease-in-out",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {allocation.instrumentType}
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{ mt: 1, fontWeight: 700 }}
                        >
                          {currencies.find((c) => c.value === currency)?.symbol}
                          {allocation.allocatedAmount.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Stack>
        </Box>
      ) : (
        metadata && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: 4,
            }}
          >
            <Typography color="text.secondary">
              No allocations generated yet. Configure your targets and hit
              calculate.
            </Typography>
          </Box>
        )
      )}
    </>
  );
}
