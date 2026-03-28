import { createContext, useContext, useReducer, useEffect, type Dispatch } from 'react';
import type { Scenario, CompInputs } from '../types/compensation';
import { OPTION_A, OPTION_B } from '../engine/defaults';

const STORAGE_KEY = 'comp-scenarios';

type Action =
  | { type: 'SET_ACTIVE'; id: string }
  | { type: 'UPDATE_INPUTS'; id: string; inputs: CompInputs }
  | { type: 'ADD'; scenario: Scenario }
  | { type: 'DUPLICATE'; id: string }
  | { type: 'DELETE'; id: string }
  | { type: 'RENAME'; id: string; name: string }
  | { type: 'LOAD'; state: ScenarioState };

export interface ScenarioState {
  scenarios: Scenario[];
  activeId: string;
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

const defaultScenarios: Scenario[] = [
  { id: 'a', name: 'Option A — 3 Month Pass Through', inputs: OPTION_A },
  { id: 'b', name: 'Option B — 2 Month Pass Through', inputs: OPTION_B },
];

const initialState: ScenarioState = {
  scenarios: defaultScenarios,
  activeId: 'a',
};

function reducer(state: ScenarioState, action: Action): ScenarioState {
  switch (action.type) {
    case 'SET_ACTIVE':
      return { ...state, activeId: action.id };
    case 'UPDATE_INPUTS':
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.id ? { ...s, inputs: action.inputs } : s,
        ),
      };
    case 'ADD':
      return {
        ...state,
        scenarios: [...state.scenarios, action.scenario],
        activeId: action.scenario.id,
      };
    case 'DUPLICATE': {
      const source = state.scenarios.find((s) => s.id === action.id);
      if (!source) return state;
      const newId = makeId();
      const dup: Scenario = {
        id: newId,
        name: `${source.name} (copy)`,
        inputs: JSON.parse(JSON.stringify(source.inputs)),
      };
      return { ...state, scenarios: [...state.scenarios, dup], activeId: newId };
    }
    case 'DELETE': {
      if (state.scenarios.length <= 1) return state;
      const remaining = state.scenarios.filter((s) => s.id !== action.id);
      return {
        ...state,
        scenarios: remaining,
        activeId:
          state.activeId === action.id ? remaining[0].id : state.activeId,
      };
    }
    case 'RENAME':
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.id ? { ...s, name: action.name } : s,
        ),
      };
    case 'LOAD':
      return action.state;
    default:
      return state;
  }
}

export const ScenarioContext = createContext<{
  state: ScenarioState;
  dispatch: Dispatch<Action>;
}>({ state: initialState, dispatch: () => {} });

export function useScenarioReducer() {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ScenarioState;
        if (parsed.scenarios?.length) return parsed;
      }
    } catch { /* ignore */ }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return { state, dispatch };
}

export function useScenarios() {
  return useContext(ScenarioContext);
}
