import { Router, type IRouter } from "express";
import {
  ProjectCalculatorBody,
  ProjectCalculatorResponse,
} from "@workspace/api-zod";
import { calculateProjection } from "../lib/projection";

const router: IRouter = Router();

router.post("/calculator/project", (req, res): void => {
  const parsed = ProjectCalculatorBody.safeParse(req.body);
  if (!parsed.success || parsed.data.targetAge <= parsed.data.currentAge) {
    res.status(400).json({ error: "تحقق من أعمار الخطة ومدخلات الحاسبة" });
    return;
  }
  res.json(ProjectCalculatorResponse.parse(calculateProjection(parsed.data)));
});

export default router;