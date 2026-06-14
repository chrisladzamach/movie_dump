import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Inicio', icon: '🏠' },
  { to: '/search', label: 'Buscar', icon: '🔍' },
  { to: '/watchlist', label: 'Watchlist', icon: '📋' },
  { to: '/stats', label: 'Stats', icon: '📊' },
  { to: '/profile', label: 'Perfil', icon: '👤' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-lg border-t border-white/10 safe-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full text-xs transition-colors ${
                isActive ? 'text-primary' : 'text-muted'
              }`
            }
          >
            <span className="text-lg mb-0.5">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
