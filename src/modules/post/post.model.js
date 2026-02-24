import mongoose from "mongoose";
import Destionation from "../destionation/destination.model.js";

const postSchema = new mongoose.Schema(
  {
    destinationId: { type: mongoose.Types.ObjectId, ref: "Destination" },
    title: String,
    content: String,
    banner: {
      title: String,
      image: String,
      alt: String,
    },
    postType: {
      type: String,
      enum: ["partner", "system"],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.postType === "partner";
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    postedDate: Date,
    gallery: [
      {
        image: String,
        alt: String,
      },
    ],
    relatedArticles: [],
  },
  { timestamps: true },
);

export default mongoose.model("Post", postSchema, "posts");
