import { type ReactNode, useState } from 'react';
import type { useAppStore } from '../store';

type StoreType = ReturnType<typeof useAppStore>;

export function AlertsView({ store }: { store: StoreType }) {
  const [filter, setFilter] = useState<string>('all');

  const filteredAlerts = store.alerts.filter(a => {
    if (filter === 'unread') return !a.read;
    if (filter !== 'all') return a.type === filter;
    return true;
  });

  const typeIcons: Record<string, ReactNode> = {
    critical: (
      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const typeStyles: Record<string, string> = {
    critical: 'bg-red-500/10 border-red-500/20',
    warning: 'bg-yellow-500/10 border-yellow-500/20',
    info: 'bg-blue-500/10 border-blue-500/20',
  };

  const typeLabels: Record<string, string> = {
    critical: 'Crítica',
    warning: 'Advertencia',
    info: 'Información',
  };

  const markAllRead = () => {
    store.alerts.forEach(a => {
      if (!a.read) store.markAlertRead(a.id);
    });
  };

  return (
    <div className="space-y-6">
      {/* Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-white/40">
            {store.alerts.filter(a => !a.read).length} alertas sin leer de {store.alerts.length} totales
          </p>
        </div>
        <button
          onClick={markAllRead}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Marcar todas como leídas
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: store.alerts.length, color: 'from-white/10 to-white/5', textColor: 'text-white' },
          { label: 'Críticas', value: store.alerts.filter(a => a.type === 'critical').length, color: 'from-red-500/15 to-red-600/5', textColor: 'text-red-400' },
          { label: 'Advertencias', value: store.alerts.filter(a => a.type === 'warning').length, color: 'from-yellow-500/15 to-yellow-600/5', textColor: 'text-yellow-400' },
          { label: 'Información', value: store.alerts.filter(a => a.type === 'info').length, color: 'from-blue-500/15 to-blue-600/5', textColor: 'text-blue-400' },
        ].map(stat => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} border border-white/5 rounded-xl p-4`}>
            <div className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</div>
            <div className="text-xs text-white/40">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'all', label: 'Todas' },
          { value: 'unread', label: 'Sin Leer' },
          { value: 'critical', label: 'Críticas' },
          { value: 'warning', label: 'Advertencias' },
          { value: 'info', label: 'Información' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === f.value
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'bg-white/5 text-white/50 border border-white/5 hover:bg-white/10'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => (
          <div
            key={alert.id}
            className={`border rounded-2xl p-5 transition-all hover:scale-[1.005] ${typeStyles[alert.type]} ${!alert.read ? 'ring-1 ring-white/10' : 'opacity-75'
              }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${alert.type === 'critical' ? 'bg-red-500/20' :
                  alert.type === 'warning' ? 'bg-yellow-500/20' :
                    'bg-blue-500/20'
                }`}>
                {typeIcons[alert.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-sm">{alert.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${alert.type === 'critical' ? 'bg-red-500/20 text-red-400' :
                      alert.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                    }`}>
                    {typeLabels[alert.type]}
                  </span>
                  {!alert.read && (
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  )}
                </div>
                <p className="text-sm text-white/50 mb-2">{alert.detail}</p>
                <p className="text-[11px] text-white/25">{alert.meta}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[11px] text-white/20">
                    {new Date(alert.createdAt).toLocaleString('es-VE')}
                  </span>
                  {!alert.read && (
                    <button
                      onClick={() => store.markAlertRead(alert.id)}
                      className="text-[11px] text-blue-400/60 hover:text-blue-400 transition"
                    >
                      Marcar como leída
                    </button>
                  )}
                  {alert.reportId && (
                    <button
                      onClick={() => {
                        store.markAlertRead(alert.id);
                        store.setCurrentView('reports');
                      }}
                      className="text-[11px] text-blue-400/60 hover:text-blue-400 transition"
                    >
                      Ver Reporte →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="text-center py-16 bg-[#111827]/60 border border-white/5 rounded-2xl">
            <svg className="w-16 h-16 mx-auto text-white/10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-white/30 text-lg font-medium mb-2">No hay alertas</p>
            <p className="text-white/20 text-sm">No se encontraron alertas con los filtros seleccionados</p>
          </div>
        )}
      </div>
    </div>
  );
}
