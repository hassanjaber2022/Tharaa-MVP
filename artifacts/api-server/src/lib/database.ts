import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { logger } from "./logger";
import { User } from "../models";

export function getMongoUri(): string {
  const rawMongoUri = process.env.MONGODB_URI;
  if (!rawMongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  let mongoUri = rawMongoUri.trim();
  if (mongoUri.startsWith("MONGODB_URI=")) {
    mongoUri = mongoUri.slice("MONGODB_URI=".length).trim();
  }

  const firstCharacter = mongoUri.at(0);
  const lastCharacter = mongoUri.at(-1);
  if (
    mongoUri.length >= 2 &&
    ((firstCharacter === '"' && lastCharacter === '"') ||
      (firstCharacter === "'" && lastCharacter === "'"))
  ) {
    mongoUri = mongoUri.slice(1, -1).trim();
  }

  mongoUri = mongoUri.replace(/[\r\n\t]/g, "");

  if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
    throw new Error(
      "MONGODB_URI must be a MongoDB Drivers connection string starting with mongodb:// or mongodb+srv://",
    );
  }

  return mongoUri;
}

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(getMongoUri());
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