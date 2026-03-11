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

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
export type InstrumentFormValues = z.infer<typeof instrumentFormSchema>;

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
