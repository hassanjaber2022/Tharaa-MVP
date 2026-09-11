import express, { type Express } from "express";
import pinoHttp from "pino-http";
import session from "express-session";
import MongoStore from "connect-mongo";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";
import { getMongoUri } from "./lib/database";

const app: Express = express();

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
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: "tharaa.sid",
    secret: process.env.SESSION_SECRET ?? "",
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
      sameSite: "lax",
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
    if (new URL(req.headers.origin).host !== req.get("host")) {
      res.status(403).json({ error: "مصدر الطلب غير مسموح" });
      return;
    }
  } catch {
    res.status(403).json({ error: "مصدر الطلب غير صالح" });
    return;
  }
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
