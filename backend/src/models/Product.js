import { Schema, model } from "mongoose";

const PRODUCT_UNITS = ["kg", "gram", "piece", "pack", "liter"];

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product must have a name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product must have a description"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product must have a price"],
      min: [0, "Price must be positive"],
    },
    discount: {
      type: Number,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
      default: 0,
    },
    category: {
      type: String,
      required: [true, "Product must have a category"],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
    },
    unit: {
      type: String,
      enum: PRODUCT_UNITS,
      required: [true, "Product must have a unit"],
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: [0, "Stock quantity cannot be negative"],
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isOrganic: {
      type: Boolean,
      default: false,
    },
    isFresh: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt
  },
);

productSchema.index({ name: "text", category: "text", brand: "text" });
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });

const Product = model("product", productSchema);
export default Product;
