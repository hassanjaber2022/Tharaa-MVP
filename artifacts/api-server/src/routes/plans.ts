import { Router, type IRouter } from "express";
import {
  CreatePlanBody,
  CreatePlanResponse,
  GetDashboardResponse,
  GetPlanParams,
  GetPlanResponse,
  ListPlansResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { FinancialProfile, FuturePlan, User } from "../models";
import { calculateProjection } from "../lib/projection";
import { serializePlan, serializeUser } from "../lib/serializers";

const router: IRouter = Router();
router.use(["/plans", "/plans/:id", "/dashboard"], requireAuth);

router.get("/plans", async (req, res): Promise<void> => {
  const plans = await FuturePlan.find({ userId: req.session.userId }).sort({
    createdAt: -1,
  });
  res.json(ListPlansResponse.parse(plans.map(serializePlan)));
});

router.post("/plans", async (req, res): Promise<void> => {
  const parsed = CreatePlanBody.safeParse(req.body);
  if (!parsed.success || parsed.data.targetAge <= parsed.data.currentAge) {
    res.status(400).json({ error: "تحقق من بيانات الخطة" });
    return;
  }

  const result = calculateProjection(parsed.data);
  const selected = result.scenarios.find((item) => item.key === parsed.data.scenario);
  if (!selected) {
    res.status(400).json({ error: "السيناريو غير صحيح" });
    return;
  }

  const profile = await FinancialProfile.findOne({ userId: req.session.userId });
  const plan = await FuturePlan.create({
    ...parsed.data,
    userId: req.session.userId,
    emergencyTarget: (profile?.essentialExpenses ?? 0) * parsed.data.emergencyMonths,
    estimatedValue: selected.nominalValue,
    estimatedRealValue: selected.realValue,
    estimatedMonthlyIncome: selected.monthlyIncome,
    yearlyValues: selected.yearlyValues,
    status: "active",
  });
  res.status(201).json(CreatePlanResponse.parse(serializePlan(plan)));
});

router.get("/plans/:id", async (req, res): Promise<void> => {
  const params = GetPlanParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "الخطة غير موجودة" });
    return;
  }

  const plan = await FuturePlan.findOne({
    _id: params.data.id,
    userId: req.session.userId,
  }).catch(() => null);
  if (!plan) {
    res.status(404).json({ error: "الخطة غير موجودة" });
    return;
  }
  res.json(GetPlanResponse.parse(serializePlan(plan)));
});

router.get("/dashboard", async (req, res): Promise<void> => {
  const [user, profile, activePlan, planCount] = await Promise.all([
    User.findById(req.session.userId),
    FinancialProfile.findOne({ userId: req.session.userId }),
    FuturePlan.findOne({ userId: req.session.userId, status: "active" }).sort({
      createdAt: -1,
    }),
    FuturePlan.countDocuments({ userId: req.session.userId }),
  ]);

  if (!user) {
    res.status(401).json({ error: "انتهت الجلسة" });
    return;
  }

  const emergencyTarget = activePlan?.emergencyTarget ?? 0;
  const emergencyProgress =
    emergencyTarget > 0
      ? Math.min(100, Math.round(((profile?.currentSavings ?? 0) / emergencyTarget) * 100))
      : 0;

  res.json(
    GetDashboardResponse.parse({
      user: serializeUser(user),
      profileComplete: Boolean(profile),
      activePlan: activePlan ? serializePlan(activePlan) : null,
      emergencyProgress,
      planCount,
      recommendation: activePlan
        ? "استمر على مساهمتك الشهرية وراجع خطتك كل ستة أشهر."
        : "ابدأ بالحاسبة واحفظ أول خطة لتظهر مؤشراتك هنا.",
    }),
  );
});

export default router;