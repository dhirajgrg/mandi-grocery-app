import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category must have a name"],
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Category = model("category", categorySchema);
export default Category;
