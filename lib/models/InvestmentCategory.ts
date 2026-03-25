import { model, models, Schema, Document } from "mongoose";

export interface InvestmentCategoryDocument extends Document {
  name: string;
  percentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const investmentCategorySchema = new Schema<InvestmentCategoryDocument>(
  {
    name: { type: String, required: true },
    percentage: { type: Number, required: true, min: 0, max: 100 },
  },
  { timestamps: true },
);

const InvestmentCategory =
  models.InvestmentCategory ||
  model<InvestmentCategoryDocument>(
    "InvestmentCategory",
    investmentCategorySchema,
  );

export default InvestmentCategory;
