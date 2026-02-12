import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { useAppStore } from '../store';

type StoreType = ReturnType<typeof useAppStore>;

const chartData = [
  { name: 'Sem 49', RAC: 12, Emergencias: 8, ASIC: 5, Semanal: 10, Diario: 28 },
  { name: 'Sem 50', RAC: 14, Emergencias: 10, ASIC: 6, Semanal: 12, Diario: 32 },
  { name: 'Sem 51', RAC: 11, Emergencias: 9, ASIC: 7, Semanal: 9, Diario: 25 },
  { name: 'Sem 52', RAC: 15, Emergencias: 12, ASIC: 8, Semanal: 14, Diario: 35 },
];

const pieData = [
  { name: 'Matriz RAC', value: 35, color: '#3B82F6' },
  { name: 'Emergencias', value: 25, color: '#EF4444' },
  { name: 'ASIC', value: 15, color: '#10B981' },
  { name: 'Semanal CDI', value: 15, color: '#8B5CF6' },
  { name: 'Diario MBA', value: 10, color: '#F59E0B' },
];

export function Dashboard({ store }: { store: StoreType }) {
  const isAdmin = store.currentUser?.role === 'administrador';
  const visibleReports = store.getVisibleReports();

  const statusColors: Record<string, string> = {
    borrador: 'bg-gray-500/20 text-gray-400',
    pendiente: 'bg-yellow-500/20 text-yellow-400',
    aprobado: 'bg-green-500/20 text-green-400',
    enviado: 'bg-blue-500/20 text-blue-400',
  };

  const statusLabels: Record<string, string> = {
    borrador: 'Borrador',
    pendiente: 'Pendiente',
    aprobado: 'Aprobado',
    enviado: 'Enviado',
  };

  const totalReports = visibleReports.length;
  const pendingReports = visibleReports.filter(r => r.status === 'pendiente').length;
  const approvedReports = visibleReports.filter(r => r.status === 'aprobado' || r.status === 'enviado').length;
  const criticalAlerts = store.alerts.filter(a => a.type === 'critical' && !a.read).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600/20 via-blue-700/10 to-transparent border border-blue-500/20 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              ¡Bienvenido/a, {store.currentUser?.name}!
            </h2>
            <p className="text-white/40 text-sm">
              {store.currentUser?.centro || 'Sin centro'} · ASIC {store.currentUser?.asic?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Sin ASIC'} · Rol: <span className="capitalize text-blue-400">{store.currentUser?.role}</span>
              {isAdmin && <span className="ml-2 text-blue-400/60">· Vista global de todos los reportes</span>}
            </p>
          </div>
          <button
            onClick={store.startWizard}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 hover:scale-105 flex items-center gap-2 self-start"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Reporte
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Reportes',
            value: totalReports,
            detail: 'Este mes',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
            gradient: 'from-blue-500 to-blue-700',
            bgGradient: 'from-blue-500/15 to-blue-600/5'
          },
          {
            label: 'Pendientes',
            value: pendingReports,
            detail: 'Requieren atención',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            gradient: 'from-yellow-500 to-orange-600',
            bgGradient: 'from-yellow-500/15 to-orange-600/5'
          },
          {
            label: 'Completados',
            value: approvedReports,
            detail: 'Aprobados / Enviados',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            gradient: 'from-green-500 to-green-700',
            bgGradient: 'from-green-500/15 to-green-600/5'
          },
          {
            label: 'Alertas Críticas',
            value: criticalAlerts,
            detail: 'Valores fuera de rango',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ),
            gradient: 'from-red-500 to-red-700',
            bgGradient: 'from-red-500/15 to-red-600/5'
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.bgGradient} border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-white/40">{stat.label}</div>
            <div className="text-[11px] text-white/25 mt-1">{stat.detail}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-[#111827]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Reportes por Tipo</h3>
              <p className="text-xs text-white/30">Últimas 4 semanas</p>
            </div>
            <div className="flex flex-wrap gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> RAC</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> EMG</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> ASIC</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> CDI</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                />
                <Bar dataKey="RAC" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Emergencias" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ASIC" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Semanal" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-2">Distribución</h3>
          <p className="text-xs text-white/30 mb-4">Por tipo de reporte</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-white/50">{d.name}</span>
                </span>
                <span className="text-white/70 font-medium">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts and Recent Reports */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Alertas Recientes</h3>
            <button
              onClick={() => store.setCurrentView('alerts')}
              className="text-xs text-blue-400 hover:text-blue-300 transition"
            >
              Ver todas →
            </button>
          </div>
          <div className="space-y-3">
            {store.alerts.slice(0, 3).map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] ${
                  alert.type === 'critical'
                    ? 'bg-red-500/10 border-red-500/20'
                    : alert.type === 'warning'
                    ? 'bg-yellow-500/10 border-yellow-500/20'
                    : 'bg-blue-500/10 border-blue-500/20'
                } ${!alert.read ? 'ring-1 ring-white/10' : ''}`}
                onClick={() => store.markAlertRead(alert.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    alert.type === 'critical' ? 'bg-red-500/20' :
                    alert.type === 'warning' ? 'bg-yellow-500/20' :
                    'bg-blue-500/20'
                  }`}>
                    {alert.type === 'critical' ? (
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : alert.type === 'warning' ? (
                      <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-1">{alert.title}</p>
                    <p className="text-xs text-white/40 line-clamp-2">{alert.detail}</p>
                    {!alert.read && <span className="inline-flex mt-2 w-2 h-2 bg-blue-400 rounded-full" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Reportes Recientes</h3>
            <button
              onClick={() => store.setCurrentView('reports')}
              className="text-xs text-blue-400 hover:text-blue-300 transition"
            >
              Ver todos →
            </button>
          </div>
          <div className="space-y-3">
            {visibleReports.slice(0, 5).map(report => (
              <div
                key={report.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{report.templateName}</p>
                  <p className="text-[11px] text-white/30">
                    {report.config.asic?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} · {new Date(report.createdAt).toLocaleDateString('es-VE')}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${statusColors[report.status]}`}>
                  {statusLabels[report.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access Templates */}
      <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Acceso Rápido a Plantillas</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { name: 'Matriz RAC', freq: 'Semanal', color: '#3B82F6', icon: '📊' },
            { name: 'Emergencias CDI', freq: 'Mensual', color: '#EF4444', icon: '🏥' },
            { name: 'ASIC Consolidado', freq: 'Semanal', color: '#10B981', icon: '📈' },
            { name: 'Resumen Semanal', freq: 'Semanal', color: '#8B5CF6', icon: '📅' },
            { name: 'Actividades MBA', freq: 'Diario', color: '#F59E0B', icon: '📝' },
          ].map(template => (
            <button
              key={template.name}
              onClick={store.startWizard}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all hover:scale-105 group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{template.icon}</span>
              <span className="text-xs font-medium text-center">{template.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${template.color}15`, color: template.color }}>
                {template.freq}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
