"use client";

import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import type {
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormReturn,
} from "react-hook-form";
import { Controller } from "react-hook-form";

import type { CategoryFormValues, InstrumentFormValues } from "../types";

type Props = {
  categoryForm: UseFormReturn<CategoryFormValues>;
  instrumentForm: UseFormReturn<InstrumentFormValues>;
  categoryFields: FieldArrayWithId<CategoryFormValues, "categories", "id">[];
  instrumentFields: FieldArrayWithId<
    InstrumentFormValues,
    "instruments",
    "id"
  >[];
  appendCategory: UseFieldArrayAppend<CategoryFormValues, "categories">;
  removeCategory: UseFieldArrayRemove;
  appendInstrument: UseFieldArrayAppend<InstrumentFormValues, "instruments">;
  removeInstrument: UseFieldArrayRemove;
  categoryOptions: CategoryFormValues["categories"];
  currentCategorySum: number;
  canSubmitCategories: boolean;
  canSubmitInstruments: boolean;
  onSubmitCategories: (data: CategoryFormValues) => Promise<void>;
  onSubmitInstruments: (data: InstrumentFormValues) => Promise<void>;
};

export default function AdminConfigTab({
  categoryForm,
  instrumentForm,
  categoryFields,
  instrumentFields,
  appendCategory,
  removeCategory,
  appendInstrument,
  removeInstrument,
  categoryOptions,
  currentCategorySum,
  canSubmitCategories,
  canSubmitInstruments,
  onSubmitCategories,
  onSubmitInstruments,
}: Props) {
  const isAllocationValid = Math.abs(currentCategorySum - 100) < 0.1;

  return (
    <Stack spacing={3}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
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
                  color={isAllocationValid ? "success.main" : "warning.main"}
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
                    backgroundColor: isAllocationValid ? "#34d399" : "#fbbf24",
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
                    bgcolor: (theme) => alpha(theme.palette.action.hover, 0.03),
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
                    bgcolor: (theme) => alpha(theme.palette.action.hover, 0.03),
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
  );
}
