import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { logger } from "./logger";
import { User } from "../models";

export async function connectDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(mongoUri);
  logger.info("Connected to MongoDB");
  await ensureAdminUser();
}

async function ensureAdminUser(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    logger.warn("Admin seed skipped because ADMIN_EMAIL or ADMIN_PASSWORD is missing");
    return;
  }

  const existing = await User.findOne({ email }).select("_id");
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({
    name: "مدير ثراء",
    email,
    passwordHash,
    role: "admin",
    emailVerified: true,
    status: "active",
  });
  logger.info("Initial admin account created from secrets");
}