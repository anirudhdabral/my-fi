"use client";

import { useToast } from "@/lib/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
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
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const currencies = [
  { value: "INR", label: "₹ INR", symbol: "₹" },
  { value: "USD", label: "$ USD", symbol: "$" },
  { value: "EUR", label: "€ EUR", symbol: "€" },
  { value: "GBP", label: "£ GBP", symbol: "£" },
];

const calculatorSchema = z.object({
  amount: z.coerce.number().min(1000, "Min ₹1,000").max(10_00_000, "Max ₹10 L"),
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
    const roundedCents = Math.floor(exactCents / quantumCents) * quantumCents;

    return {
      index,
      exactCents,
      roundedCents,
      remainder: exactCents - roundedCents,
    };
  });

  let remainingCents =
    targetCents - staged.reduce((sum, item) => sum + item.roundedCents, 0);

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
    allocatedAmount: roundedByIndex.get(index) ?? allocation.allocatedAmount,
  }));
}

export default function InvestmentCalculator() {
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<{ amount: number }>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: { amount: 10000 },
  });

  const watchedAmount = watch("amount");

  const [allocations, setAllocations] = useState<Allocation[] | null>(null);
  const [metadata, setMetadata] = useState<{
    categories: InvestmentCategory[];
    instruments: InvestmentInstrument[];
  } | null>(null);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [currency, setCurrency] = useState("INR");
  const [roundOffEnabled, setRoundOffEnabled] = useState(true);
  const [lastRequestedAmount, setLastRequestedAmount] = useState<number | null>(
    null,
  );

  useEffect(() => {
    fetch("/api/investments/metadata")
      .then((res) => res.json())
      .then((payload) => {
        setMetadata(payload);
        if (payload?.categories) {
          const allIds = payload.categories.map(
            (category: InvestmentCategory) => category._id,
          );
          setSelectedCategoryIds(allIds);
        }
      })
      .catch(() => setMetadata(null));
  }, []);

  // Real-time calculation logic
  useEffect(() => {
    if (
      !metadata ||
      !watchedAmount ||
      watchedAmount < 1000 ||
      !selectedCategoryIds.length
    ) {
      setAllocations(null);
      setLastRequestedAmount(null);
      return;
    }

    try {
      const { categories, instruments } = metadata;
      let targetCategories = categories.filter((c) =>
        selectedCategoryIds.includes(c._id),
      );

      if (!targetCategories.length) return;

      // Rescale percentages
      const selectionTotal = targetCategories.reduce(
        (sum, c) => sum + c.percentage,
        0,
      );
      const rescaledCategories = targetCategories.map((c) => ({
        ...c,
        percentage: (c.percentage / selectionTotal) * 100,
      }));

      const instrumentsByCategory = instruments.reduce<
        Record<string, InvestmentInstrument[]>
      >((acc, inst) => {
        acc[inst.categoryId] = acc[inst.categoryId]
          ? [...acc[inst.categoryId], inst]
          : [inst];
        return acc;
      }, {});

      const newAllocations: Allocation[] = [];
      for (const cat of rescaledCategories) {
        const catAmount = (watchedAmount * cat.percentage) / 100;
        const catInstruments = instrumentsByCategory[cat._id] ?? [];

        for (const inst of catInstruments) {
          newAllocations.push({
            instrumentId: inst._id,
            categoryId: cat._id,
            allocatedAmount: Number(
              ((catAmount * inst.inv_percentage) / 100).toFixed(2),
            ),
          });
        }
      }

      setLastRequestedAmount(watchedAmount);
      setAllocations(newAllocations);
    } catch (err) {
      console.error("Calculation error:", err);
    }
  }, [watchedAmount, selectedCategoryIds, metadata]);

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
    showToast("Copied to clipboard", "success");
  };

  const onSubmit = (data: { amount: number }) => {
    // Handled by real-time effect now
  };

  // Accent colors for category groups
  const categoryAccents = [
    { light: "#7c3aed", dark: "#c4b5fd" }, // violet
    { light: "#d97706", dark: "#fbbf24" }, // amber
    { light: "#0891b2", dark: "#67e8f9" }, // cyan
    { light: "#dc2626", dark: "#fca5a5" }, // red
    { light: "#059669", dark: "#6ee7b7" }, // emerald
  ];

  return (
    <>
      {/* Input Form */}
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ mb: 0.5 }}>
          Allocation Engine
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configure amount and target buckets to generate a weighted split.
        </Typography>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 3,
            color: "warning.main",
            fontWeight: 500,
            opacity: 0.8,
          }}
        >
          Not financial advice. Reflects personal portfolio allocations for
          informational purposes only.
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2.5} alignItems="flex-end">
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                variant="outlined"
                size="small"
              >
                {currencies.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 8, md: 5 }}>
              <TextField
                className="no-spinners"
                label="Amount to Invest"
                fullWidth
                type="number"
                size="small"
                error={Boolean(errors.amount)}
                helperText={errors.amount ? errors.amount.message : ""}
                inputProps={{ step: 500, min: 1000, max: 10_00_000 }}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                }}
                {...register("amount", {
                  valueAsNumber: true,
                  onChange: (e) => {
                    const val = e.target.value;
                    if (val === "") return;
                    const num = Number(val);
                    if (num > 10_00_000) {
                      setValue("amount", 10_00_000);
                    }
                  },
                  onBlur: (e) => {
                    const val = e.target.value;
                    const num = Number(val);
                    if (!val || num < 1000) {
                      setValue("amount", 1000);
                    }
                  },
                })}
                variant="outlined"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Buckets</InputLabel>
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
                  input={<OutlinedInput label="Buckets" />}
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
              <FormControlLabel
                control={
                  <Switch
                    checked={roundOffEnabled}
                    onChange={(event) =>
                      setRoundOffEnabled(event.target.checked)
                    }
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    Round to nearest ₹100
                  </Typography>
                }
              />
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Results */}
      {Object.keys(groupedResults).length ? (
        <Box
          component={motion.div}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 },
            },
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            gap={1}
            flexWrap="wrap"
          >
            <Stack direction="row" spacing={1} alignItems="baseline">
              <Typography variant="h6">Results</Typography>
              <Typography variant="body2" color="text.secondary">
                {currencyMeta.symbol}
                {totalAllocated.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Stack>

            <Button
              startIcon={
                <ContentCopyIcon sx={{ fontSize: "16px !important" }} />
              }
              onClick={handleCopyAll}
              variant="text"
              size="small"
              sx={{ color: "text.secondary" }}
            >
              Copy
            </Button>
          </Stack>

          <Stack spacing={2}>
            {Object.entries(groupedResults).map(
              ([categoryName, results], groupIndex) => {
                const accent =
                  categoryAccents[groupIndex % categoryAccents.length];

                return (
                  <Paper
                    key={categoryName}
                    sx={{
                      p: 2.5,
                      borderLeft: (theme) =>
                        `3px solid ${theme.palette.mode === "dark" ? accent.dark : accent.light}`,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: (theme) =>
                            theme.palette.mode === "dark"
                              ? accent.dark
                              : accent.light,
                          fontWeight: 700,
                          fontSize: "0.7rem",
                        }}
                      >
                        {categoryName}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        {results.length}{" "}
                        {results.length === 1 ? "instrument" : "instruments"}
                      </Typography>
                    </Stack>

                    <Grid container spacing={1.5}>
                      {results.map((allocation) => (
                        <Grid
                          key={`${allocation.instrumentId}-${allocation.categoryId}`}
                          size={{ xs: 12, sm: 6, lg: 4 }}
                        >
                          <Box
                            component={motion.div}
                            variants={{
                              hidden: { opacity: 0, y: 8 },
                              visible: { opacity: 1, y: 0 },
                            }}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "divider",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                borderColor: (theme) =>
                                  theme.palette.mode === "dark"
                                    ? accent.dark
                                    : accent.light,
                                transform: "translateY(-2px)",
                                boxShadow: (theme) =>
                                  `0 6px 20px ${alpha(
                                    theme.palette.mode === "dark"
                                      ? accent.dark
                                      : accent.light,
                                    0.08,
                                  )}`,
                              },
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontWeight: 500,
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              {allocation.instrumentType}
                            </Typography>
                            <Typography
                              variant="h5"
                              sx={{ fontWeight: 700, mb: 0.25 }}
                            >
                              {currencyMeta.symbol}
                              {allocation.allocatedAmount.toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 2,
                                },
                              )}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ opacity: 0.6 }}
                            >
                              {(totalAllocated
                                ? (allocation.allocatedAmount /
                                    totalAllocated) *
                                  100
                                : 0
                              ).toFixed(1)}
                              %
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                );
              },
            )}
          </Stack>
        </Box>
      ) : (
        metadata && (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              px: { xs: 2, md: 4 },
              borderRadius: 2,
              border: "1px dashed",
              borderColor: "divider",
            }}
          >
            <TuneRoundedIcon
              sx={{
                color: "text.secondary",
                mb: 1,
                opacity: 0.3,
                fontSize: 32,
              }}
            />
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Enter an amount to see allocation
            </Typography>
          </Box>
        )
      )}
    </>
  );
}
