import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import {
  GetCurrentUserResponse,
  LoginBody,
  LoginResponse,
  RegisterBody,
  RegisterResponse,
} from "@workspace/api-zod";
import { User } from "../models";
import { requireAuth } from "../middlewares/auth";
import { serializeUser } from "../lib/serializers";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "تحقق من الاسم والبريد وكلمة المرور" });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  if (await User.exists({ email })) {
    res.status(409).json({ error: "البريد الإلكتروني مسجل بالفعل" });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await User.create({
    name: parsed.data.name,
    email,
    passwordHash,
    role: "customer",
    emailVerified: false,
    status: "active",
  });

  req.session.userId = user._id.toString();
  req.session.role = user.role;
  res.status(201).json(RegisterResponse.parse(serializeUser(user)));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "تحقق من البريد وكلمة المرور" });
    return;
  }

  const user = await User.findOne({
    email: parsed.data.email.trim().toLowerCase(),
    status: "active",
  }).select("+passwordHash");

  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
  req.session.userId = user._id.toString();
  req.session.role = user.role;
  res.json(LoginResponse.parse(serializeUser(user)));
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy((error) => {
    if (error) {
      res.status(500).json({ error: "تعذر تسجيل الخروج" });
      return;
    }
    res.clearCookie("tharaa.sid");
    res.sendStatus(204);
  });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const user = await User.findById(req.session.userId);
  if (!user || user.status !== "active") {
    req.session.destroy(() => undefined);
    res.status(401).json({ error: "انتهت الجلسة" });
    return;
  }
  res.json(GetCurrentUserResponse.parse(serializeUser(user)));
});

export default router;