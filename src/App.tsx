import { NavLink, Route, Routes } from 'react-router-dom';
import { CalendarPage } from './pages/CalendarPage';
import { CardGridPage } from './pages/CardGridPage';
import { CardListPage } from './pages/CardListPage';
import { ComingSoonPage } from './pages/ComingSoonPage';

const NAV_ITEMS = [
  { to: '/', label: '카드 구분' },
  { to: '/grid', label: '카드 그리드' },
  { to: '/calendar', label: '캘린더' },
  { to: '/timeline', label: '스토리 연표' },
];

function App() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="p-4">
        <nav className="mx-auto flex w-fit max-w-4xl gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] p-1.5 shadow-sm">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-[var(--color-brand)] text-white'
                    : 'text-[var(--color-text-sub)] hover:text-[var(--color-text)]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<CardListPage />} />
          <Route path="/grid" element={<CardGridPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/timeline" element={<ComingSoonPage title="스토리 연표" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
