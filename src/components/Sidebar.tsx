import type { useAppStore } from '../store';

type StoreType = ReturnType<typeof useAppStore>;

export function Sidebar({ store }: { store: StoreType }) {
  const isAdmin = store.currentUser?.role === 'administrador';
  const isCoord = store.currentUser?.role === 'coordinador';
  const canManageUsers = isAdmin || isCoord;

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Panel Principal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'wizard' as const,
      label: 'Nuevo Reporte',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
      ),
      action: () => store.startWizard()
    },
    {
      id: 'reports' as const,
      label: 'Mis Reportes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'alerts' as const,
      label: 'Alertas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      badge: store.alerts.filter(a => !a.read).length
    },
    ...(canManageUsers ? [
      {
        id: 'users' as const,
        label: 'Gestión de Usuarios',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        ),
        badge: undefined as number | undefined
      },
    ] : []),
    {
      id: 'profile' as const,
      label: 'Mi Perfil',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {store.sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => store.setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 bg-[#0d1225] border-r border-white/5 flex flex-col
        ${store.sidebarOpen
          ? 'w-72 translate-x-0'
          : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img
              src="/alcaldia_logo.png"
              alt="Alcaldía Santiago Mariño"
              className="w-12 h-12 rounded-xl object-contain flex-shrink-0 shadow-xl shadow-blue-500/30 bg-white/[0.07] p-1 ring-1 ring-white/10"
            />
            {store.sidebarOpen && (
              <div>
                <span className="text-lg font-bold tracking-tight">
                  Medi<span className="text-blue-400">Report</span>
                </span>
                <div className="text-[8px] text-white/30 tracking-[0.15em] uppercase leading-tight">Alcaldía Santiago Mariño</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const isActive = store.currentView === item.id;
            // Add separator before profile
            const showSeparator = item.id === 'users' || (item.id === 'profile' && !canManageUsers);
            return (
              <div key={item.id}>
                {showSeparator && index > 0 && (
                  <div className="my-3 h-px bg-white/5" />
                )}
                <button
                  onClick={() => {
                    if ('action' in item && item.action) {
                      item.action();
                    } else {
                      store.setCurrentView(item.id);
                    }
                    store.setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative
                    ${isActive
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`}
                  title={!store.sidebarOpen ? item.label : undefined}
                >
                  <div className={`flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-white/40 group-hover:text-white/70'}`}>
                    {item.icon}
                  </div>
                  {store.sidebarOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  {item.badge && item.badge > 0 && (
                    <span className={`${store.sidebarOpen ? 'ml-auto' : 'absolute -top-1 -right-1'} w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Toggle button (desktop) */}
        <div className="hidden lg:block p-3 border-t border-white/5">
          <button
            onClick={() => store.setSidebarOpen(!store.sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 transition"
          >
            <svg className={`w-5 h-5 transition-transform ${store.sidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {store.sidebarOpen && <span className="text-sm">Colapsar</span>}
          </button>
        </div>

        {/* User info */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => { store.setCurrentView('profile'); store.setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 ${store.sidebarOpen ? '' : 'justify-center'} p-2 rounded-xl hover:bg-white/5 transition`}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {store.currentUser?.name?.charAt(0) || 'U'}
            </div>
            {store.sidebarOpen && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-white/80 truncate">{store.currentUser?.name}</p>
                <p className="text-[10px] text-white/30 capitalize">@{store.currentUser?.username} · {store.currentUser?.role}</p>
              </div>
            )}
          </button>
          {store.sidebarOpen && (
            <button
              onClick={store.logout}
              className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
