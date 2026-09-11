import { Schema, model, models } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["customer", "contributor", "advisor", "compliance", "admin"],
      default: "customer",
      index: true,
    },
    emailVerified: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "suspended"], default: "active", index: true },
  },
  { timestamps: true },
);

const financialProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    monthlyIncome: { type: Number, required: true, min: 0 },
    essentialExpenses: { type: Number, required: true, min: 0 },
    obligations: { type: Number, required: true, min: 0 },
    currentSavings: { type: Number, required: true, min: 0 },
    monthlyCapacity: { type: Number, required: true, min: 0 },
    targetAge: { type: Number, required: true },
    desiredFutureIncome: { type: Number, required: true, min: 0 },
    emergencyMonths: { type: Number, required: true, min: 1, max: 24 },
    currentAge: { type: Number, required: true },
    riskCategory: { type: String, enum: ["conservative", "balanced", "growth"], required: true },
    suitabilityScore: { type: Number, required: true, min: 0, max: 100 },
  },
  { timestamps: true },
);

const yearlyValueSchema = new Schema(
  {
    year: { type: Number, required: true },
    value: { type: Number, required: true },
  },
  { _id: false },
);

const futurePlanSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, trim: true, maxlength: 80 },
    currentAge: { type: Number, required: true },
    targetAge: { type: Number, required: true },
    initialBalance: { type: Number, required: true, min: 0 },
    monthlyContribution: { type: Number, required: true, min: 0 },
    matchedContribution: { type: Number, required: true, min: 0 },
    annualStepUp: { type: Number, required: true, min: 0 },
    annualFee: { type: Number, required: true, min: 0 },
    inflationRate: { type: Number, required: true, min: 0 },
    withdrawalRate: { type: Number, required: true, min: 0 },
    emergencyMonths: { type: Number, required: true, min: 1, max: 24 },
    scenario: { type: String, enum: ["conservative", "balanced", "growth"], required: true },
    emergencyTarget: { type: Number, required: true, min: 0 },
    estimatedValue: { type: Number, required: true, min: 0 },
    estimatedRealValue: { type: Number, required: true, min: 0 },
    estimatedMonthlyIncome: { type: Number, required: true, min: 0 },
    yearlyValues: { type: [yearlyValueSchema], default: [] },
    status: { type: String, enum: ["active", "paused", "archived"], default: "active", index: true },
  },
  { timestamps: true },
);
futurePlanSchema.index({ userId: 1, createdAt: -1 });

export const User = models.User ?? model("User", userSchema);
export const FinancialProfile =
  models.FinancialProfile ?? model("FinancialProfile", financialProfileSchema);
export const FuturePlan = models.FuturePlan ?? model("FuturePlan", futurePlanSchema);