import mongoose from "mongoose";
import User from "../user/user.model.js";
import Destination from "../destionation/destination.model.js";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    linkAffiliate: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "tour",
        "hotel",
        "restaurant",
        "transport",
        "experience",
        "other",
        "homestay",
      ],
      required: true,
      default: "other",
    },
    description: String,
    highlights: [String],
    image: {
      type: String,
      required: true,
    },

    priceFrom: Number,
    priceTo: Number,

    address: String,
    contactPhone: String,

    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },

    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "pending_update"],
      default: "pending",
    },

    rejectionReason: String,

    isPriority: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },

    views: { type: Number, default: 0 },

    pendingUpdates: {
      name: String,
      description: String,
      images: [String],
      priceFrom: Number,
      priceTo: Number,

      address: String,
      contactPhone: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Service", serviceSchema, "services");
