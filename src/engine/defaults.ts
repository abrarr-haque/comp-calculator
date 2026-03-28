import type { CompInputs } from '../types/compensation';

export const OPTION_A: CompInputs = {
  name: 'Option A — 3 Month Pass Through',
  baseSalary: 85000,
  startMonth: 4, // May
  baseCommissionRate: 0.13,
  acceleratedRate: 0.16,
  passThroughRate: 0.16,
  passThroughMonths: 3,
  passThroughPipeline: 150000,
  quarters: [
    { pipeline: 150000, attainment: 0.5, months: 3 },
    { pipeline: 100000, attainment: 0.5, months: 2 },
  ],
  federalTax: 0.22,
  stateTax: 0.06,
  fica: 0.0765,
  monthlyInsurance: 150,
  fxRate: 1.44,
};

export const OPTION_B: CompInputs = {
  name: 'Option B — 2 Month Pass Through',
  baseSalary: 85000,
  startMonth: 4, // May
  baseCommissionRate: 0.13,
  acceleratedRate: 0.16,
  passThroughRate: 0.16,
  passThroughMonths: 2,
  passThroughPipeline: 100000,
  quarters: [
    { pipeline: 150000, attainment: 0.5, months: 3 },
    { pipeline: 150000, attainment: 0.5, months: 3 },
  ],
  federalTax: 0.22,
  stateTax: 0.06,
  fica: 0.0765,
  monthlyInsurance: 150,
  fxRate: 1.44,
};
