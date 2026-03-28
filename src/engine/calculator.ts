import type { CompInputs, CompOutput, MonthResult } from '../types/compensation';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function calculateComp(inputs: CompInputs): CompOutput {
  const monthlyBase = inputs.baseSalary / 12;
  const totalTaxRate = inputs.federalTax + inputs.stateTax + inputs.fica;
  const months: MonthResult[] = [];

  // Pass-through commission per month
  const passThroughCommission =
    (inputs.passThroughPipeline * inputs.passThroughRate) / inputs.passThroughMonths;

  // Build month list starting from startMonth
  let currentMonth = inputs.startMonth;

  // Pass-through months
  for (let i = 0; i < inputs.passThroughMonths; i++) {
    const gross = monthlyBase + passThroughCommission;
    const tax = gross * totalTaxRate;
    const netUSD = gross - tax - inputs.monthlyInsurance;
    months.push({
      month: MONTH_NAMES[currentMonth],
      monthIndex: currentMonth,
      gross: Math.round(gross),
      base: Math.round(monthlyBase),
      commission: Math.round(passThroughCommission),
      tax: Math.round(tax),
      insurance: inputs.monthlyInsurance,
      netUSD: Math.round(netUSD),
      netCAD: Math.round(netUSD * inputs.fxRate),
      type: 'pass-through',
      quarterIndex: 0,
    });
    currentMonth = (currentMonth + 1) % 12;
  }

  // Production quarters
  for (let qi = 0; qi < inputs.quarters.length; qi++) {
    const q = inputs.quarters[qi];
    const monthlyCommission =
      (q.pipeline * q.attainment * inputs.baseCommissionRate) / q.months;
    const trueUp = q.attainment >= 1.0
      ? q.pipeline * q.attainment * (inputs.acceleratedRate - inputs.baseCommissionRate)
      : 0;
    for (let m = 0; m < q.months; m++) {
      const isLastMonth = m === q.months - 1;
      const commission = monthlyCommission + (isLastMonth ? trueUp : 0);
      const gross = monthlyBase + commission;
      const tax = gross * totalTaxRate;
      const netUSD = gross - tax - inputs.monthlyInsurance;
      months.push({
        month: MONTH_NAMES[currentMonth],
        monthIndex: currentMonth,
        gross: Math.round(gross),
        base: Math.round(monthlyBase),
        commission: Math.round(commission),
        tax: Math.round(tax),
        insurance: inputs.monthlyInsurance,
        netUSD: Math.round(netUSD),
        netCAD: Math.round(netUSD * inputs.fxRate),
        type: 'production',
        quarterIndex: qi + 1,
      });
      currentMonth = (currentMonth + 1) % 12;
    }
  }

  const grossTotal = months.reduce((s, m) => s + m.gross, 0);
  const taxTotal = months.reduce((s, m) => s + m.tax, 0);
  const insuranceTotal = months.reduce((s, m) => s + m.insurance, 0);
  const netTotalUSD = months.reduce((s, m) => s + m.netUSD, 0);
  const netTotalCAD = months.reduce((s, m) => s + m.netCAD, 0);

  // Guaranteed floor: same calc but with 0% attainment on production quarters
  const floorInputs: CompInputs = {
    ...inputs,
    quarters: inputs.quarters.map((q) => ({ ...q, attainment: 0 })),
  };
  const floorMonths = calculateCompMonths(floorInputs);
  const guaranteedFloorUSD = floorMonths.reduce((s, m) => s + m.netUSD, 0);

  return {
    months,
    grossTotal,
    taxTotal,
    insuranceTotal,
    netTotalUSD,
    netTotalCAD,
    avgMonthlyNetUSD: Math.round(netTotalUSD / months.length),
    avgMonthlyNetCAD: Math.round(netTotalCAD / months.length),
    guaranteedFloorUSD: Math.round(guaranteedFloorUSD),
    guaranteedFloorCAD: Math.round(guaranteedFloorUSD * inputs.fxRate),
  };
}

// Internal helper that just returns months (used for floor calc)
function calculateCompMonths(inputs: CompInputs): MonthResult[] {
  const monthlyBase = inputs.baseSalary / 12;
  const totalTaxRate = inputs.federalTax + inputs.stateTax + inputs.fica;
  const months: MonthResult[] = [];
  const passThroughCommission =
    (inputs.passThroughPipeline * inputs.passThroughRate) / inputs.passThroughMonths;

  let currentMonth = inputs.startMonth;

  for (let i = 0; i < inputs.passThroughMonths; i++) {
    const gross = monthlyBase + passThroughCommission;
    const tax = gross * totalTaxRate;
    const netUSD = gross - tax - inputs.monthlyInsurance;
    months.push({
      month: MONTH_NAMES[currentMonth],
      monthIndex: currentMonth,
      gross: Math.round(gross),
      base: Math.round(monthlyBase),
      commission: Math.round(passThroughCommission),
      tax: Math.round(tax),
      insurance: inputs.monthlyInsurance,
      netUSD: Math.round(netUSD),
      netCAD: Math.round(netUSD * inputs.fxRate),
      type: 'pass-through',
      quarterIndex: 0,
    });
    currentMonth = (currentMonth + 1) % 12;
  }

  for (let qi = 0; qi < inputs.quarters.length; qi++) {
    const q = inputs.quarters[qi];
    const monthlyCommission =
      (q.pipeline * q.attainment * inputs.baseCommissionRate) / q.months;
    const trueUp = q.attainment >= 1.0
      ? q.pipeline * q.attainment * (inputs.acceleratedRate - inputs.baseCommissionRate)
      : 0;
    for (let m = 0; m < q.months; m++) {
      const isLastMonth = m === q.months - 1;
      const commission = monthlyCommission + (isLastMonth ? trueUp : 0);
      const gross = monthlyBase + commission;
      const tax = gross * totalTaxRate;
      const netUSD = gross - tax - inputs.monthlyInsurance;
      months.push({
        month: MONTH_NAMES[currentMonth],
        monthIndex: currentMonth,
        gross: Math.round(gross),
        base: Math.round(monthlyBase),
        commission: Math.round(commission),
        tax: Math.round(tax),
        insurance: inputs.monthlyInsurance,
        netUSD: Math.round(netUSD),
        netCAD: Math.round(netUSD * inputs.fxRate),
        type: 'production',
        quarterIndex: qi + 1,
      });
      currentMonth = (currentMonth + 1) % 12;
    }
  }

  return months;
}

export function calculateAttainmentCurve(
  inputs: CompInputs,
  steps = 21,
): { attainment: number; netUSD: number; netCAD: number }[] {
  const results: { attainment: number; netUSD: number; netCAD: number }[] = [];
  for (let i = 0; i <= steps - 1; i++) {
    const attainment = (i / (steps - 1)) * 2; // 0 to 2 (0% to 200%)
    const modified: CompInputs = {
      ...inputs,
      quarters: inputs.quarters.map((q) => ({ ...q, attainment })),
    };
    const output = calculateComp(modified);
    results.push({
      attainment: Math.round(attainment * 100),
      netUSD: output.netTotalUSD,
      netCAD: output.netTotalCAD,
    });
  }
  return results;
}
