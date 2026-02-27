import { useAppStore } from './store';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { ReportWizard } from './components/ReportWizard';
import { ReportsView } from './components/ReportsView';
import { AlertsView } from './components/AlertsView';
import { ProfileView } from './components/ProfileView';
import { UsersView } from './components/UsersView';
import { Sidebar } from './components/Sidebar';

export function App() {
  const store = useAppStore();

  if (store.isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (store.currentView === 'landing') {
    return <LandingPage onGetStarted={() => store.setCurrentView('login')} />;
  }

  if (store.currentView === 'login') {
    return <LoginPage onLogin={store.login} onBack={() => store.setCurrentView('landing')} />;
  }

  // If user must change password or profile incomplete, only show profile view
  if (store.currentUser?.mustChangePassword || !store.currentUser?.profileCompleted) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-white font-['Inter',sans-serif]">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight">
                  Medi<span className="text-blue-400">Report</span>
                </span>
                <div className="text-[9px] text-white/30 tracking-[0.15em] uppercase">MPPS Venezuela</div>
              </div>
            </div>
            <button
              onClick={store.logout}
              className="flex items-center gap-2 px-4 py-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
          <ProfileView store={store} />
        </div>
      </div>
    );
  }

  const viewTitles: Record<string, string> = {
    dashboard: 'Panel Principal',
    wizard: 'Crear Nuevo Reporte',
    reports: 'Gestión de Reportes',
    alerts: 'Centro de Alertas',
    profile: 'Mi Perfil',
    users: 'Gestión de Usuarios',
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white font-['Inter',sans-serif]">
      <Sidebar store={store} />
      <div className={`transition-all duration-300 ${store.sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
        <Header store={store} viewTitle={viewTitles[store.currentView] || ''} />
        <main className="p-4 md:p-6 lg:p-8 pt-24 md:pt-28">
          {store.currentView === 'dashboard' && <Dashboard store={store} />}
          {store.currentView === 'wizard' && <ReportWizard store={store} />}
          {store.currentView === 'reports' && <ReportsView store={store} />}
          {store.currentView === 'alerts' && <AlertsView store={store} />}
          {store.currentView === 'profile' && <ProfileView store={store} />}
          {store.currentView === 'users' && <UsersView store={store} />}
        </main>
      </div>
    </div>
  );
}

function Header({ store, viewTitle }: { store: ReturnType<typeof useAppStore>; viewTitle: string }) {
  const unreadAlerts = store.alerts.filter(a => !a.read).length;

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-auto z-30 bg-[#0d1225]/90 backdrop-blur-xl border-b border-white/5 px-4 md:px-6 lg:px-8 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => store.setSidebarOpen(!store.sidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-white/90">{viewTitle}</h1>
            <p className="text-xs text-white/40">{new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => store.setCurrentView('alerts')}
            className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold animate-pulse">
                {unreadAlerts}
              </span>
            )}
          </button>
          <button
            onClick={() => store.setCurrentView('profile')}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-sm font-bold">
              {store.currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="text-sm">
              <p className="font-medium text-white/90">{store.currentUser?.name}</p>
              <p className="text-[10px] text-white/40 capitalize">{store.currentUser?.role}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
