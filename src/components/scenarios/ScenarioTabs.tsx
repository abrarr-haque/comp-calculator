import { useState } from 'react';
import { useScenarios } from '../../hooks/useScenarios';
import { OPTION_A } from '../../engine/defaults';

export function ScenarioTabs() {
  const { state, dispatch } = useScenarios();
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-1">
      {state.scenarios.map((s) => (
        <div key={s.id} className="flex items-center">
          {editing === s.id ? (
            <input
              autoFocus
              className="bg-surface2 text-sm text-text border border-indigo/40 rounded-lg px-3 py-1.5 outline-none min-w-[140px]"
              defaultValue={s.name}
              onBlur={(e) => { dispatch({ type: 'RENAME', id: s.id, name: e.target.value }); setEditing(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            />
          ) : (
            <button
              onClick={() => dispatch({ type: 'SET_ACTIVE', id: s.id })}
              onDoubleClick={() => setEditing(s.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap ${
                s.id === state.activeId
                  ? 'bg-surface2 text-text font-medium'
                  : 'text-muted hover:text-text-secondary'
              }`}
            >
              {s.name}
            </button>
          )}
        </div>
      ))}
      <span className="w-px h-5 bg-border mx-1" />
      <button
        onClick={() => dispatch({ type: 'DUPLICATE', id: state.activeId })}
        className="p-1.5 text-muted hover:text-text-secondary rounded-md transition-colors"
        title="Duplicate"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
      <button
        onClick={() => {
          const id = Math.random().toString(36).slice(2, 9);
          dispatch({ type: 'ADD', scenario: { id, name: `Scenario ${state.scenarios.length + 1}`, inputs: { ...OPTION_A, name: `Scenario ${state.scenarios.length + 1}` } } });
        }}
        className="p-1.5 text-muted hover:text-text-secondary rounded-md transition-colors"
        title="New scenario"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
      </button>
      {state.scenarios.length > 1 && (
        <button
          onClick={() => dispatch({ type: 'DELETE', id: state.activeId })}
          className="p-1.5 text-muted hover:text-red rounded-md transition-colors"
          title="Delete"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
        </button>
      )}
    </div>
  );
}
