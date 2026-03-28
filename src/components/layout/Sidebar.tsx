import { useState } from 'react';
import { useScenarios } from '../../hooks/useScenarios';
import { useTheme } from '../../hooks/useTheme';
import { OPTION_A } from '../../engine/defaults';

interface Props {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse }: Props) {
  const { state, dispatch } = useScenarios();
  const { resolved, toggle } = useTheme();
  const [editing, setEditing] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <aside
      className={`h-screen flex flex-col bg-sidebar-bg border-r border-sidebar-border shrink-0 transition-all duration-200 ${
        collapsed ? 'w-[60px]' : 'w-[240px]'
      }`}
    >
      {/* Brand */}
      <div className="h-14 flex items-center px-4 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-bold">$</span>
        </div>
        {!collapsed && (
          <span className="ml-3 text-sm font-semibold text-text whitespace-nowrap">CompCalc</span>
        )}
      </div>

      {/* Scenarios */}
      {!collapsed && (
        <div className="mt-4 px-3 flex-1 min-h-0 overflow-y-auto">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2 px-1">
            Scenarios
          </p>
          <div className="space-y-0.5">
            {state.scenarios.map((s) => (
              <div
                key={s.id}
                className="group relative"
                onMouseEnter={() => setHoveredId(s.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {editing === s.id ? (
                  <input
                    autoFocus
                    className="w-full bg-surface2 text-sm text-text border border-indigo/40 rounded-lg px-2.5 py-1.5 outline-none"
                    defaultValue={s.name}
                    onBlur={(e) => {
                      dispatch({ type: 'RENAME', id: s.id, name: e.target.value });
                      setEditing(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      if (e.key === 'Escape') setEditing(null);
                    }}
                  />
                ) : (
                  <button
                    onClick={() => {
                      dispatch({ type: 'SET_ACTIVE', id: s.id });
                    }}
                    className={`w-full text-left text-[13px] rounded-lg px-2.5 py-1.5 transition-colors truncate ${
                      s.id === state.activeId
                        ? 'bg-indigo/10 text-indigo font-medium'
                        : 'text-text-secondary hover:bg-surface2 hover:text-text'
                    }`}
                  >
                    {s.name}
                  </button>
                )}
                {/* Hover actions */}
                {hoveredId === s.id && editing !== s.id && (
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-sidebar-bg/90 backdrop-blur-sm rounded-md pl-1">
                    <MiniButton
                      title="Rename"
                      onClick={(e) => { e.stopPropagation(); setEditing(s.id); }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                    </MiniButton>
                    <MiniButton
                      title="Duplicate"
                      onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DUPLICATE', id: s.id }); }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                    </MiniButton>
                    {state.scenarios.length > 1 && (
                      <MiniButton
                        title="Delete"
                        onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE', id: s.id }); }}
                        danger
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </MiniButton>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              const id = Math.random().toString(36).slice(2, 9);
              dispatch({
                type: 'ADD',
                scenario: {
                  id,
                  name: `Scenario ${state.scenarios.length + 1}`,
                  inputs: { ...OPTION_A, name: `Scenario ${state.scenarios.length + 1}` },
                },
              });
            }}
            className="w-full mt-2 py-2 text-xs text-muted border border-dashed border-border rounded-lg hover:text-text-secondary hover:border-muted transition-colors"
          >
            + New Scenario
          </button>
        </div>
      )}

      {/* Bottom controls */}
      <div className="mt-auto px-2 py-3 border-t border-sidebar-border flex items-center gap-1">
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-muted hover:text-text hover:bg-surface2 transition-colors"
          title={resolved === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {resolved === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
        {!collapsed && <div className="flex-1" />}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg text-muted hover:text-text hover:bg-surface2 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

/* ── Mobile sidebar overlay ── */
export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed left-0 top-0 bottom-0 z-50 w-[260px]">
        <Sidebar
          collapsed={false}
          onToggleCollapse={onClose}
        />
      </div>
    </>
  );
}

/* ── Sub-components ── */

function MiniButton({
  children,
  title,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  title: string;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        danger ? 'text-muted hover:text-red' : 'text-muted hover:text-text'
      }`}
    >
      {children}
    </button>
  );
}

/* ── Icons ── */
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
