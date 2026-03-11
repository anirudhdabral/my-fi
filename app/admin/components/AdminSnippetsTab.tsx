"use client";

import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import type {
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormReturn,
} from "react-hook-form";

import type { SnippetFormValues } from "../types";

type Props = {
  snippetForm: UseFormReturn<SnippetFormValues>;
  snippetFields: FieldArrayWithId<SnippetFormValues, "snippets", "id">[];
  appendSnippet: UseFieldArrayAppend<SnippetFormValues, "snippets">;
  removeSnippet: UseFieldArrayRemove;
  canSubmitSnippets: boolean;
  onSubmitSnippets: (data: SnippetFormValues) => Promise<void>;
};

export default function AdminSnippetsTab({
  snippetForm,
  snippetFields,
  appendSnippet,
  removeSnippet,
  canSubmitSnippets,
  onSubmitSnippets,
}: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Carousel Snippets
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage the text-only carousel above Investment Distributor. Max
              150 characters per snippet.
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            {snippetFields.map((field, index) => {
              const text =
                snippetForm.watch(`snippets.${index}.text` as const) ?? "";
              return (
                <Box
                  key={field.id}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: (theme) => alpha(theme.palette.action.hover, 0.03),
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label={`Snippet ${index + 1}`}
                      placeholder="Short portfolio note..."
                      {...snippetForm.register(`snippets.${index}.text` as const)}
                      inputProps={{ maxLength: 150 }}
                      error={Boolean(
                        snippetForm.formState.errors.snippets?.[index]?.text,
                      )}
                      helperText={
                        snippetForm.formState.errors.snippets?.[index]?.text
                          ?.message ?? `${text.length}/150`
                      }
                    />
                    <Button
                      color="error"
                      variant="outlined"
                      onClick={() => removeSnippet(index)}
                      sx={{ minWidth: 44, px: 1.2 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </Button>
                  </Stack>
                </Box>
              );
            })}
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => appendSnippet({ text: "" })}
              sx={{ flex: 1 }}
            >
              Add Snippet
            </Button>
            <Button
              variant="contained"
              onClick={snippetForm.handleSubmit(onSubmitSnippets)}
              disabled={!canSubmitSnippets}
              sx={{ flex: 1.5 }}
            >
              Save Snippets
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </motion.div>
  );
}
