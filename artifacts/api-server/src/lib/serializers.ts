export function serializeUser(user: any) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
  };
}

export function serializeProfile(profile: any) {
  return {
    id: profile._id.toString(),
    userId: profile.userId.toString(),
    monthlyIncome: profile.monthlyIncome,
    essentialExpenses: profile.essentialExpenses,
    obligations: profile.obligations,
    currentSavings: profile.currentSavings,
    monthlyCapacity: profile.monthlyCapacity,
    targetAge: profile.targetAge,
    desiredFutureIncome: profile.desiredFutureIncome,
    emergencyMonths: profile.emergencyMonths,
    currentAge: profile.currentAge,
    riskCategory: profile.riskCategory,
    suitabilityScore: profile.suitabilityScore,
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export function serializePlan(plan: any) {
  return {
    id: plan._id.toString(),
    userId: plan.userId.toString(),
    title: plan.title,
    currentAge: plan.currentAge,
    targetAge: plan.targetAge,
    initialBalance: plan.initialBalance,
    monthlyContribution: plan.monthlyContribution,
    matchedContribution: plan.matchedContribution,
    annualStepUp: plan.annualStepUp,
    annualFee: plan.annualFee,
    inflationRate: plan.inflationRate,
    withdrawalRate: plan.withdrawalRate,
    emergencyMonths: plan.emergencyMonths,
    scenario: plan.scenario,
    emergencyTarget: plan.emergencyTarget,
    estimatedValue: plan.estimatedValue,
    estimatedRealValue: plan.estimatedRealValue,
    estimatedMonthlyIncome: plan.estimatedMonthlyIncome,
    status: plan.status,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
}