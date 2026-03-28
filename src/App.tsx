import { useState } from 'react';
import { Dashboard } from './components/layout/Dashboard';
import { Sidebar, MobileSidebar } from './components/layout/Sidebar';
import { ScenarioContext, useScenarioReducer } from './hooks/useScenarios';
import { ThemeContext, useThemeProvider } from './hooks/useTheme';

export default function App() {
  const scenarioStore = useScenarioReducer();
  const themeCtx = useThemeProvider();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ThemeContext.Provider value={themeCtx}>
      <ScenarioContext.Provider value={scenarioStore}>
        <div className="flex min-h-screen bg-bg">
          {/* Desktop sidebar */}
          <div className="hidden lg:flex sticky top-0 h-screen">
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>

          {/* Mobile sidebar */}
          <MobileSidebar
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />

          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile top bar */}
            <div className="lg:hidden h-14 border-b border-border-subtle bg-surface flex items-center px-5 shrink-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-muted hover:text-text rounded-lg transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <div className="ml-3 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo flex items-center justify-center">
                  <span className="text-white text-xs font-bold">$</span>
                </div>
                <span className="text-sm font-semibold text-text">CompCalc</span>
              </div>
            </div>

            <main className="flex-1 overflow-y-auto">
              <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-8">
                <Dashboard />
              </div>
            </main>
          </div>
        </div>
      </ScenarioContext.Provider>
    </ThemeContext.Provider>
  );
}
