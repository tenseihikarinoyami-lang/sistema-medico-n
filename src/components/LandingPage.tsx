import { useState, useEffect } from 'react';

export function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white font-['Inter',sans-serif] overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[100px]" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400/5 rounded-full blur-[150px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-[#0a0e1a]/90 backdrop-blur-xl border-b border-white/5' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/alcaldia_logo.png"
              alt="Alcaldía Santiago Mariño"
              className="w-12 h-12 rounded-xl object-contain shadow-lg shadow-blue-500/20 bg-white/5 p-0.5"
            />
            <div>
              <span className="text-xl font-bold tracking-tight">
                Medi<span className="text-blue-400">Report</span>
              </span>
              <div className="text-[8px] text-white/30 tracking-[0.15em] uppercase leading-tight">Alcaldía Santiago Mariño</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition">Características</a>
            <a href="#templates" className="hover:text-white transition">Plantillas</a>
            <a href="#workflow" className="hover:text-white transition">Flujo de Trabajo</a>
          </div>
          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 hover:scale-105"
          >
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                Sistema Oficial MPPS Venezuela
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                Sistema Integral de{' '}
                <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                  Reportes Médicos
                </span>{' '}
                para Redes de{' '}
                <span className="bg-gradient-to-r from-blue-300 to-cyan-400 bg-clip-text text-transparent">
                  Salud Pública
                </span>
              </h1>

              {/* Government Branding */}
              <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                <img
                  src="/alcaldia_logo.png"
                  alt="Alcaldía Santiago Mariño"
                  className="w-16 h-16 rounded-xl object-contain bg-white/5 p-1 shadow-lg shadow-blue-500/10"
                />
                <div>
                  <div className="text-sm font-extrabold tracking-wider uppercase text-white/90">Alcaldía Santiago Mariño</div>
                  <div className="text-xs font-bold text-blue-400 tracking-wide">Carlos Guzmán</div>
                  <div className="text-[10px] text-white/40 tracking-[0.2em] uppercase font-semibold mt-0.5">Gente Que Resuelve</div>
                </div>
              </div>

              <p className="text-lg text-white/50 max-w-lg leading-relaxed">
                Plataforma digital especializada en la generación automatizada de reportes médicos institucionales basados en estándares nacionales del MPPS, con múltiples plantillas predefinidas según ASIC, RAC y formatos oficiales del Ministerio de Salud.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-2xl text-lg font-bold transition-all shadow-2xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-105 flex items-center gap-3"
                >
                  Comenzar Ahora
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-lg font-semibold transition-all hover:scale-105"
                >
                  Ver Características
                </button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-2xl font-bold text-blue-400">5+</div>
                  <div className="text-xs text-white/40">Plantillas MPPS</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <div className="text-2xl font-bold text-blue-400">100%</div>
                  <div className="text-xs text-white/40">Compatible</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <div className="text-2xl font-bold text-blue-400">Offline</div>
                  <div className="text-xs text-white/40">Disponible</div>
                </div>
              </div>
            </div>

            {/* Hero Visual - Dashboard Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent rounded-3xl blur-3xl" />
              <div className="relative bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                {/* Mini Dashboard Preview */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs text-white/30 ml-2">MediReport Dashboard</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Reportes', value: '42', color: 'from-blue-500 to-blue-700' },
                      { label: 'ASIC Activos', value: '28', color: 'from-green-500 to-green-700' },
                      { label: 'Alertas', value: '3', color: 'from-red-500 to-red-700' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className={`text-xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
                        <div className="text-[10px] text-white/40">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Mini Chart */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-xs text-white/40 mb-3">Reportes por Tipo</div>
                    <div className="flex items-end gap-2 h-20">
                      {[60, 40, 80, 30, 50, 70, 45].map((h, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm opacity-80" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  {/* Mini Table */}
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-2">
                    {['Matriz RAC Nacional', 'Emergencias CDI', 'ASIC Consolidado'].map((name, i) => (
                      <div key={name} className="flex items-center justify-between text-xs">
                        <span className="text-white/60">{name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${i === 0 ? 'bg-green-500/20 text-green-400' :
                            i === 1 ? 'bg-blue-500/20 text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400'
                          }`}>
                          {i === 0 ? 'Aprobado' : i === 1 ? 'Enviado' : 'Pendiente'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-6">
              Funcionalidades del Sistema
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Todo lo que necesita su centro de salud
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto">
              Diseñado específicamente para los flujos de trabajo del MPPS y adaptado a las necesidades de los centros de salud venezolanos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '📋',
                title: 'Plantillas Oficiales MPPS',
                desc: '5 plantillas predefinidas basadas en los formatos oficiales del Ministerio de Salud, incluyendo Matriz RAC, ASIC Consolidado y más.',
                gradient: 'from-blue-500/20 to-blue-600/5'
              },
              {
                icon: '✅',
                title: 'Validación Inteligente',
                desc: 'Sistema de validación en tiempo real que detecta inconsistencias, valores fuera de rango y campos faltantes antes de enviar el reporte.',
                gradient: 'from-green-500/20 to-green-600/5'
              },
              {
                icon: '📊',
                title: 'Exportación Excel Oficial',
                desc: 'Genera archivos Excel con el formato exacto del MPPS, incluyendo fórmulas, estilos y membrete institucional.',
                gradient: 'from-purple-500/20 to-purple-600/5'
              },
              {
                icon: '👥',
                title: 'Control por Roles',
                desc: 'Sistema de permisos diferenciado para administradores, doctores y enfermeros con flujos de aprobación integrados.',
                gradient: 'from-orange-500/20 to-orange-600/5'
              },
              {
                icon: '📡',
                title: 'Modo Offline',
                desc: 'Funciona sin conexión a internet. Los reportes se guardan localmente y se sincronizan automáticamente al recuperar la conexión.',
                gradient: 'from-cyan-500/20 to-cyan-600/5'
              },
              {
                icon: '🚨',
                title: 'Alertas Inteligentes',
                desc: 'Notificaciones automáticas para valores anómalos, reportes pendientes y plazos de entrega próximos a vencer.',
                gradient: 'from-red-500/20 to-red-600/5'
              },
              {
                icon: '📱',
                title: 'Diseño Responsivo',
                desc: 'Optimizado para tablets y dispositivos móviles. Botones grandes para uso con guantes en emergencias.',
                gradient: 'from-pink-500/20 to-pink-600/5'
              },
              {
                icon: '🔒',
                title: 'Seguridad Médica',
                desc: 'Encriptación de datos, auditoría completa y cumplimiento con estándares de privacidad médica venezolanos.',
                gradient: 'from-yellow-500/20 to-yellow-600/5'
              },
              {
                icon: '📈',
                title: 'Dashboard Analítico',
                desc: 'Visualización de tendencias, indicadores clave y estadísticas en tiempo real de todos los centros de salud.',
                gradient: 'from-indigo-500/20 to-indigo-600/5'
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`group relative bg-gradient-to-br ${feature.gradient} border border-white/5 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-6">
              Plantillas de Reportes
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Formatos Oficiales del MPPS
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto">
              Basados en los archivos Excel oficiales del Ministerio del Poder Popular para la Salud
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Matriz RAC Nacional', freq: 'SEMANAL', color: '#3B82F6', icon: '📊', desc: 'Red de Atención Comunal' },
              { name: 'Estadísticas por Especialidad', freq: 'MENSUAL', color: '#EF4444', icon: '🏥', desc: 'Emergencias y consultas CDI' },
              { name: 'Indicadores ASIC', freq: 'SEMANAL', color: '#10B981', icon: '📈', desc: 'Consolidado por ASIC' },
              { name: 'Resumen Semanal CDI', freq: 'SEMANAL', color: '#8B5CF6', icon: '📅', desc: 'Actividades del CDI' },
              { name: 'Actividades Diarias MBA', freq: 'DIARIO', color: '#F59E0B', icon: '📝', desc: 'Misión Barrio Adentro' },
            ].map((template, index) => (
              <div
                key={template.name}
                className="group relative bg-[#111827]/60 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-40 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${template.color}15, ${template.color}05)` }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl opacity-40">{template.icon}</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider" style={{ background: `${template.color}20`, color: template.color }}>
                      {template.freq}
                    </span>
                  </div>
                  {/* Decorative lines */}
                  <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${template.color}40, transparent)` }} />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-white/40">{template.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-6">
              Flujo de Trabajo
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              4 pasos para generar su reporte
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Seleccionar Plantilla', desc: 'Elija entre 5 plantillas oficiales del MPPS' },
              { step: '02', title: 'Configurar Reporte', desc: 'Defina centro de salud, periodo y especialidad' },
              { step: '03', title: 'Ingresar Datos', desc: 'Formularios dinámicos con validación en tiempo real' },
              { step: '04', title: 'Exportar', desc: 'Genere Excel oficial o PDF con membrete MPPS' },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                {i < 3 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-blue-500/40 to-transparent z-10" />
                )}
                <div className="bg-[#111827]/60 border border-white/5 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-lg font-bold mb-4 shadow-lg shadow-blue-600/20">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-white/40">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/10 border border-blue-500/20 rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para transformar sus reportes médicos?
            </h2>
            <p className="text-white/50 mb-8 max-w-lg mx-auto">
              Los centros de salud de toda Venezuela ya usan MediReport para generar reportes oficiales del MPPS en minutos. Acceda con sus credenciales proporcionadas por el administrador.
            </p>
            <button
              onClick={onGetStarted}
              className="px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-2xl text-lg font-bold transition-all shadow-2xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-105"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/alcaldia_logo.png"
                alt="Alcaldía Santiago Mariño"
                className="w-10 h-10 rounded-lg object-contain bg-white/5 p-0.5"
              />
              <div>
                <span className="font-semibold">Medi<span className="text-blue-400">Report</span></span>
                <div className="text-[8px] text-white/25 tracking-wider uppercase">Alcaldía Santiago Mariño · Carlos Guzmán · Gente Que Resuelve</div>
              </div>
            </div>
            <p className="text-sm text-white/30 text-center md:text-right">
              © 2025 MediReport — Sistema Integral de Reportes Médicos — MPPS Venezuela
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
