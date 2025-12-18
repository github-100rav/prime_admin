import { Schema, model, models } from "mongoose";
export const productSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number },
    originalPrice: { type: Number, required: true },
    logoImage: { type: String, required: true },
    category: { type: String },
    group: { type: String },
    stock: { type: Number, required: true },
    features: { type: [String], required: true },
    images: { type: [String] },
  },
  { timestamps: true }
);

export const Product = models?.Product || model("Product", productSchema);
