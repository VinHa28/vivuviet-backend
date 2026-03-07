import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["admin", "partner"],
      default: "partner",
    },

    partnerTier: {
      type: String,
      enum: ["basic", "standard", "premium"],
      default: "basic",
    },

    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "pending",
    },
    businessName: String,
    logo: String,
    phone: String,
    website: String,
    fanpage: String,
    registrationDate: Date,
    priorityRate: { type: Number, default: 1 },
    subscription: {
      startDate: Date,
      endDate: Date,
      isAutoRenew: { type: Boolean, default: false },
    },
    lastPaymentDate: Date,
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema, "users");
