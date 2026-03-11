import { Document, model, models, Schema } from "mongoose";

export interface CarouselSnippetDocument extends Document {
  text: string;
  order: number;
  createdAt: Date;
}

const carouselSnippetSchema = new Schema<CarouselSnippetDocument>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    order: { type: Number, required: true, default: 0 },
    createdAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false },
);

const CarouselSnippet =
  models.CarouselSnippet ||
  model<CarouselSnippetDocument>("CarouselSnippet", carouselSnippetSchema);

export default CarouselSnippet;
