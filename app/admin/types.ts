import { z } from "zod";

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  percentage: z.coerce.number().min(1).max(100),
});

export const instrumentSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  categoryId: z.string().min(1, "Category is required"),
  inv_percentage: z.coerce.number().min(1).max(100),
});

export const categoryFormSchema = z.object({
  categories: z.array(categorySchema).min(1),
});

export const instrumentFormSchema = z.object({
  instruments: z.array(instrumentSchema).min(0),
});

export const snippetSchema = z.object({
  id: z.string().optional(),
  text: z
    .string()
    .trim()
    .min(1, "Snippet text is required")
    .max(150, "Snippet text can be at most 150 characters"),
});

export const snippetFormSchema = z.object({
  snippets: z.array(snippetSchema).max(30),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
export type InstrumentFormValues = z.infer<typeof instrumentFormSchema>;
export type SnippetFormValues = z.infer<typeof snippetFormSchema>;

export type AdminUser = {
  _id: string;
  name?: string;
  email: string;
  role: string;
  approved: boolean;
};

export type CategoryApiItem = {
  _id: string;
  name: string;
  percentage: number;
};

export type InstrumentApiItem = {
  _id: string;
  type: string;
  categoryId: string | { toString: () => string };
  inv_percentage: number;
};

export type BootstrapResponse = {
  categories?: CategoryApiItem[];
  instruments?: InstrumentApiItem[];
  users?: AdminUser[];
  snippets?: SnippetApiItem[];
  error?: string;
};

export type CategorySaveResponse = {
  categories: CategoryApiItem[];
  error?: string;
};

export type InstrumentSaveResponse = {
  instruments: InstrumentApiItem[];
  error?: string;
};

export type SnippetApiItem = {
  _id: string;
  text: string;
  order: number;
};

export type SnippetSaveResponse = {
  snippets: SnippetApiItem[];
  error?: string;
};
