import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  shortDescription: String,
  gallery: [String],
  banner: String,
  isActive: Boolean,
});

export default mongoose.model("Destination", destinationSchema, "destinations");
