import { Schema, model, models } from "mongoose";
export const groupSchema = new Schema(
  {
    title: { type: String, required: true },
    logoImage: { type: String, required: true },
    slug: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Group = models?.Group || model("Group", groupSchema);
