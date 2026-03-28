export interface CompInputs {
  name: string;
  baseSalary: number;       // annual USD
  startMonth: number;       // 0-indexed (0=Jan, 4=May)
  baseCommissionRate: number;   // e.g. 0.13
  acceleratedRate: number;      // e.g. 0.16 — true-up target at 100%+ attainment
  passThroughRate: number;  // e.g. 0.16
  passThroughMonths: number;
  passThroughPipeline: number;
  // Production quarters — each has pipeline + attainment
  quarters: QuarterInput[];
  federalTax: number;       // e.g. 0.22
  stateTax: number;         // e.g. 0.06
  fica: number;             // e.g. 0.0765
  monthlyInsurance: number; // e.g. 150
  fxRate: number;           // USD to CAD, e.g. 1.44
}

export interface QuarterInput {
  pipeline: number;
  attainment: number; // 0-2 (percentage as decimal, 1 = 100%)
  months: number;     // how many months in this quarter
}

export interface MonthResult {
  month: string;
  monthIndex: number;
  gross: number;
  base: number;
  commission: number;
  tax: number;
  insurance: number;
  netUSD: number;
  netCAD: number;
  type: 'pass-through' | 'production';
  quarterIndex: number; // 0 = pass-through, 1+ = production quarters
}

export interface CompOutput {
  months: MonthResult[];
  grossTotal: number;
  taxTotal: number;
  insuranceTotal: number;
  netTotalUSD: number;
  netTotalCAD: number;
  avgMonthlyNetUSD: number;
  avgMonthlyNetCAD: number;
  guaranteedFloorUSD: number; // net if 0% attainment on production
  guaranteedFloorCAD: number;
}

export interface Scenario {
  id: string;
  name: string;
  inputs: CompInputs;
}
