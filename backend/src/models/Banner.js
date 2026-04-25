import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    highlight: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    ctaText: {
      type: String,
      default: "Shop Now",
    },
    ctaLink: {
      type: String,
      default: "/products",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
