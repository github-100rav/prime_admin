import { Schema, model, models } from "mongoose";
export const categorySchema = new Schema(
  {
    title: { type: String, required: true },
  },
  { timestamps: true }
);

export const Category = models?.Category || model("Category", categorySchema);
