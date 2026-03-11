"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
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
  UseFieldArrayMove,
  UseFieldArrayRemove,
  UseFormReturn,
} from "react-hook-form";

import type { SnippetFormValues } from "../types";

type Props = {
  snippetForm: UseFormReturn<SnippetFormValues>;
  snippetFields: FieldArrayWithId<SnippetFormValues, "snippets", "id">[];
  appendSnippet: UseFieldArrayAppend<SnippetFormValues, "snippets">;
  removeSnippet: UseFieldArrayRemove;
  moveSnippet: UseFieldArrayMove;
  onReorderSnippets: (snippets: SnippetFormValues["snippets"]) => Promise<void>;
  canSubmitSnippets: boolean;
  onSubmitSnippets: (data: SnippetFormValues) => Promise<void>;
};

type SortableSnippetRowProps = {
  field: FieldArrayWithId<SnippetFormValues, "snippets", "id">;
  index: number;
  snippetForm: UseFormReturn<SnippetFormValues>;
  removeSnippet: UseFieldArrayRemove;
};

function SortableSnippetRow({
  field,
  index,
  snippetForm,
  removeSnippet,
}: SortableSnippetRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const text = snippetForm.watch(`snippets.${index}.text` as const) ?? "";

  return (
    <Box ref={setNodeRef} style={style}>
      <Box
        sx={{
          p: 2,
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: isDragging ? "primary.main" : "divider",
          bgcolor: (theme) => alpha(theme.palette.action.hover, 0.03),
          opacity: isDragging ? 0.85 : 1,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Box
            {...attributes}
            {...listeners}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mt: 0.8,
              color: "text.secondary",
              cursor: "grab",
              touchAction: "none",
              "&:active": { cursor: "grabbing" },
            }}
          >
            <DragIndicatorIcon fontSize="small" />
          </Box>
          <TextField
            fullWidth
            multiline
            minRows={2}
            label={`Snippet ${index + 1}`}
            placeholder="Short portfolio note..."
            {...snippetForm.register(`snippets.${index}.text` as const)}
            inputProps={{ maxLength: 150 }}
            error={Boolean(snippetForm.formState.errors.snippets?.[index]?.text)}
            helperText={
              snippetForm.formState.errors.snippets?.[index]?.text?.message ??
              `${text.length}/150`
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
    </Box>
  );
}

export default function AdminSnippetsTab({
  snippetForm,
  snippetFields,
  appendSnippet,
  removeSnippet,
  moveSnippet,
  onReorderSnippets,
  canSubmitSnippets,
  onSubmitSnippets,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = snippetFields.findIndex((field) => field.id === active.id);
    const newIndex = snippetFields.findIndex((field) => field.id === over.id);
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
      return;
    }

    const reordered = arrayMove(snippetForm.getValues("snippets"), oldIndex, newIndex);
    moveSnippet(oldIndex, newIndex);
    await onReorderSnippets(reordered);
  };

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
            <Typography variant="caption" color="text.secondary">
              Drag snippets to reorder display sequence.
            </Typography>
          </Box>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => void handleDragEnd(event)}
          >
            <SortableContext
              items={snippetFields.map((field) => field.id)}
              strategy={verticalListSortingStrategy}
            >
              <Stack spacing={1.5}>
                {snippetFields.map((field, index) => (
                  <SortableSnippetRow
                    key={field.id}
                    field={field}
                    index={index}
                    snippetForm={snippetForm}
                    removeSnippet={removeSnippet}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>

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
