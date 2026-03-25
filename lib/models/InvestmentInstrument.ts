import { model, models, Schema, Document, Types } from "mongoose";

export interface InvestmentInstrumentDocument extends Document {
  type: string;
  categoryId: Types.ObjectId;
  inv_percentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const investmentInstrumentSchema = new Schema<InvestmentInstrumentDocument>(
  {
    type: { type: String, required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "InvestmentCategory",
    },
    inv_percentage: { type: Number, required: true, min: 0, max: 100 },
  },
  { timestamps: true },
);

const InvestmentInstrument =
  models.InvestmentInstrument ||
  model<InvestmentInstrumentDocument>(
    "InvestmentInstrument",
    investmentInstrumentSchema,
  );

export default InvestmentInstrument;
