type ProjectionInput = {
  currentAge: number;
  targetAge: number;
  initialBalance: number;
  monthlyContribution: number;
  matchedContribution: number;
  annualStepUp: number;
  annualFee: number;
  inflationRate: number;
  withdrawalRate: number;
};

const scenarios = [
  { key: "conservative" as const, label: "متحفظ", annualRate: 3.5 },
  { key: "balanced" as const, label: "متوازن", annualRate: 5.5 },
  { key: "growth" as const, label: "نمو", annualRate: 7 },
];

export const disclosure =
  "هذه النتائج سيناريوهات توضيحية وليست ضماناً أو توصية استثمارية. قيمة الاستثمار قد ترتفع أو تنخفض.";

export function calculateProjection(input: ProjectionInput) {
  const years = input.targetAge - input.currentAge;
  if (years <= 0) {
    throw new Error("يجب أن يكون العمر المستهدف أكبر من العمر الحالي");
  }

  return {
    years,
    scenarios: scenarios.map((scenario) => {
      const netAnnualRate = Math.max(-99, scenario.annualRate - input.annualFee) / 100;
      const monthlyRate =
        netAnnualRate === 0 ? 0 : Math.pow(1 + netAnnualRate, 1 / 12) - 1;
      let balance = input.initialBalance;
      let contribution =
        input.monthlyContribution + input.matchedContribution;
      let totalContributions = input.initialBalance;
      const yearlyValues: Array<{ year: number; value: number }> = [];

      for (let year = 1; year <= years; year += 1) {
        for (let month = 0; month < 12; month += 1) {
          balance = balance * (1 + monthlyRate) + contribution;
          totalContributions += contribution;
        }
        yearlyValues.push({ year: input.currentAge + year, value: round(balance) });
        contribution *= 1 + input.annualStepUp / 100;
      }

      const nominalValue = round(balance);
      const realValue = round(
        nominalValue / Math.pow(1 + input.inflationRate / 100, years),
      );

      return {
        ...scenario,
        totalContributions: round(totalContributions),
        illustrativeGrowth: round(Math.max(0, nominalValue - totalContributions)),
        nominalValue,
        realValue,
        monthlyIncome: round((nominalValue * (input.withdrawalRate / 100)) / 12),
        yearlyValues,
      };
    }),
    disclosure,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}