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

  const mongoPassword = process.env.MONGODB_PASSWORD;
  const schemeEnd = mongoUri.indexOf("://") + 3;
  const relativeAuthorityEnd = mongoUri.slice(schemeEnd).search(/[/?#]/);
  const effectiveAuthorityEnd =
    relativeAuthorityEnd === -1 ? mongoUri.length : schemeEnd + relativeAuthorityEnd;
  const authority = mongoUri.slice(schemeEnd, effectiveAuthorityEnd);
  const separatorIndex = authority.lastIndexOf("@");

  if (mongoPassword) {
    const userInfo = separatorIndex === -1 ? "" : authority.slice(0, separatorIndex);
    const usernameSeparatorIndex = userInfo.indexOf(":");
    let username =
      usernameSeparatorIndex === -1 ? userInfo : userInfo.slice(0, usernameSeparatorIndex);
    username = username.replace(/[<>]/g, "").trim();

    if (!username || separatorIndex === -1) {
      throw new Error("MONGODB_URI must include a database username");
    }

    const hostAndOptions = mongoUri.slice(schemeEnd + separatorIndex + 1);
    mongoUri = `${mongoUri.slice(0, schemeEnd)}${username}:${encodeURIComponent(mongoPassword)}@${hostAndOptions}`;
  } else if (separatorIndex !== -1) {
    // If password was provided inside MONGODB_URI directly, safely encode any special characters
    const userInfo = authority.slice(0, separatorIndex);
    const colonIndex = userInfo.indexOf(":");
    if (colonIndex !== -1) {
      let username = userInfo.slice(0, colonIndex).replace(/[<>]/g, "").trim();
      let rawPass = userInfo.slice(colonIndex + 1).replace(/[<>]/g, "").trim();
      try {
        rawPass = decodeURIComponent(rawPass);
      } catch {}
      const safeEncodedPass = encodeURIComponent(rawPass);
      const hostAndOptions = mongoUri.slice(schemeEnd + separatorIndex + 1);
      mongoUri = `${mongoUri.slice(0, schemeEnd)}${username}:${safeEncodedPass}@${hostAndOptions}`;
    }
  }

  // Remove any stray angle brackets that user might have pasted around username or cluster
  mongoUri = mongoUri.replace(/[<>]/g, "");

  const queryStart = mongoUri.indexOf("?", schemeEnd);
  const pathStart = mongoUri.indexOf("/", schemeEnd);
  if (pathStart === -1 || (queryStart !== -1 && pathStart > queryStart)) {
    const insertAt = queryStart === -1 ? mongoUri.length : queryStart;
    mongoUri = `${mongoUri.slice(0, insertAt)}/tharaa${mongoUri.slice(insertAt)}`;
  } else {
    const pathEnd = queryStart === -1 ? mongoUri.length : queryStart;
    if (mongoUri.slice(pathStart, pathEnd) === "/") {
      mongoUri = `${mongoUri.slice(0, pathStart)}/tharaa${mongoUri.slice(pathEnd)}`;
    }
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