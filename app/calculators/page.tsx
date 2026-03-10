"use client";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

// ── constants ────────────────────────────────────────────────────────
const MIN_AMOUNT = 1_000;
const MAX_AMOUNT = 10_00_000; // 10 lakh
const MIN_RATE = 1;
const MAX_RATE = 30;
const MIN_YEARS = 1;
const MAX_YEARS = 40;

const blockKeys = ["e", "E", "+", "-"];

type CalcType = "sip" | "lumpsum" | "fd";

const tabMeta: { key: CalcType; label: string }[] = [
  { key: "sip", label: "SIP" },
  { key: "lumpsum", label: "Lumpsum" },
  { key: "fd", label: "FD" },
];

// ── calculation helpers ──────────────────────────────────────────────
function calcSIP(monthly: number, annualRate: number, years: number) {
  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;
  const invested = monthly * months;
  const futureValue =
    monthly *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate);
  return { invested, futureValue, gains: futureValue - invested };
}

function calcLumpsum(principal: number, annualRate: number, years: number) {
  const futureValue = principal * Math.pow(1 + annualRate / 100, years);
  return { invested: principal, futureValue, gains: futureValue - principal };
}

function calcFD(principal: number, annualRate: number, years: number) {
  // quarterly compounding
  const n = 4;
  const futureValue =
    principal * Math.pow(1 + annualRate / (n * 100), n * years);
  return { invested: principal, futureValue, gains: futureValue - principal };
}

// ── currency formatter ───────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

// ── component ────────────────────────────────────────────────────────
export default function CalculatorsPage() {
  const [tab, setTab] = useState(0);
  const activeType = tabMeta[tab].key;

  const [amount, setAmount] = useState<string>("10000");
  const [rate, setRate] = useState<string>("12");
  const [years, setYears] = useState<string>("10");

  // ── validation ─────────────────────────────────────────────────────
  const amountNum = Number(amount) || 0;
  const rateNum = Number(rate) || 0;
  const yearsNum = Number(years) || 0;

  const amountError = useMemo(() => {
    if (!amount) return "";
    if (isNaN(amountNum) || amountNum < MIN_AMOUNT)
      return `Min ₹${MIN_AMOUNT.toLocaleString("en-IN")}`;
    if (amountNum > MAX_AMOUNT)
      return `Max ₹${MAX_AMOUNT.toLocaleString("en-IN")}`;
    return "";
  }, [amount, amountNum]);

  const rateError = useMemo(() => {
    if (!rate) return "";
    if (isNaN(rateNum) || rateNum < MIN_RATE) return `Min ${MIN_RATE}%`;
    if (rateNum > MAX_RATE) return `Max ${MAX_RATE}%`;
    return "";
  }, [rate, rateNum]);

  const yearsError = useMemo(() => {
    if (!years) return "";
    if (isNaN(yearsNum) || yearsNum < MIN_YEARS) return `Min ${MIN_YEARS} year`;
    if (yearsNum > MAX_YEARS) return `Max ${MAX_YEARS} years`;
    return "";
  }, [years, yearsNum]);

  const isValid =
    amount !== "" &&
    rate !== "" &&
    years !== "" &&
    !amountError &&
    !rateError &&
    !yearsError;

  const showResult = isValid;

  // ── results ────────────────────────────────────────────────────────
  const result = useMemo(() => {
    if (!isValid) return null;
    switch (activeType) {
      case "sip":
        return calcSIP(amountNum, rateNum, yearsNum);
      case "lumpsum":
        return calcLumpsum(amountNum, rateNum, yearsNum);
      case "fd":
        return calcFD(amountNum, rateNum, yearsNum);
    }
  }, [isValid, activeType, amountNum, rateNum, yearsNum]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const amountLabel =
    activeType === "sip" ? "Monthly Investment" : "Investment Amount";

  // ── invested vs gains ratio for bar ─────────────────────────────────
  const investedPct =
    result && result.futureValue > 0
      ? (result.invested / result.futureValue) * 100
      : 0;

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
          Calculators
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Estimate returns for SIP, Lumpsum, and Fixed Deposits.
        </Typography>
      </motion.div>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              minHeight: 48,
              fontSize: "0.875rem",
              fontWeight: 600,
            },
          }}
        >
          {tabMeta.map((t) => (
            <Tab key={t.key} label={t.label} />
          ))}
        </Tabs>
      </Box>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeType}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Box
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Typography
                    color="text.secondary"
                    gutterBottom
                    sx={{ display: "block", mb: 1, fontWeight: 500 }}
                  >
                    {amountLabel}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                      className="no-spinners"
                      sx={{ width: 100 }}
                      type="number"
                      size="small"
                      value={amount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setAmount("");
                          return;
                        }
                        const num = Number(val);
                        if (num > MAX_AMOUNT) {
                          setAmount(MAX_AMOUNT.toString());
                        } else {
                          setAmount(val);
                        }
                      }}
                      onBlur={() => {
                        const num = Number(amount);
                        if (!amount || num < MIN_AMOUNT) {
                          setAmount(MIN_AMOUNT.toString());
                        }
                      }}
                      onKeyDown={(e) => {
                        if (blockKeys.includes(e.key)) e.preventDefault();
                      }}
                      inputProps={{ min: MIN_AMOUNT, max: MAX_AMOUNT }}
                      error={Boolean(amountError)}
                      helperText={amountError}
                      placeholder={
                        activeType === "sip" ? "e.g. 5000" : "e.g. 100000"
                      }
                    />
                  </Stack>
                </Box>
                <Slider
                  value={
                    amountNum >= MIN_AMOUNT && amountNum <= MAX_AMOUNT
                      ? amountNum
                      : MIN_AMOUNT
                  }
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  step={500}
                  onChange={(_, val) => setAmount(val.toString())}
                  sx={{ mt: 1 }}
                />
              </Box>

              <Box>
                <Box
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Typography
                    color="text.secondary"
                    gutterBottom
                    sx={{ display: "block", mb: 1, fontWeight: 500 }}
                  >
                    Expected Annual Return (%)
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                      className="no-spinners"
                      sx={{ width: 100 }}
                      type="number"
                      size="small"
                      value={rate}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setRate("");
                          return;
                        }
                        const num = Number(val);
                        if (num > MAX_RATE) {
                          setRate(MAX_RATE.toString());
                        } else {
                          setRate(val);
                        }
                      }}
                      onBlur={() => {
                        const num = Number(rate);
                        if (!rate || num < MIN_RATE) {
                          setRate(MIN_RATE.toString());
                        }
                      }}
                      onKeyDown={(e) => {
                        if (blockKeys.includes(e.key)) e.preventDefault();
                      }}
                      inputProps={{ min: MIN_RATE, max: MAX_RATE, step: 0.1 }}
                      error={Boolean(rateError)}
                      helperText={rateError}
                      placeholder="e.g. 12"
                    />
                  </Stack>
                </Box>
                <Slider
                  value={
                    rateNum >= MIN_RATE && rateNum <= MAX_RATE
                      ? rateNum
                      : MIN_RATE
                  }
                  min={MIN_RATE}
                  max={MAX_RATE}
                  step={0.1}
                  onChange={(_, val) => setRate(val.toString())}
                  sx={{ mt: 1 }}
                />
              </Box>

              <Box>
                <Box
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Typography
                    color="text.secondary"
                    gutterBottom
                    sx={{ display: "block", mb: 1, fontWeight: 500 }}
                  >
                    Time Period (Years)
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                      className="no-spinners"
                      sx={{ width: 100 }}
                      type="number"
                      size="small"
                      value={years}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setYears("");
                          return;
                        }
                        const num = Number(val);
                        if (num > MAX_YEARS) {
                          setYears(MAX_YEARS.toString());
                        } else {
                          setYears(val);
                        }
                      }}
                      onBlur={() => {
                        const num = Number(years);
                        if (!years || num < MIN_YEARS) {
                          setYears(MIN_YEARS.toString());
                        }
                      }}
                      onKeyDown={(e) => {
                        if (blockKeys.includes(e.key)) e.preventDefault();
                      }}
                      inputProps={{ min: MIN_YEARS, max: MAX_YEARS }}
                      error={Boolean(yearsError)}
                      helperText={yearsError}
                      placeholder="e.g. 10"
                    />
                  </Stack>
                </Box>
                <Slider
                  value={
                    yearsNum >= MIN_YEARS && yearsNum <= MAX_YEARS
                      ? yearsNum
                      : MIN_YEARS
                  }
                  min={MIN_YEARS}
                  max={MAX_YEARS}
                  step={1}
                  onChange={(_, val) => setYears(val.toString())}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Stack>
          </Paper>

          {/* Results */}
          {showResult && result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Paper sx={{ p: { xs: 3, md: 4 } }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontSize: "0.7rem",
                    }}
                  >
                    {activeType === "sip"
                      ? "SIP Returns"
                      : activeType === "lumpsum"
                        ? "Lumpsum Returns"
                        : "FD Maturity"}
                  </Typography>
                  {activeType === "sip" && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        fontWeight: 600,
                        cursor: "default",
                      }}
                    >
                      <TrendingUpRoundedIcon sx={{ fontSize: 14 }} />
                      Annuity Due Mode
                    </Typography>
                  )}
                </Stack>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 4 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.25 }}
                    >
                      Invested
                    </Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {fmt(result.invested)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.25 }}
                    >
                      Gains
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      color="emerald.main"
                      sx={{
                        color: (theme) =>
                          theme.palette.mode === "dark" ? "#34d399" : "#059669",
                      }}
                    >
                      {fmt(result.gains)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.25 }}
                    >
                      Total
                    </Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {fmt(result.futureValue)}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Visual ratio bar */}
                <Box
                  sx={{
                    width: "100%",
                    height: 6,
                    borderRadius: 1,
                    overflow: "hidden",
                    display: "flex",
                    bgcolor: (theme) => alpha(theme.palette.divider, 0.08),
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${investedPct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      background: "#7c3aed",
                      borderRadius: "4px 0 0 4px",
                    }}
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - investedPct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    style={{
                      height: "100%",
                      background: "#059669",
                      borderRadius: "0 4px 4px 0",
                    }}
                  />
                </Box>
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "2px",
                        bgcolor: "#7c3aed",
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Invested
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "2px",
                        bgcolor: "#059669",
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Gains
                    </Typography>
                  </Stack>
                </Stack>

                {/* Formula Section */}
                {activeType === "sip" && (
                  <Box
                    sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 1.5 }}
                    >
                      <InfoOutlinedIcon
                        sx={{ fontSize: 16, color: "primary.main" }}
                      />
                      <Typography
                        variant="subtitle2"
                        sx={{ fontSize: "0.75rem", fontWeight: 700 }}
                      >
                        HOW IT&apos;S CALCULATED
                      </Typography>
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, fontSize: "0.75rem", lineHeight: 1.6 }}
                    >
                      SIP calculations use the future value of an annuity due
                      formula, considering investments at the beginning of each
                      period.
                    </Typography>

                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.02),
                        textAlign: "center",
                        borderRadius: 2,
                        borderStyle: "dashed",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 700,
                          fontFamily: "serif",
                          letterSpacing: "0.02em",
                          color: "text.primary",
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                        }}
                      >
                        M = P × ({"{"}[1 + i]^n – 1{"}"} / i) × (1 + i)
                      </Typography>
                    </Paper>

                    <Grid container spacing={1}>
                      {[
                        { label: "M", desc: "Maturity value" },
                        { label: "P", desc: "SIP amount" },
                        { label: "i", desc: "Periodic rate" },
                        { label: "n", desc: "No. of payments" },
                      ].map((item) => (
                        <Grid size={{ xs: 6, sm: 3 }} key={item.label}>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 1.5,
                              bgcolor: (theme) =>
                                alpha(theme.palette.divider, 0.03),
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 800,
                                color: "primary.main",
                                display: "block",
                                fontSize: "0.65rem",
                              }}
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.65rem" }}
                            >
                              {item.desc}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Paper>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </Container>
  );
}
