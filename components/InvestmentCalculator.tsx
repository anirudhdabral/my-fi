"use client";

import { useToast } from "@/lib/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const currencies = [
  { value: "INR", label: "₹ (INR)", symbol: "₹" },
  { value: "USD", label: "$ (USD)", symbol: "$" },
  { value: "EUR", label: "EUR", symbol: "EUR " },
  { value: "GBP", label: "GBP", symbol: "GBP " },
];

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

type AllocationResult = Allocation & {
  categoryName: string;
  instrumentType: string;
};

const ROUND_OFF_QUANTUM = 100;

function roundAllocationsPreservingTotal(
  allocations: AllocationResult[],
  targetTotal: number,
) {
  if (!allocations.length || targetTotal <= 0) {
    return allocations;
  }

  const sourceTotal = allocations.reduce(
    (sum, item) => sum + item.allocatedAmount,
    0,
  );

  if (sourceTotal <= 0) {
    return allocations;
  }

  const scale = targetTotal / sourceTotal;
  const quantumCents = ROUND_OFF_QUANTUM * 100;
  const targetCents = Math.round(targetTotal * 100);

  const staged = allocations.map((allocation, index) => {
    const exactCents = Math.max(
      0,
      Math.round(allocation.allocatedAmount * scale * 100),
    );
    const roundedCents =
      Math.floor(exactCents / quantumCents) * quantumCents;

    return {
      index,
      exactCents,
      roundedCents,
      remainder: exactCents - roundedCents,
    };
  });

  let remainingCents =
    targetCents -
    staged.reduce((sum, item) => sum + item.roundedCents, 0);

  const byRemainderDesc = [...staged].sort(
    (a, b) => b.remainder - a.remainder || b.exactCents - a.exactCents,
  );

  while (remainingCents >= quantumCents && byRemainderDesc.length) {
    for (const item of byRemainderDesc) {
      if (remainingCents < quantumCents) {
        break;
      }
      item.roundedCents += quantumCents;
      remainingCents -= quantumCents;
    }
  }

  if (remainingCents < 0) {
    const byRemainderAsc = [...staged].sort(
      (a, b) => a.remainder - b.remainder || a.exactCents - b.exactCents,
    );

    while (remainingCents <= -quantumCents && byRemainderAsc.length) {
      for (const item of byRemainderAsc) {
        if (remainingCents > -quantumCents) {
          break;
        }
        if (item.roundedCents >= quantumCents) {
          item.roundedCents -= quantumCents;
          remainingCents += quantumCents;
        }
      }
    }
  }

  if (remainingCents !== 0) {
    const largest = [...staged].sort(
      (a, b) => b.roundedCents - a.roundedCents,
    )[0];
    if (largest) {
      largest.roundedCents += remainingCents;
    }
  }

  const roundedByIndex = new Map(
    staged.map((item) => [item.index, item.roundedCents / 100]),
  );

  return allocations.map((allocation, index) => ({
    ...allocation,
    allocatedAmount:
      roundedByIndex.get(index) ?? allocation.allocatedAmount,
  }));
}

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
  const [roundOffEnabled, setRoundOffEnabled] = useState(false);
  const [lastRequestedAmount, setLastRequestedAmount] = useState<number | null>(
    null,
  );

  useEffect(() => {
    fetch("/api/investments/metadata")
      .then((res) => res.json())
      .then((payload) => {
        setMetadata(payload);
        if (payload?.categories) {
          setSelectedCategoryIds(
            payload.categories.map(
              (category: InvestmentCategory) => category._id,
            ),
          );
        }
      })
      .catch(() => setMetadata(null));
  }, []);

  const categorizedResults = useMemo<AllocationResult[]>(() => {
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

  const displayedResults = useMemo(() => {
    if (!roundOffEnabled) {
      return categorizedResults;
    }

    const targetTotal =
      lastRequestedAmount ??
      categorizedResults.reduce(
        (sum, result) => sum + result.allocatedAmount,
        0,
      );

    return roundAllocationsPreservingTotal(categorizedResults, targetTotal);
  }, [categorizedResults, lastRequestedAmount, roundOffEnabled]);

  const groupedResults = useMemo(() => {
    if (!displayedResults.length) {
      return {};
    }

    return displayedResults.reduce(
      (accumulator, result) => {
        if (!accumulator[result.categoryName]) {
          accumulator[result.categoryName] = [];
        }
        accumulator[result.categoryName].push(result);
        return accumulator;
      },
      {} as Record<string, AllocationResult[]>,
    );
  }, [displayedResults]);

  const currencyMeta = useMemo(
    () => currencies.find((item) => item.value === currency) ?? currencies[0],
    [currency],
  );

  const totalAllocated = useMemo(
    () =>
      displayedResults.reduce(
        (runningTotal, result) => runningTotal + result.allocatedAmount,
        0,
      ),
    [displayedResults],
  );

  const handleCopyAll = () => {
    if (!displayedResults.length) {
      return;
    }

    const text = displayedResults
      .map(
        (result) =>
          `${result.categoryName} > ${result.instrumentType}: ${
            currencyMeta.symbol
          }${result.allocatedAmount.toLocaleString()}`,
      )
      .join("\n");

    navigator.clipboard.writeText(text);
    showToast("Results copied to clipboard", "success");
  };

  const onSubmit = async (data: { amount: number }) => {
    try {
      setLastRequestedAmount(data.amount);
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
      setLastRequestedAmount(null);
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
              ? "linear-gradient(160deg, #151923 0%, #0f131d 100%)"
              : "linear-gradient(160deg, #ffffff 0%, #f8fbff 100%)",
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
          mb={1}
          sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
        >
          <AutoAwesomeIcon sx={{ color: "primary.main" }} />
          Allocation Engine
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Configure your amount and target buckets to generate a weighted split.
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", mb: 3, color: "warning.main", fontWeight: 600 }}
        >
          Disclaimer: I am not a SEBI-registered advisor. This guidance reflects
          my personal portfolio allocations and is shared for informational
          purposes only.
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} alignItems="flex-end">
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                variant="outlined"
              >
                {currencies.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
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
                  onChange={(event) =>
                    setSelectedCategoryIds(
                      typeof event.target.value === "string"
                        ? event.target.value.split(",")
                        : event.target.value,
                    )
                  }
                  input={<OutlinedInput label="Target Buckets" />}
                  renderValue={(selected) => {
                    if (selected.length === metadata?.categories.length) {
                      return "All categories";
                    }

                    return metadata?.categories
                      .filter((category) => selected.includes(category._id))
                      .map((category) => category.name)
                      .join(", ");
                  }}
                >
                  {metadata?.categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      <Checkbox
                        checked={selectedCategoryIds.includes(category._id)}
                        size="small"
                      />
                      <ListItemText primary={category.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  disabled={isSubmitting || !selectedCategoryIds.length}
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={!isSubmitting ? <TuneRoundedIcon /> : undefined}
                  sx={{ py: 1.5, fontSize: "1.05rem" }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Calculate Allocation"
                  )}
                </Button>
                <Chip
                  icon={<InsightsRoundedIcon />}
                  label={`${selectedCategoryIds.length} bucket${
                    selectedCategoryIds.length === 1 ? "" : "s"
                  } selected`}
                  color="primary"
                  variant="outlined"
                  sx={{
                    height: 48,
                    borderRadius: 999,
                    alignSelf: { xs: "stretch", sm: "center" },
                    justifyContent: "center",
                  }}
                />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={roundOffEnabled}
                    onChange={(event) =>
                      setRoundOffEnabled(event.target.checked)
                    }
                  />
                }
                label="Round off allocations (nearest 100) while preserving total"
              />
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
            mb={2.5}
            gap={1.5}
            flexWrap="wrap"
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Typography variant="h5">Optimization Results</Typography>
              <Chip
                size="small"
                label={`${displayedResults.length} recommendations`}
                color="primary"
                variant="outlined"
              />
            </Stack>

            <Stack direction="row" spacing={1}>
              <Chip
                size="small"
                label={`Total ${currencyMeta.symbol}${totalAllocated.toLocaleString(
                  undefined,
                  { maximumFractionDigits: 2 },
                )}`}
              />
              <Button
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyAll}
                variant="text"
                color="primary"
              >
                Copy results
              </Button>
            </Stack>
          </Stack>

          <Stack spacing={4}>
            {Object.entries(groupedResults).map(([categoryName, results]) => (
              <Paper key={categoryName} sx={{ p: 2.5, borderRadius: 4 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1}
                  mb={2}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "primary.main",
                      fontWeight: 800,
                    }}
                  >
                    {categoryName}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${results.length} instrument${
                      results.length === 1 ? "" : "s"
                    }`}
                  />
                </Stack>

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
                          borderRadius: 3,
                        }}
                      >
                        <Typography
                          variant="overline"
                          color="text.secondary"
                          sx={{ letterSpacing: "0.08em" }}
                        >
                          Allocation
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {allocation.instrumentType}
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{ mt: 1, fontWeight: 700 }}
                        >
                          {currencyMeta.symbol}
                          {allocation.allocatedAmount.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(totalAllocated
                            ? (allocation.allocatedAmount / totalAllocated) *
                              100
                            : 0
                          ).toFixed(2)}
                          % of optimized total
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            ))}
          </Stack>
        </Box>
      ) : (
        metadata && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: { xs: 2, md: 4 },
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 4,
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(148,163,184,0.06)"
                  : "rgba(99,102,241,0.03)",
            }}
          >
            <AutoAwesomeIcon sx={{ color: "primary.main", mb: 1 }} />
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Ready to generate an allocation
            </Typography>
            <Typography color="text.secondary">
              Choose your amount and target buckets, then run the allocation
              engine.
            </Typography>
          </Box>
        )
      )}
    </>
  );
}
