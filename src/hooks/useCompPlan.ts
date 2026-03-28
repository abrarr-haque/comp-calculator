import { useMemo } from 'react';
import type { CompInputs, CompOutput } from '../types/compensation';
import { calculateComp, calculateAttainmentCurve } from '../engine/calculator';

export function useCompPlan(inputs: CompInputs) {
  const output = useMemo(() => calculateComp(inputs), [inputs]);
  const attainmentCurve = useMemo(() => calculateAttainmentCurve(inputs), [inputs]);
  return { output, attainmentCurve };
}

export type { CompOutput };
