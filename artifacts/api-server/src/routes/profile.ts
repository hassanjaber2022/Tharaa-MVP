import { Router, type IRouter } from "express";
import {
  GetProfileResponse,
  UpdateProfileBody,
  UpdateProfileResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { FinancialProfile } from "../models";
import { serializeProfile } from "../lib/serializers";

const router: IRouter = Router();
router.use("/profile", requireAuth);

router.get("/profile", async (req, res): Promise<void> => {
  const profile = await FinancialProfile.findOne({ userId: req.session.userId });
  res.json(profile ? GetProfileResponse.parse(serializeProfile(profile)) : null);
});

router.put("/profile", async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success || parsed.data.targetAge <= parsed.data.currentAge) {
    res.status(400).json({ error: "تحقق من البيانات والعمر المستهدف" });
    return;
  }

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (parsed.data.monthlyCapacity / Math.max(parsed.data.monthlyIncome, 1)) * 50 +
          (parsed.data.currentSavings /
            Math.max(parsed.data.essentialExpenses * parsed.data.emergencyMonths, 1)) *
            50,
      ),
    ),
  );

  const profile = await FinancialProfile.findOneAndUpdate(
    { userId: req.session.userId },
    { ...parsed.data, suitabilityScore: score },
    { upsert: true, new: true, runValidators: true },
  );
  res.json(UpdateProfileResponse.parse(serializeProfile(profile)));
});

export default router;