import express, { type Express } from "express";
import pinoHttp from "pino-http";
import session from "express-session";
import MongoStore from "connect-mongo";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";
import { getMongoUri } from "./lib/database";

import cors from "cors";

const app: Express = express();

const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || "";
const customAllowedOrigins = allowedOriginsEnv.split(",").map(o => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      try {
        const originUrl = new URL(origin);
        const hostname = originUrl.hostname;
        if (
          hostname === "localhost" ||
          hostname === "127.0.0.1" ||
          hostname.endsWith(".netlify.app") ||
          hostname.endsWith(".onrender.com") ||
          customAllowedOrigins.includes(origin)
        ) {
          return callback(null, true);
        }
      } catch {}
      callback(null, true); // Allow during transition to avoid blocking
    },
    credentials: true,
  })
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isCrossDomain = process.env.COOKIE_CROSS_DOMAIN === "true";

app.use(
  session({
    name: "tharaa.sid",
    secret: process.env.SESSION_SECRET ?? "tharaa_default_secret_key_2026",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: getMongoUri(),
      collectionName: "sessions",
      touchAfter: 24 * 3600,
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: isCrossDomain ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method) || !req.headers.origin) {
    next();
    return;
  }
  try {
    const originHost = new URL(req.headers.origin).hostname;
    const currentHost = (req.get("host") || "").split(":")[0];
    if (
      originHost === currentHost ||
      originHost.endsWith(".netlify.app") ||
      originHost.endsWith(".onrender.com") ||
      originHost === "localhost" ||
      customAllowedOrigins.some(o => o.includes(originHost))
    ) {
      next();
      return;
    }
  } catch {}
  next();
});
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use("/api", router);
app.use("/api/{*splat}", (_req, res) => {
  res.status(404).json({ error: "المسار غير موجود" });
});
app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    logger.error({ err: error }, "Unhandled request error");
    res.status(500).json({ error: "حدث خطأ داخلي، حاول مرة أخرى" });
  },
);

export default app;
