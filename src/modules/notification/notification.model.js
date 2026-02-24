import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "SERVICE_APPROVE",
        "SERVICE_REJECT",
        "POST_APPROVE",
        "POST_REJECT",
        "NEW_PROPOSAL",
        "SYSTEM",
      ],
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    onModel: {
      type: String,
      enum: ["Service", "Post"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.model(
  "Notification",
  notificationSchema,
  "notifications",
);
